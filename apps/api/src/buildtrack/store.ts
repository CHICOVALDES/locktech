import type {
  Milestone,
  MilestoneName,
  MilestoneStatus,
  Project,
  ProjectReport,
  TimelapseBreakdown,
} from "@bali-moto-track/shared-types";

// Store in-memory de BuildTrack (Construction Intelligence). Primer slice = demo:
// obras sembradas a mano, sin base de datos (se reinician al arrancar). Cuando
// haya persistencia real, este módulo se reemplaza por queries a Postgres sin
// tocar las rutas ni el front. Ver docs/buildtrack-prd.md.

// Los 9 hitos estándar en orden (PRD §8). El valor vive acá (no en shared-types,
// que es solo de tipos) porque es la API la que siembra los proyectos.
const MILESTONE_NAMES: MilestoneName[] = [
  "Site Preparation",
  "Excavation",
  "Foundation",
  "Structure",
  "Roofing",
  "MEP Installation",
  "Finishing",
  "Landscaping",
  "Completion",
];

// Arma los 9 hitos estándar marcando como "completed" los primeros `done`,
// "in_progress" el siguiente, y "not_started" el resto. `delayed` (opcional)
// fuerza ese estado en un hito puntual por su nombre.
function buildMilestones(done: number, delayed?: MilestoneName): Milestone[] {
  return MILESTONE_NAMES.map((name, i): Milestone => {
    let status: MilestoneStatus;
    if (name === delayed) status = "delayed";
    else if (i < done) status = "completed";
    else if (i === done) status = "in_progress";
    else status = "not_started";
    return { id: `m${i + 1}`, name, status };
  });
}

// Desglose del time-lapse real de la grúa (Ene–Ago). Cuenta el caso original:
// la obra venía DEMORADA antes del techo (estructura lenta + lluvias) y RECUPERA
// el ritmo una vez montado el techo, que protege los trabajos internos.
const ULUWATU_TIMELAPSE: TimelapseBreakdown = {
  label: "Grúa · Vista general",
  videoUrl: "/videos/crane-jan-aug.mp4",
  span: "Enero – Agosto 2026",
  totalProgressPct: 62,
  monthly: [
    { id: "m-ene", label: "Enero", period: "1–31 ene", progressPct: 8, status: "on_track", note: "Preparación de terreno y excavación" },
    { id: "m-feb", label: "Febrero", period: "1–29 feb", progressPct: 11, status: "on_track", note: "Fundaciones" },
    { id: "m-mar", label: "Marzo", period: "1–31 mar", progressPct: 7, status: "delayed", note: "Estructura arranca lenta" },
    { id: "m-abr", label: "Abril", period: "1–30 abr", progressPct: 6, status: "delayed", note: "Antes del techo · estructura demorada" },
    { id: "m-may", label: "Mayo", period: "1–31 may", progressPct: 6, status: "delayed", note: "Antes del techo · atraso acumulado por lluvias" },
    { id: "m-jun", label: "Junio", period: "1–30 jun", progressPct: 12, status: "recovering", note: "Techo montado · recupera ritmo" },
    { id: "m-jul", label: "Julio", period: "1–31 jul", progressPct: 7, status: "on_track", note: "Después del techo · impermeabilización" },
    { id: "m-ago", label: "Agosto", period: "1–31 ago", progressPct: 5, status: "on_track", note: "MEP y terminaciones inician bajo techo" },
  ],
  weekly: [
    { id: "w-20", label: "Semana 20", period: "11–17 may", progressPct: 1.2, status: "delayed", note: "Estructura piso 2, aún sin techo" },
    { id: "w-21", label: "Semana 21", period: "18–24 may", progressPct: 1.0, status: "delayed", note: "Lluvias frenan el avance (sin techo)" },
    { id: "w-22", label: "Semana 22", period: "25–31 may", progressPct: 1.5, status: "delayed", note: "Antes del techo" },
    { id: "w-23", label: "Semana 23", period: "1–7 jun", progressPct: 3.0, status: "recovering", note: "Montaje del techo" },
    { id: "w-24", label: "Semana 24", period: "8–14 jun", progressPct: 3.2, status: "recovering", note: "Techo terminado" },
    { id: "w-25", label: "Semana 25", period: "15–21 jun", progressPct: 2.6, status: "on_track", note: "Trabajos internos protegidos por el techo" },
  ],
};

