// Simulador de motos para probar el pipeline Traccar -> backend -> frontend
// sin hardware real. Manda posiciones por el protocolo OsmAnd (HTTP simple)
// que Traccar entiende de forma nativa. Esto NO valida los decoders binarios
// de GT06/Teltonika (eso todavía requiere una unidad física, ver plan Fase 0);
// solo valida que el resto de la plataforma reaccione a posiciones reales.
//
// Uso:
//   node infra/simulator/simulate-devices.mjs
//   TRACCAR_HOST=localhost TRACCAR_OSMAND_PORT=5055 node infra/simulator/simulate-devices.mjs

const TRACCAR_HOST = process.env.TRACCAR_HOST ?? "localhost";
const TRACCAR_OSMAND_PORT = Number(process.env.TRACCAR_OSMAND_PORT ?? 5055);
const TICK_MS = Number(process.env.SIM_TICK_MS ?? 3000);

// Rutas simples (loop cerrado) alrededor de Canggu/Seminyak, Bali, para que
// cada moto simulada se mueva en círculo y se puedan probar geocercas.
const routes = [
  {
    deviceId: "sim-moto-1",
    points: [
      [-8.6478, 115.1385],
      [-8.6501, 115.1401],
      [-8.6525, 115.1378],
      [-8.6509, 115.1349],
      [-8.6482, 115.1358],
    ],
  },
  {
    deviceId: "sim-moto-2",
    points: [
      [-8.6698, 115.1685],
      [-8.6715, 115.1702],
      [-8.6733, 115.1680],
      [-8.6712, 115.1660],
    ],
  },
];

function interpolate([lat1, lon1], [lat2, lon2], t) {
  return [lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t];
}

function bearing([lat1, lon1], [lat2, lon2]) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

async function sendPosition(deviceId, [lat, lon], heading, speedKmh) {
  const params = new URLSearchParams({
    id: deviceId,
    timestamp: String(Math.floor(Date.now() / 1000)),
    lat: lat.toFixed(6),
    lon: lon.toFixed(6),
    speed: (speedKmh * 0.539957).toFixed(2), // OsmAnd protocol espera nudos
    bearing: heading.toFixed(1),
    altitude: "10",
    batt: "87",
  });

  const url = `http://${TRACCAR_HOST}:${TRACCAR_OSMAND_PORT}/?${params.toString()}`;
  try {
    const res = await fetch(url);
    console.log(`[${deviceId}] ${res.status} lat=${params.get("lat")} lon=${params.get("lon")}`);
  } catch (err) {
    console.error(`[${deviceId}] error enviando posición:`, err.message);
  }
}

function driveRoute(route) {
  let segment = 0;
  let t = 0;

  setInterval(() => {
    const a = route.points[segment];
    const b = route.points[(segment + 1) % route.points.length];
    const pos = interpolate(a, b, t);
    const heading = bearing(a, b);

    sendPosition(route.deviceId, pos, heading, 25 + Math.random() * 15);

    t += 0.15;
    if (t >= 1) {
      t = 0;
      segment = (segment + 1) % route.points.length;
    }
  }, TICK_MS);
}

console.log(`Simulando ${routes.length} motos contra http://${TRACCAR_HOST}:${TRACCAR_OSMAND_PORT} cada ${TICK_MS}ms`);
routes.forEach(driveRoute);
