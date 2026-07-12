import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { healthRoutes } from "./routes/health.js";
import { demoRealtimeRoutes } from "./realtime/demo-gateway.js";
import { liveRealtimeRoutes } from "./realtime/live-gateway.js";
import { startH02Server } from "./ingest/h02-server.js";
import { timelapseRoutes } from "./routes/timelapse.js";
import { startTimelapseScheduler } from "./capture/timelapse.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(websocket);
await app.register(healthRoutes);
await app.register(demoRealtimeRoutes);
await app.register(liveRealtimeRoutes);
await app.register(timelapseRoutes);

app.listen({ port: env.port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});

// Servidor TCP para trackers GPS reales (protocolo H02, ej. SinoTrack ST-901).
startH02Server();

// Time-lapse "Recovery": 4 capturas diarias del stream online a horarios fijos.
startTimelapseScheduler();
