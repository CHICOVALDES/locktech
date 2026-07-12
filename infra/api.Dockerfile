FROM node:20-slim
WORKDIR /repo

RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile=false --filter @bali-moto-track/api...

WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["pnpm", "dev"]
