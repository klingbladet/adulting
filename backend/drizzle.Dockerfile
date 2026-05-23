FROM node:25-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.32.0 --activate

COPY ./package.json ./pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .
