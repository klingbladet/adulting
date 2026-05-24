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




FROM base AS builder

RUN npm install --global esbuild

RUN npx esbuild src/server.ts --bundle --platform=node --target=node25 --outfile=dist/server.js

RUN pnpm prune --prod




FROM node:25-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/server.js"]
