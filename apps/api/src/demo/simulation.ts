import type { MotoTelemetry, Position } from "@bali-moto-track/shared-types";

// Simulación en memoria para la demo web (Fase 0). Reemplazar por el worker real
// de ingesta de Traccar en Fase 1 — este módulo no toca la DB ni Traccar.
//
// La telemetría de motor (RPM/combustible/temperatura) es simulada y no viene de
// los trackers GPS reales (Teltonika/GT06 solo mandan posición + I/O básico salvo
// que tengan un adaptador CAN/OBD). Cuando haya hardware con esa capacidad, este
// módulo se reemplaza por datos reales sin cambiar el contrato MotoTelemetry.

interface RouteDef {
  vehicleId: string;
  waypoints: [number, number][]; // [lat, lon]
}

const routeDefs: RouteDef[] = [
  {
    vehicleId: "CV-NMAX-365",
    waypoints: [
      [-8.6698, 115.1685],
      [-8.6715, 115.1702],
      [-8.6733, 115.168],
      [-8.6712, 115.166],
    ],
  },
  // Segunda moto en movimiento: vuelta por Canggu/Berawa (cerca del centro del mapa).
  {
    vehicleId: "VB-AEROX-155",
    waypoints: [
      [-8.648, 115.14],
      [-8.652, 115.145],
      [-8.656, 115.142],
      [-8.651, 115.138],
    ],
  },
  // Tercera moto en movimiento: circuito por Seminyak.
  {
    vehicleId: "VB-PCX-160",
    waypoints: [
      [-8.685, 115.155],
      [-8.682, 115.16],
      [-8.679, 115.157],
      [-8.683, 115.152],
    ],
  },
];

// Activos QUIETOS (no se mueven): una moto estacionada y una casa con tracker.
// Coordenadas aproximadas — ajustar con la ubicación exacta cuando la tengamos.
interface StaticAsset {
  vehicleId: string;
  lat: number;
  lon: number;
  kind: "vehicle" | "casa"; // la casa no emite telemetría de motor
}

const staticAssets: StaticAsset[] = [
  // Moto de demo estacionada en el parking de Tanah Lot.
  { vehicleId: "RM-XMAX-180", lat: -8.6206, lon: 115.0894, kind: "vehicle" },
  // Casa Chico — inmueble con tracker en Jl. Garuda (coordenada a confirmar).
  { vehicleId: "CASA-CHICO", lat: -8.7184, lon: 115.169, kind: "casa" },
];

interface RuntimeRoute {
  vehicleId: string;
  points: [number, number][];
}

// OSRM demo público (sin API key) — solo para prototipos/demos, no apto para
// producción (rate-limited, sin SLA). En Fase 1 esto se reemplaza por un
// servicio de ruteo propio o uno comercial con contrato.
async function fetchRoadRoute(waypoints: [number, number][]): Promise<[number, number][]> {
  const loop = [...waypoints, waypoints[0]];
  const coordsParam = loop.map(([lat, lon]) => `${lon},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`;

  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`OSRM respondió ${res.status}`);

  const data = (await res.json()) as { routes: { geometry: { coordinates: [number, number][] } }[] };
  const coords = data.routes[0]?.geometry.coordinates;
  if (!coords || coords.length < 2) throw new Error("OSRM no devolvió una ruta válida");

  return coords.map(([lon, lat]) => [lat, lon]);
}

let routes: RuntimeRoute[] = routeDefs.map((r) => ({ vehicleId: r.vehicleId, points: r.waypoints }));

async function loadRealRoutes() {
  for (const def of routeDefs) {
    try {
      const points = await fetchRoadRoute(def.waypoints);
      const route = routes.find((r) => r.vehicleId === def.vehicleId);
      if (route) {
        route.points = points;
        const s = state.get(def.vehicleId);
        if (s) {
          s.segment = 0;
          s.t = 0;
        }
      }
      console.log(`[demo] ruta real cargada para ${def.vehicleId} (${points.length} puntos)`);
    } catch (err) {
      console.warn(`[demo] no se pudo obtener ruta real para ${def.vehicleId}, uso waypoints en línea recta:`, (err as Error).message);
    }
  }
}

