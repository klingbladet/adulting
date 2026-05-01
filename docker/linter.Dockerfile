FROM node:25-alpine

WORKDIR /app

RUN npm init @eslint/config@latest

CMD ["npx", "eslint" "."]
