FROM node:25-alpine

WORKDIR /app

RUN npm install --global pnpm@latest

COPY ./package.json ./pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
