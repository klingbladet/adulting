FROM node:25-alpine

WORKDIR /app

RUN apk add --no-cache curl

RUN npm install --global pnpm@10.32.0

COPY ./package.json ./pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . /app

HEALTHCHECK --interval=5s --timeout=2s --start-period=10s --start-interval=1s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001
