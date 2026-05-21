FROM node:25-alpine AS base

WORKDIR /app

RUN apk add --no-cache curl

RUN npm install --global pnpm@latest

COPY ./package.json ./pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . /app

HEALTHCHECK --interval=5s --timeout=2s --start-period=10s --start-interval=1s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

EXPOSE 3000




FROM base AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_AUTH_URL=""

ENV NEXT_IGNORE_TYPE_ERRORS=true
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AUTH_URL=${NEXT_PUBLIC_AUTH_URL}

RUN echo "Build-time NEXT_PUBLIC_API_URL: '$NEXT_PUBLIC_API_URL'"
RUN echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" > .env.production
RUN echo "NEXT_PUBLIC_AUTH_URL=${NEXT_PUBLIC_AUTH_URL}" >> .env.production

RUN pnpm run build




FROM node:25-alpine

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
