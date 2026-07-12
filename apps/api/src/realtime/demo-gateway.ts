import type { FastifyInstance } from "fastify";
import { startDemoSimulation } from "../demo/simulation.js";

export async function demoRealtimeRoutes(app: FastifyInstance) {
  app.get("/realtime/demo", { websocket: true }, (socket) => {
    const stop = startDemoSimulation((tick) => {
      socket.send(JSON.stringify({ type: "tick", positions: tick.positions, telemetry: tick.telemetry }));
    });

    socket.on("close", stop);
  });
}
