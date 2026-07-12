import net from "node:net";
import type { Position } from "@bali-moto-track/shared-types";
import { env } from "../config/env.js";
import { publishPosition } from "./live-store.js";

// Servidor TCP que habla el protocolo H02 (ASCII) DIRECTAMENTE con el tracker
// GPS — ej. SinoTrack ST-901 — sin pasar por Traccar. El equipo se apunta a
// este host:puerto por SMS (comando 804<pass> <ip> <puerto>).
//
// Un mensaje de posición se ve así:
//   *HQ,<id>,V1,<hhmmss>,<A/V>,<lat ddmm.mmmm>,<N/S>,<lon dddmm.mmmm>,<E/W>,<speed>,<course>,<ddmmyy>,<status>#

const KNOTS_TO_KMH = 1.852;

// Convierte una coordenada H02 (ddmm.mmmm / dddmm.mmmm) a grados decimales.
function parseCoord(raw: string, hemisphere: string): number | null {
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const degrees = Math.floor(value / 100);
  const minutes = value - degrees * 100;
  let result = degrees + minutes / 60;
  if (hemisphere === "S" || hemisphere === "W") result = -result;
  return result;
}

// Arma un ISO timestamp desde la hora (hhmmss) y fecha (ddmmyy) UTC del equipo.
function parseTimestamp(hhmmss: string, ddmmyy: string): string {
  if (hhmmss?.length === 6 && ddmmyy?.length === 6) {
    const iso = `20${ddmmyy.slice(4, 6)}-${ddmmyy.slice(2, 4)}-${ddmmyy.slice(0, 2)}T${hhmmss.slice(0, 2)}:${hhmmss.slice(2, 4)}:${hhmmss.slice(4, 6)}Z`;
    const parsed = Date.parse(iso);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  return new Date().toISOString();
}

// Parsea un mensaje H02 de posición. Devuelve null si no es una posición válida.
export function parseH02(message: string): Position | null {
  const clean = message.replace(/^[*$]/, "").replace(/#$/, "");
  const t = clean.split(",");
  if (t[0] !== "HQ" || t[2] !== "V1") return null; // sólo mensajes de posición (V1)

  const id = t[1];
  const latitude = parseCoord(t[5], t[6]);
  const longitude = parseCoord(t[7], t[8]);
  if (!id || latitude === null || longitude === null) return null;

  return {
    vehicleId: id,
    tenantId: "demo-tenant",
    latitude,
    longitude,
    speedKmh: Math.round((Number(t[9]) || 0) * KNOTS_TO_KMH),
    heading: Math.round(Number(t[10]) || 0),
    ignition: null, // el H02 básico no reporta ignición confiable
    batteryLevel: null,
    recordedAt: parseTimestamp(t[3], t[11]),
  };
}

export function startH02Server(): net.Server {
  const server = net.createServer((socket) => {
    const peer = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[gps] tracker conectado desde ${peer}`);
    let buffer = "";

    socket.on("data", (chunk) => {
      buffer += chunk.toString("latin1");
      // Los mensajes terminan en '#'. Procesamos los completos y dejamos el resto
      // en el buffer por si un mensaje llegó partido en varios paquetes TCP.
      let end: number;
      while ((end = buffer.indexOf("#")) >= 0) {
        const raw = buffer.slice(0, end + 1);
        buffer = buffer.slice(end + 1);
        const start = raw.search(/[*$]/);
        if (start < 0) continue;
        try {
          const position = parseH02(raw.slice(start));
          if (position) {
            publishPosition(position);
            console.log(`[gps] ${position.vehicleId} -> ${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)} (${position.speedKmh} km/h)`);
          }
        } catch (err) {
          console.warn("[gps] no se pudo parsear:", raw.trim(), (err as Error).message);
        }
      }
    });

    socket.on("error", (err) => console.warn(`[gps] error de socket ${peer}:`, err.message));
    socket.on("close", () => console.log(`[gps] tracker desconectado ${peer}`));
  });

  server.listen(env.gpsTcpPort, "0.0.0.0", () => {
    console.log(`[gps] servidor H02 escuchando en el puerto ${env.gpsTcpPort} — apuntá el tracker acá`);
  });

  return server;
}