function interpolate([lat1, lon1]: [number, number], [lat2, lon2]: [number, number], t: number): [number, number] {
  return [lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t];
}

function bearing([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
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
  routeDefs.map((r) => [
    r.vehicleId,
    { segment: 0, t: 0, fuelPct: 100, odometerKm: 1200 + Math.random() * 3000, engineTempC: 88, altitudeM: 80, tick: Math.random() * 100 },
  ]),
);

void loadRealRoutes();

export interface DemoTick {
  positions: Position[];
  telemetry: MotoTelemetry[];
}

export function tickDemoPositions(): DemoTick {
  const positions: Position[] = [];
  const telemetry: MotoTelemetry[] = [];

  for (const route of routes) {
    const s = state.get(route.vehicleId)!;
    const a = route.points[s.segment];
    const b = route.points[(s.segment + 1) % route.points.length];
    const [latitude, longitude] = interpolate(a, b, s.t);
    const heading = bearing(a, b);
    const speedKmh = 20 + Math.round(Math.random() * 20);

    // Las rutas reales (OSRM) tienen muchos más puntos, muy cercanos entre sí,
    // que el fallback en línea recta — el paso por tick se adapta para que la
    // velocidad visual sea consistente en ambos casos.
    const segmentStep = Math.max(0.05, Math.min(0.4, 4 / route.points.length));
    s.t += segmentStep;
    if (s.t >= 1) {
      s.t = 0;
      s.segment = (s.segment + 1) % route.points.length;
    }

    s.tick += 1;
    s.odometerKm += speedKmh * 0.03;
    s.fuelPct = Math.max(0, s.fuelPct - 0.05);
    if (s.fuelPct <= 2) s.fuelPct = 100; // reinicia para que la demo no se quede sin nafta
    s.engineTempC += (Math.random() - 0.45) * 1.5;
    s.engineTempC = Math.min(112, Math.max(75, s.engineTempC));
    s.altitudeM = 90 + Math.sin(s.tick / 12) * 60 + Math.random() * 8;

    const rpm = Math.min(11500, Math.round(1400 + speedKmh * 140 + Math.random() * 400));

    positions.push({
      vehicleId: route.vehicleId,
      tenantId: "demo-tenant",
      latitude,
      longitude,
      speedKmh,
      heading,
      ignition: true,
      batteryLevel: 87,
      recordedAt: new Date().toISOString(),
    });

    telemetry.push({
      vehicleId: route.vehicleId,
      rpm,
      fuelPct: Math.round(s.fuelPct),
      engineTempC: Math.round(s.engineTempC * 10) / 10,
      odometerKm: Math.round(s.odometerKm * 10) / 10,
      checkEngine: s.engineTempC > 104,
      altitudeM: Math.round(s.altitudeM),
    });
  }

  // Activos quietos: posición fija, motor apagado.
  for (const asset of staticAssets) {
    positions.push({
      vehicleId: asset.vehicleId,
      tenantId: "demo-tenant",
      latitude: asset.lat,
      longitude: asset.lon,
      speedKmh: 0,
      heading: 0,
      ignition: false,
      batteryLevel: 100,
      recordedAt: new Date().toISOString(),
    });

    // La moto estacionada muestra telemetría en reposo; la casa no tiene motor.
    if (asset.kind === "vehicle") {
      telemetry.push({
        vehicleId: asset.vehicleId,
        rpm: 0,
        fuelPct: 76,
        engineTempC: 33,
        odometerKm: 4820,
        checkEngine: false,
        altitudeM: 20,
      });
    }
  }

  return { positions, telemetry };
}

export function startDemoSimulation(onTick: (tick: DemoTick) => void, intervalMs = 1500): () => void {
  const interval = setInterval(() => onTick(tickDemoPositions()), intervalMs);
  return () => clearInterval(interval);
}