// Villa Canggu: obra DEMORADA — se trabó en fundaciones (napa de agua + permisos).
const CANGGU_TIMELAPSE: TimelapseBreakdown = {
  label: "Cámara frontal",
  videoUrl: "/videos/construction-seaside.mp4",
  span: "Mayo – Agosto 2026",
  totalProgressPct: 28,
  monthly: [
    { id: "c-may", label: "Mayo", period: "15–31 may", progressPct: 6, status: "on_track", note: "Preparación de terreno" },
    { id: "c-jun", label: "Junio", period: "1–30 jun", progressPct: 5, status: "delayed", note: "Napa de agua frena la excavación" },
    { id: "c-jul", label: "Julio", period: "1–31 jul", progressPct: 4, status: "delayed", note: "Fundaciones demoradas · espera de permisos" },
    { id: "c-ago", label: "Agosto", period: "1–31 ago", progressPct: 13, status: "recovering", note: "Bombeo resuelto · fundaciones retoman" },
  ],
  weekly: [
    { id: "cw-27", label: "Semana 27", period: "29 jun–5 jul", progressPct: 0.8, status: "delayed", note: "Excavación parada por agua" },
    { id: "cw-28", label: "Semana 28", period: "6–12 jul", progressPct: 0.9, status: "delayed", note: "Instalación de bombas de achique" },
    { id: "cw-29", label: "Semana 29", period: "13–19 jul", progressPct: 1.1, status: "delayed", note: "Aún esperando permiso de fundación" },
    { id: "cw-30", label: "Semana 30", period: "20–26 jul", progressPct: 3.2, status: "recovering", note: "Permiso aprobado · hormigón de zapatas" },
  ],
};

// Villa Ubud: obra AVANZADA y en ritmo — arrancó en 2025, entra en terminaciones.
const UBUD_TIMELAPSE: TimelapseBreakdown = {
  label: "Vista general",
  videoUrl: "/videos/temple.mp4",
  span: "Septiembre 2025 – Agosto 2026",
  totalProgressPct: 84,
  monthly: [
    { id: "u-abr", label: "Abril", period: "1–30 abr", progressPct: 9, status: "on_track", note: "MEP: eléctrico y sanitario" },
    { id: "u-may", label: "Mayo", period: "1–31 may", progressPct: 10, status: "on_track", note: "Revoques y contrapisos" },
    { id: "u-jun", label: "Junio", period: "1–30 jun", progressPct: 11, status: "on_track", note: "Carpinterías y aberturas" },
    { id: "u-jul", label: "Julio", period: "1–31 jul", progressPct: 9, status: "on_track", note: "Terminaciones interiores" },
    { id: "u-ago", label: "Agosto", period: "1–31 ago", progressPct: 8, status: "on_track", note: "Paisajismo y estanque natural" },
  ],
  weekly: [
    { id: "uw-27", label: "Semana 27", period: "29 jun–5 jul", progressPct: 2.3, status: "on_track", note: "Pisos de madera" },
    { id: "uw-28", label: "Semana 28", period: "6–12 jul", progressPct: 2.5, status: "on_track", note: "Pintura y grifería" },
    { id: "uw-29", label: "Semana 29", period: "13–19 jul", progressPct: 2.1, status: "on_track", note: "Deck y jardín" },
    { id: "uw-30", label: "Semana 30", period: "20–26 jul", progressPct: 1.9, status: "on_track", note: "Detalles finales de landscaping" },
  ],
};

