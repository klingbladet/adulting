FROM node:25-alpine

WORKDIR /app

RUN npm install --global pnpm@latest

COPY ./package.json ./package.json

RUN pnpm install

COPY . .

EXPOSE 3001

CMD ["pnpm", "run", "dev"]
