# Imagen única para deploy en la nube (Koyeb): construye web + API y corre un
# solo servicio Node donde la API sirve además el frontend compilado (WS a mismo
# origen). Single-stage a propósito: pnpm workspaces usa symlinks que no
# sobreviven un copy naive entre etapas, así el workspace queda intacto.
FROM node:22-slim

WORKDIR /app
RUN corepack enable

# Copiamos todo el monorepo y construimos.
COPY . .
RUN pnpm install --no-frozen-lockfile && pnpm build

# La API lee PORT del entorno; Koyeb enruta al puerto que exponemos.
ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

# La API sirve el frontend (apps/web/dist) porque NODE_ENV=production.
CMD ["node", "apps/api/dist/server.js"]
