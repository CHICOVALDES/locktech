# Bali Moto Track

Plataforma GPS antirrobo multi-tenant para rentals de motos en Bali. Ver el plan de
arquitectura completo en `docs/` (o pedirle a Claude que lo recupere del historial).

## Requisitos

- Node.js 20+
- pnpm 9.x (`npm install -g pnpm@9.12.0` si tenés Node 20; las versiones más nuevas de pnpm requieren Node 22+)
- Docker Desktop (para Postgres, Redis y Traccar)

## Levantar todo en local

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d postgres redis traccar
pnpm dev
```

- API: http://localhost:3000/health
- Web: http://localhost:5173
- Traccar (admin interno): http://localhost:8082

## Probar sin hardware real (simulador)

Con Traccar corriendo (puerto OsmAnd 5055 expuesto), simula motos moviéndose en Bali:

```bash
node infra/simulator/simulate-devices.mjs
```

Esto valida el pipeline de ingesta (Traccar recibe posiciones y las expone por su API/WebSocket),
pero **no reemplaza validar los decoders binarios reales de GT06/Teltonika** — eso requiere
una unidad física de cada modelo de tracker antes de confiar en la ingesta de dispositivos reales.
