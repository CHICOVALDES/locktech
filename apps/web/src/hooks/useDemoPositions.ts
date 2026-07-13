import { useEffect, useRef, useState } from "react";
import type { MotoTelemetry, Position } from "@bali-moto-track/shared-types";
import { startClientSimulation } from "./clientSimulation.js";

export type ConnectionStatus = "connecting" | "open" | "closed";

// Modo demo estático (build para Vercel/Netlify): sin servidor, las motos se
// simulan en el navegador. Se activa con VITE_STATIC_DEMO=1 en el build.
const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "1" || import.meta.env.VITE_STATIC_DEMO === "true";

// Base del WebSocket: por defecto el MISMO origen con el que se abrió la página
// (Vite proxya /realtime al API en :3000). Así funciona en localhost, desde el
// celular por IP de red, y a través de un túnel público (https -> wss). Se puede
// forzar otra API con VITE_API_WS_BASE. El path (/realtime/demo o /realtime/live)
// lo elige quien llama al hook.
const WS_BASE =
  import.meta.env.VITE_API_WS_BASE ??
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

export interface VehicleState {
  position: Position;
  telemetry: MotoTelemetry | null;
}

// Se conecta al canal de tiempo real indicado. Cambiar `path` reconecta al otro
// canal, por eso el efecto depende de él.
export function useRealtimePositions(path: string) {
  const [vehicles, setVehicles] = useState<Record<string, VehicleState>>({});
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Al cambiar de fuente arrancamos de cero para no mezclar motos demo y reales.
    setVehicles({});

    // En el build estático no hay WebSocket: corremos el simulador local.
    if (STATIC_DEMO) {
      setStatus("open");
      const stop = startClientSimulation((message) => {
        setVehicles((prev) => {
          const next = { ...prev };
          for (const position of message.positions) next[position.vehicleId] = { ...next[position.vehicleId], position };
          for (const telemetry of message.telemetry) next[telemetry.vehicleId] = { ...next[telemetry.vehicleId], telemetry } as VehicleState;
          return next;
        });
      });
      return stop;
    }

    setStatus("connecting");
    const socket = new WebSocket(`${WS_BASE}${path}`);
    socketRef.current = socket;

    socket.onopen = () => setStatus("open");
    socket.onclose = () => setStatus("closed");
    socket.onerror = () => setStatus("closed");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as { type: string; positions: Position[]; telemetry: MotoTelemetry[] };
      if (message.type !== "tick") return;

      setVehicles((prev) => {
        const next = { ...prev };
        for (const position of message.positions) {
          next[position.vehicleId] = { ...next[position.vehicleId], position };
        }
        for (const telemetry of message.telemetry) {
          next[telemetry.vehicleId] = {
            ...next[telemetry.vehicleId],
            telemetry,
          } as VehicleState;
        }
        return next;
      });
    };

    return () => socket.close();
  }, [path]);

  return { vehicles: Object.values(vehicles), status };
}

// Compatibilidad: el canal de simulación de la Fase 0.
export function useDemoPositions() {
  return useRealtimePositions("/realtime/demo");
}
