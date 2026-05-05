FROM node:25-alpine

WORKDIR /app

RUN apk add --no-cache curl

RUN npm install --global pnpm@latest

COPY ./package.json ./pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . /app

HEALTHCHECK --interval=5s --timeout=2s --start-period=10s --start-interval=1s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

EXPOSE 3000