// Segundo ángulo de Luna Beach Club: la PILETA del sector oeste, sobre el mar.
const UBUD_POOL_TIMELAPSE: TimelapseBreakdown = {
  label: "Pileta · Oeste (sobre el mar)",
  videoUrl: "/videos/pool-jan-aug.mp4",
  span: "Enero – Agosto 2026",
  totalProgressPct: 90,
  monthly: [
    { id: "up-abr", label: "Abril", period: "1–30 abr", progressPct: 14, status: "on_track", note: "Excavación del vaso sobre el acantilado" },
    { id: "up-may", label: "Mayo", period: "1–31 may", progressPct: 16, status: "on_track", note: "Hormigón y armadura del vaso" },
    { id: "up-jun", label: "Junio", period: "1–30 jun", progressPct: 18, status: "on_track", note: "Impermeabilización y borde infinito" },
    { id: "up-jul", label: "Julio", period: "1–31 jul", progressPct: 15, status: "on_track", note: "Revestimiento y venecitas" },
    { id: "up-ago", label: "Agosto", period: "1–31 ago", progressPct: 12, status: "on_track", note: "Llenado, deck oeste y luces" },
  ],
  weekly: [
    { id: "upw-27", label: "Semana 27", period: "29 jun–5 jul", progressPct: 3.4, status: "on_track", note: "Colocación de venecitas" },
    { id: "upw-28", label: "Semana 28", period: "6–12 jul", progressPct: 3.6, status: "on_track", note: "Borde infinito hacia el mar" },
    { id: "upw-29", label: "Semana 29", period: "13–19 jul", progressPct: 3.1, status: "on_track", note: "Equipos de filtrado y climatización" },
    { id: "upw-30", label: "Semana 30", period: "20–26 jul", progressPct: 2.8, status: "on_track", note: "Deck de madera del sector oeste" },
  ],
};

const ULUWATU_REPORTS: ProjectReport[] = [
  {
    id: "r-ulu-jun",
    type: "monthly",
    title: "Reporte mensual · Junio",
    period: "1–30 jun 2026",
    generatedAt: "2026-07-01",
    progressPct: 50,
    status: "recovering",
    summary:
      "Mes clave: se montó el techo, que estaba demorando la obra por las lluvias. Con la cubierta terminada se recuperó el ritmo y arrancaron los trabajos internos protegidos.",
    highlights: [
      "Techo (Roofing) completado — hito crítico superado",
      "Rendimiento del mes: +12% (el más alto del proyecto)",
      "Se recupera parte del atraso acumulado en la estructura",
      "Riesgo: impermeabilización pendiente antes de la próxima lluvia",
    ],
  },
  {
    id: "r-ulu-s25",
    type: "weekly",
    title: "Reporte semanal · Semana 25",
    period: "15–21 jun 2026",
    generatedAt: "2026-06-22",
    progressPct: 50,
    status: "on_track",
    summary: "Trabajos internos ya protegidos por el techo. La obra vuelve a estar en ritmo respecto al plan.",
    highlights: ["Inicio de instalaciones MEP", "Sin lluvias que afecten avance", "Cuadrilla completa en sitio"],
  },
];

const CANGGU_REPORTS: ProjectReport[] = [
  {
    id: "r-can-jul",
    type: "monthly",
    title: "Reporte mensual · Julio",
    period: "1–31 jul 2026",
    generatedAt: "2026-08-01",
    progressPct: 15,
    status: "delayed",
    summary:
      "Obra demorada. La excavación se frenó por una napa de agua y la fundación quedó a la espera del permiso municipal. Se instalaron bombas de achique.",
    highlights: [
      "Rendimiento del mes: +4% (por debajo del plan)",
      "Napa de agua en el sector norte del terreno",
      "Permiso de fundación en trámite",
      "Acción: bombeo permanente + reprogramación de hormigón",
    ],
  },
  {
    id: "r-can-s30",
    type: "weekly",
    title: "Reporte semanal · Semana 30",
    period: "20–26 jul 2026",
    generatedAt: "2026-07-27",
    progressPct: 20,
    status: "recovering",
    summary: "Permiso aprobado y agua controlada. Se hormigonaron las primeras zapatas; la obra empieza a recuperar.",
    highlights: ["Permiso de fundación aprobado", "Hormigón de zapatas iniciado", "Bombas operativas 24/7"],
  },
];

