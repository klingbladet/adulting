FROM node:25-alpine AS builder

WORKDIR /app

RUN npm install --global pnpm@10.32.0

COPY ./package.json ./pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . /app

ENV NEXT_IGNORE_TYPE_ERRORS=true

RUN pnpm run build


FROM node:25-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
