import type { FastifyInstance } from "fastify";
import type { Position } from "@bali-moto-track/shared-types";
import { snapshot, subscribe } from "../ingest/live-store.js";

// Gateway de GPS REAL. Reenvía por WebSocket las posiciones que el tracker manda
// al servidor TCP H02 (ver ingest/h02-server). Mismo formato que la demo, así el
// front no distingue la fuente.
//
// Los trackers reales (SinoTrack/H02) sólo mandan posición, no telemetría de
// motor, por eso telemetry va vacío — el front lo maneja como null.

export async function liveRealtimeRoutes(app: FastifyInstance) {
  app.get("/realtime/live", { websocket: true }, (socket) => {
    const send = (positions: Position[]) => {
      if (positions.length === 0) return;
      socket.send(JSON.stringify({ type: "tick", positions, telemetry: [] }));
    };

    // Snapshot inicial: mostramos de una las últimas posiciones conocidas.
    send(snapshot());

    // Y después, cada nueva posición a medida que el tracker reporta.
    const unsubscribe = subscribe((position) => send([position]));
    socket.on("close", unsubscribe);
  });
}
