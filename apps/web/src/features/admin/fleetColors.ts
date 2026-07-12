import { LIVERY_PRESETS } from "../customization/presets.js";

// Color de acento por moto para la vista de flota del admin. Si el usuario ya
// tuneó la moto en el TuningPanel se respeta ese color; si no, se usa este mapa
// por defecto (colores reales de cada unidad), y como último recurso se cicla la
// paleta de liveries para que cada tarjeta tenga un color distinto.
const DEFAULT_FLEET_COLORS: Record<string, string> = {
  "RM-XMAX-180": "#d81e2c", // Rojo Racing
  "CV-NMAX-365": "#17c4c4", // Turquesa Tropical
};

export function fleetAccentColor(vehicleId: string, index: number): string {
  const explicit = DEFAULT_FLEET_COLORS[vehicleId];
  if (explicit) return explicit;
  return LIVERY_PRESETS[index % LIVERY_PRESETS.length].primary;
}
