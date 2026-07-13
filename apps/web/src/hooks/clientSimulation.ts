import type { MotoTelemetry, Position } from "@bali-moto-track/shared-types";

// Simulación de motos EN EL NAVEGADOR — espejo de apps/api/src/demo/simulation.ts.
// Se usa solo en el build estático (VITE_STATIC_DEMO), cuando no hay servidor/API:
// permite presentar el demo con las motos moviéndose desde un hosting estático
// (Vercel/Netlify), sin depender de la PC. Misma lógica que el servidor: interpola
// por la ruta, deriva rumbo y velocidad, y arma la telemetría de motor.

interface RouteDef {
  vehicleId: string;
  waypoints: [number, number][]; // [lat, lon]
}

const routeDefs: RouteDef[] = [
  { vehicleId: "CV-NMAX-365", waypoints: [[-8.6698, 115.1685], [-8.6715, 115.1702], [-8.6733, 115.168], [-8.6712, 115.166]] },
  { vehicleId: "VB-AEROX-155", waypoints: [[-8.648, 115.14], [-8.652, 115.145], [-8.656, 115.142], [-8.651, 115.138]] },
  { vehicleId: "VB-PCX-160", waypoints: [[-8.685, 115.155], [-8.682, 115.16], [-8.679, 115.157], [-8.683, 115.152]] },
];

interface StaticAsset {
  vehicleId: string;
  lat: number;
  lon: number;
  kind: "vehicle" | "casa";
}

const staticAssets: StaticAsset[] = [
  { vehicleId: "RM-XMAX-180", lat: -8.6206, lon: 115.0894, kind: "vehicle" },
  { vehicleId: "CASA-CHICO", lat: -8.7184, lon: 115.169, kind: "casa" },
];

interface RuntimeRoute {
  vehicleId: string;
  points: [number, number][];
}

const routes: RuntimeRoute[] = routeDefs.map((r) => ({ vehicleId: r.vehicleId, points: r.waypoints }));

// Intenta rutas reales por calle (OSRM público, con CORS) — igual que el server.
// Si falla, se queda con los waypoints en línea recta (la demo igual se mueve).
async function loadRealRoutes(): Promise<void> {
  await Promise.all(
    routeDefs.map(async (def) => {
      try {
        const loop = [...def.waypoints, def.waypoints[0]];
        const coords = loop.map(([lat, lon]) => `${lon},${lat}`).join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
        if (!res.ok) return;
        const data = (await res.json()) as { routes: { geometry: { coordinates: [number, number][] } }[] };
        const pts = data.routes[0]?.geometry.coordinates;
        if (!pts || pts.length < 2) return;
        const route = routes.find((r) => r.vehicleId === def.vehicleId);
        if (route) route.points = pts.map(([lon, lat]) => [lat, lon]);
      } catch {
        // se mantiene el fallback en línea recta
      }
    }),
  );
}

function interpolate([lat1, lon1]: [number, number], [lat2, lon2]: [number, number], t: number): [number, number] {
  return [lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t];
}

function bearing([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

interface RouteState {
  segment: number;
  t: number;
  fuelPct: number;
  odometerKm: number;
  engineTempC: number;
  altitudeM: number;
  tick: number;
}

const state = new Map<string, RouteState>(
  routeDefs.map((r) => [r.vehicleId, { segment: 0, t: 0, fuelPct: 100, odometerKm: 1200 + Math.random() * 3000, engineTempC: 88, altitudeM: 80, tick: Math.random() * 100 }]),
);

export interface DemoTick {
  positions: Position[];
  telemetry: MotoTelemetry[];
}

function tick(): DemoTick {
  const positions: Position[] = [];
  const telemetry: MotoTelemetry[] = [];

  for (const route of routes) {
    const s = state.get(route.vehicleId)!;
    const a = route.points[s.segment];
    const b = route.points[(s.segment + 1) % route.points.length];
    const [latitude, longitude] = interpolate(a, b, s.t);
    const heading = bearing(a, b);
    const speedKmh = 20 + Math.round(Math.random() * 20);

    const segmentStep = Math.max(0.05, Math.min(0.4, 4 / route.points.length));
    s.t += segmentStep;
    if (s.t >= 1) {
      s.t = 0;
      s.segment = (s.segment + 1) % route.points.length;
    }

    s.tick += 1;
    s.odometerKm += speedKmh * 0.03;
    s.fuelPct = Math.max(0, s.fuelPct - 0.05);
    if (s.fuelPct <= 2) s.fuelPct = 100;
    s.engineTempC += (Math.random() - 0.45) * 1.5;
    s.engineTempC = Math.min(112, Math.max(75, s.engineTempC));
    s.altitudeM = 90 + Math.sin(s.tick / 12) * 60 + Math.random() * 8;
    const rpm = Math.min(11500, Math.round(1400 + speedKmh * 140 + Math.random() * 400));

    positions.push({ vehicleId: route.vehicleId, tenantId: "demo-tenant", latitude, longitude, speedKmh, heading, ignition: true, batteryLevel: 87, recordedAt: new Date().toISOString() });
    telemetry.push({ vehicleId: route.vehicleId, rpm, fuelPct: Math.round(s.fuelPct), engineTempC: Math.round(s.engineTempC * 10) / 10, odometerKm: Math.round(s.odometerKm * 10) / 10, checkEngine: s.engineTempC > 104, altitudeM: Math.round(s.altitudeM) });
  }

  for (const asset of staticAssets) {
    positions.push({ vehicleId: asset.vehicleId, tenantId: "demo-tenant", latitude: asset.lat, longitude: asset.lon, speedKmh: 0, heading: 0, ignition: false, batteryLevel: 100, recordedAt: new Date().toISOString() });
    if (asset.kind === "vehicle") {
      telemetry.push({ vehicleId: asset.vehicleId, rpm: 0, fuelPct: 76, engineTempC: 33, odometerKm: 4820, checkEngine: false, altitudeM: 20 });
    }
  }

  return { positions, telemetry };
}

// Arranca el simulador local. Emite un tick cada `intervalMs`. Devuelve un stop().
export function startClientSimulation(onTick: (t: DemoTick) => void, intervalMs = 1500): () => void {
  void loadRealRoutes(); // mejora las rutas a callejero real cuando OSRM responde
  onTick(tick()); // primer frame inmediato
  const id = window.setInterval(() => onTick(tick()), intervalMs);
  return () => window.clearInterval(id);
}
