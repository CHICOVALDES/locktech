FROM node:20-slim
WORKDIR /repo

RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile=false --filter @bali-moto-track/web...

WORKDIR /repo/apps/web
EXPOSE 5173
CMD ["pnpm", "dev", "--", "--host"]
