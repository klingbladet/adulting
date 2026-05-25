FROM node:25-alpine AS base

WORKDIR /app

RUN apk add --no-cache curl

RUN npm install --global pnpm@10.32.0

COPY ./package.json ./pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . /app

HEALTHCHECK --interval=5s --timeout=2s --start-period=10s --start-interval=1s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001


#
# backend server
#
FROM base AS builder

RUN npm install --global esbuild@0.28.0

RUN npx esbuild src/server.ts --bundle --platform=node --target=node25 --outfile=dist/server.js

RUN pnpm prune --prod



FROM node:25-alpine AS backend

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/server.js"]


#
# MCP server
#
FROM base AS builder-mcp

RUN npm install --global esbuild@0.28.0

RUN npx esbuild ./src/mcp/http-server.ts --bundle --platform=node --target=node25 --outfile=dist/server.js

RUN pnpm prune --prod



FROM node:25-alpine AS mcp

WORKDIR /app

COPY --from=builder-mcp /app/dist ./dist
COPY --from=builder-mcp /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/server.js"]






#
# drizzle migration
#

FROM node:25-alpine AS migrate

WORKDIR /app

RUN npm install --global pnpm@10.32.0

COPY ./package.json ./pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY ./drizzle.config.ts ./
COPY ./drizzle/ ./drizzle/
COPY ./src/db ./src/db
