import type { FastifyInstance } from "fastify";
import { getProject, listProjects } from "./store.js";

// Rutas de BuildTrack (Construction Intelligence). Primer slice: listado de obras
// y detalle por id, desde el store in-memory. Ver docs/buildtrack-prd.md.
export async function buildtrackRoutes(app: FastifyInstance) {
  app.get("/buildtrack/projects", async () => {
    return { projects: listProjects() };
  });

  app.get("/buildtrack/projects/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const project = getProject(id);
    if (!project) {
      reply.code(404);
      return { error: "project not found" };
    }
    return { project };
  });
}
