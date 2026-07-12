import type { FastifyInstance } from "fastify";
import { pool } from "../db/client.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.get("/health/db", async (_req, reply) => {
    try {
      await pool.query("SELECT 1");
      return { status: "ok" };
    } catch (err) {
      reply.code(503);
      return { status: "error", message: (err as Error).message };
    }
  });
}
