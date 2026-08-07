FROM node:24-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.11.0 --activate

COPY package.json pnpm-lock.yaml ./
ENV CI=true
RUN pnpm install

COPY . .
CMD [ "pnpm", "run", "dev", "--host" ]
