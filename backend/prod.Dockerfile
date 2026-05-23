FROM node:25-alpine AS builder

WORKDIR /app

RUN npm install --global pnpm@10.32.0

RUN npm install --global esbuild

COPY ./package.json ./pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . /app

RUN npx esbuild src/server.ts --bundle --platform=node --target=node25 --outfile=dist/server.js

RUN pnpm prune --prod


FROM node:25-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/server.js"]