const UBUD_REPORTS: ProjectReport[] = [
  {
    id: "r-ubu-jul",
    type: "monthly",
    title: "Reporte mensual · Julio",
    period: "1–31 jul 2026",
    generatedAt: "2026-08-01",
    progressPct: 79,
    status: "on_track",
    summary:
      "Obra en ritmo y cerca de la entrega. Avanzan las terminaciones interiores y arranca el paisajismo junto al río.",
    highlights: [
      "Rendimiento del mes: +9%, en línea con el plan",
      "Terminaciones interiores al 80%",
      "Inicio de deck y estanque natural",
      "Proyección de entrega dentro de fecha",
    ],
  },
  {
    id: "r-ubu-s29",
    type: "weekly",
    title: "Reporte semanal · Semana 29",
    period: "13–19 jul 2026",
    generatedAt: "2026-07-20",
    progressPct: 82,
    status: "on_track",
    summary: "Colocación de pisos de madera y grifería. Comienza el jardín y el deck exterior.",
    highlights: ["Pisos de madera colocados", "Grifería y sanitarios instalados", "Paisajismo en marcha"],
  },
];

// Galería de una villa: los 4 frames extraídos del time-lapse (progresión de obra).
function gallery(id: string): string[] {
  return [1, 2, 3, 4].map((n) => `/images/${id}-${n}.jpg`);
}

const projects: Project[] = [
  {
    id: "villa-uluwatu",
    name: "Hotel Cliff Pantay Nany",
    address: "Jl. Pantai Nyang Nyang, Uluwatu, Bali",
    latitude: -8.8340025,
    longitude: 115.0940163,
    startDate: "2026-02-01",
    estimatedCompletion: "2026-11-30",
    clientName: "Coastal Estates Ltd.",
    description: "Villa de 4 habitaciones sobre acantilado con piscina infinity y vista al mar.",
    status: "active",
    icon: "🏨",
    currentImageUrl: "/images/villa-uluwatu-4.jpg",
    gallery: gallery("villa-uluwatu"),
    milestones: buildMilestones(4), // trabajando en Roofing
    timelapses: [ULUWATU_TIMELAPSE],
    reports: ULUWATU_REPORTS,
  },
  {
    id: "villa-canggu",
    name: "Villa Canggu Garden",
    address: "Jl. Batu Bolong, Canggu, Bali",
    latitude: -8.6478,
    longitude: 115.1385,
    startDate: "2026-05-15",
    estimatedCompletion: "2027-01-20",
    clientName: "Made Rai Development",
    description: "Complejo de 3 villas tropicales con jardín central y coworking.",
    status: "delayed",
    icon: "🏗️",
    currentImageUrl: "/images/villa-canggu-4.jpg",
    gallery: gallery("villa-canggu"),
    milestones: buildMilestones(2, "Foundation"), // Foundation demorada
    timelapses: [CANGGU_TIMELAPSE],
    reports: CANGGU_REPORTS,
  },
  {
    id: "villa-ubud",
    name: "Luna Beach Club",
    address: "Jl. Kayangan, Beraban, Tabanan, Bali",
    latitude: -8.6296694,
    longitude: 115.0942149,
    startDate: "2025-09-01",
    estimatedCompletion: "2026-08-15",
    clientName: "Green Valley Investors",
    description: "Villa de retiro junto al río con estudio de yoga y estanque natural.",
    status: "active",
    icon: "🏖️",
    currentImageUrl: "/images/villa-ubud-4.jpg",
    gallery: gallery("villa-ubud"),
    milestones: buildMilestones(7), // en Landscaping, casi terminada
    timelapses: [UBUD_TIMELAPSE, UBUD_POOL_TIMELAPSE],
    reports: UBUD_REPORTS,
  },
];

export function listProjects(): Project[] {
  return projects;
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
