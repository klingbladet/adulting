FROM node:25-alpine

WORKDIR /app

RUN npm install --global pnpm@latest

COPY ./package.json ./package.json

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
