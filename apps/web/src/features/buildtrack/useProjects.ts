import { useEffect, useState } from "react";
import type { Project } from "@bali-moto-track/shared-types";

// Base de la API: mismo origen que sirve la página (en dev, Vite proxya /buildtrack
// al API :3000; en prod la API sirve el front). Se puede forzar con VITE_API_WS_BASE
// convertido a http(s) — reutilizamos el mismo criterio que el WS.
const API_BASE = import.meta.env.VITE_API_HTTP_BASE ?? "";

export type LoadStatus = "loading" | "ready" | "error";

// Trae el listado de obras desde la API de BuildTrack.
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetch(`${API_BASE}/buildtrack/projects`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ projects: Project[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        setProjects(data.projects);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, status };
}
