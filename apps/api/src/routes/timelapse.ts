import type { FastifyInstance } from "fastify";
import { captureFrame } from "../capture/timelapse.js";

// Captura bajo demanda: útil para probar sin esperar a un horario, o para forzar
// una toma manual. Guarda con el slot que se pida (default = hora actual).
export async function timelapseRoutes(app: FastifyInstance) {
  app.post<{ Body: { slot?: string } | undefined }>("/timelapse/capture-now", async (req, reply) => {
    const now = new Date();
    const slot = req.body?.slot ?? `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    try {
      const file = await captureFrame(slot);
      return { ok: true, slot, file };
    } catch (err) {
      reply.code(502);
      return { ok: false, error: (err as Error).message };
    }
  });
}
