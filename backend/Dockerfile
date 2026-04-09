FROM node:25-alpine

WORKDIR /app

RUN npm install --global pnpm@latest

COPY ./package.json ./package.json

RUN pnpm install

COPY . .

RUN chmod 0755 ./generate_and_migrate.sh

EXPOSE 3001

CMD ["pnpm", "run", "dev"]
