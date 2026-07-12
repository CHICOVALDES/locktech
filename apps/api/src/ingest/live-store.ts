import type { Position } from "@bali-moto-track/shared-types";

// Almacén en memoria de las últimas posiciones reales, más un bus de suscriptores.
// El servidor TCP (h02-server) publica acá; el gateway WebSocket (live-gateway)
// se suscribe y reenvía a los navegadores. Puente entre el tracker y el mapa.

type Subscriber = (position: Position) => void;

const latest = new Map<string, Position>();
const subscribers = new Set<Subscriber>();

export function publishPosition(position: Position): void {
  latest.set(position.vehicleId, position);
  for (const sub of subscribers) sub(position);
}

// Estado actual de todos los equipos (para el snapshot inicial de un cliente nuevo).
export function snapshot(): Position[] {
  return [...latest.values()];
}

export function subscribe(sub: Subscriber): () => void {
  subscribers.add(sub);
  return () => subscribers.delete(sub);
}
