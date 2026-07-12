import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { healthRoutes } from "./routes/health.js";
import { demoRealtimeRoutes } from "./realtime/demo-gateway.js";
import { liveRealtimeRoutes } from "./realtime/live-gateway.js";
import { startH02Server } from "./ingest/h02-server.js";
import { timelapseRoutes } from "./routes/timelapse.js";
import { startTimelapseScheduler } from "./capture/timelapse.js";

const app = Fastify({ logger: true });
const isProd = process.env.NODE_ENV === "production";

await app.register(cors, { origin: true });
await app.register(websocket);
await app.register(healthRoutes);
await app.register(demoRealtimeRoutes);
await app.register(liveRealtimeRoutes);
await app.register(timelapseRoutes);

// En producción (deploy en Render) la API sirve TAMBIÉN el frontend ya compilado
// (apps/web/dist). Así todo vive en un solo servicio y el WebSocket queda a
// mismo origen (wss://<host>/realtime/...), sin CORS ni segunda URL. En dev no
// aplica: el front lo sirve Vite en :5173 y proxya /realtime al API.
if (isProd) {
  const webDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../web/dist");
  await app.register(fastifyStatic, { root: webDist, wildcard: false });
  app.setNotFoundHandler((req, reply) => {
    const url = req.raw.url ?? "";
    // Las rutas de API/tiempo real NO caen al SPA: 404 limpio.
    if (url.startsWith("/realtime") || url.startsWith("/health") || url.startsWith("/timelapse")) {
      reply.code(404).send({ error: "not found" });
      return;
    }
    // Resto de rutas = navegación del SPA -> index.html
    reply.sendFile("index.html");
  });
}

app.listen({ port: env.port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});

// Servidor TCP para trackers GPS reales (protocolo H02, ej. SinoTrack ST-901).
startH02Server();

// Time-lapse "Recovery": 4 capturas diarias del stream online a horarios fijos.
startTimelapseScheduler();
