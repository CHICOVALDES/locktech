import type {
  ElectricalPhaseStatus,
  KnownCategory,
  MilestoneStatus,
  PerfStatus,
  Project,
  ProjectStatus,
} from "@bali-moto-track/shared-types";

// Helpers puros de BuildTrack: cálculo de avance a partir de hitos, días
// transcurridos/restantes y etiquetas/colores de estado para la UI.

// Peso de cada estado de hito para derivar el % de avance de la obra.
const MILESTONE_WEIGHT: Record<MilestoneStatus, number> = {
  completed: 1,
  in_progress: 0.5,
  delayed: 0.25,
  not_started: 0,
};

// % de avance (0-100) derivado del estado de los hitos. Consistente con el
// timeline que ve el usuario, sin un campo aparte que se pueda desincronizar.
export function projectProgress(project: Project): number {
  if (project.milestones.length === 0) return 0;
  const sum = project.milestones.reduce((acc, m) => acc + MILESTONE_WEIGHT[m.status], 0);
  return Math.round((sum / project.milestones.length) * 100);
}

// Días transcurridos desde el inicio (mínimo 0).
export function daysElapsed(project: Project, now = new Date()): number {
  return Math.max(0, daysBetween(new Date(project.startDate), now));
}

// Días restantes hasta la fecha estimada de fin (negativo = atrasada).
export function daysRemaining(project: Project, now = new Date()): number {
  return daysBetween(now, new Date(project.estimatedCompletion));
}

function daysBetween(from: Date, to: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: "Planificación",
  active: "En obra",
  delayed: "Demorada",
  completed: "Completada",
};

export function projectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABEL[status];
}

const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  not_started: "Sin empezar",
  in_progress: "En progreso",
  completed: "Completado",
  delayed: "Demorado",
};

export function milestoneStatusLabel(status: MilestoneStatus): string {
  return MILESTONE_STATUS_LABEL[status];
}

const PERF_STATUS_LABEL: Record<PerfStatus, string> = {
  on_track: "En ritmo",
  delayed: "Demorado",
  recovering: "Recuperando",
};

export function perfStatusLabel(status: PerfStatus): string {
  return PERF_STATUS_LABEL[status];
}

const ELECTRICAL_PHASE_LABEL: Record<ElectricalPhaseStatus, string> = {
  completed: "Completada",
  in_progress: "En progreso",
  pending: "Pendiente",
};

export function electricalPhaseLabel(status: ElectricalPhaseStatus): string {
  return ELECTRICAL_PHASE_LABEL[status];
}

// Etiqueta + emoji de cada categoría conocida (para filtros y chips). Estas son las
// sugeridas; la empresa puede además escribir categorías propias (ver fallback).
const COMPONENT_CATEGORY: Record<KnownCategory, { label: string; icon: string }> = {
  panel: { label: "Tableros", icon: "🔌" },
  box: { label: "Cajas eléctricas", icon: "📦" },
  circuit: { label: "Circuitos", icon: "➰" },
  switch: { label: "Llaves", icon: "🎚️" },
  outlet: { label: "Tomas", icon: "🔲" },
  lighting: { label: "Iluminación", icon: "💡" },
  equipment: { label: "Equipos", icon: "⚙️" },
};

export const KNOWN_CATEGORIES = Object.keys(COMPONENT_CATEGORY) as KnownCategory[];

// Devuelve ícono + etiqueta de una categoría. Para categorías conocidas usa el mapa;
// para una categoría custom cargada por la empresa, capitaliza el texto y usa ⚡.
// Jornal por trabajador por día (IDR). Base del estimativo de mano de obra.
export const WAGE_IDR_PER_DAY = 140000;

const idrFmt = new Intl.NumberFormat("es", { maximumFractionDigits: 0 });

// Formatea un monto en rupias indonesias, ej. "Rp 1.960.000".
export function formatIdr(amount: number): string {
  return `Rp ${idrFmt.format(Math.round(amount))}`;
}

// Extrae la potencia en kW de un texto de carga ("2.2 kW", "800 W", "1,5 kw").
// Devuelve 0 si no hay número reconocible. Usado por el resumen de consumo.
export function parseKw(load?: string): number {
  if (!load) return 0;
  const m = load.replace(",", ".").match(/([\d.]+)\s*(kw|w)?/i);
  if (!m) return 0;
  const value = parseFloat(m[1]);
  if (!Number.isFinite(value)) return 0;
  return (m[2] ?? "kw").toLowerCase() === "w" ? value / 1000 : value;
}

export function componentCategoryMeta(category: string): { label: string; icon: string } {
  const known = COMPONENT_CATEGORY[category as KnownCategory];
  if (known) return known;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return { label: label || "Otro", icon: "⚡" };
}

// Snapshot de "actividad detectada" de una obra, para mostrarlo en el mapa:
// - people: dotación más reciente (último día del log; si no hay, última captura).
// - machines: máquinas de la captura más reciente que tenga alguna (última máquina
//   vista en obra), agregadas por tipo con su cantidad.
// En producción esto sale del modelo de visión sobre la última captura en vivo.
export interface SiteSnapshot {
  people: number;
  machines: { label: string; icon: string; count: number }[];
}

export function siteSnapshot(project: Project): SiteSnapshot {
  // Dotación: último día del log diario con dato; si no, última captura.
  let people = 0;
  const daily = project.workforce?.daily;
  if (daily && daily.length > 0) {
    const last = [...daily].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
    people = last?.workers ?? 0;
  } else if (project.workforce?.captures?.length) {
    const caps = [...project.workforce.captures].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    people = caps.at(-1)?.people ?? 0;
  }

  // Máquinas: de la captura más reciente que tenga alguna máquina detectada.
  const machines: SiteSnapshot["machines"] = [];
  const frames = [...(project.analysis?.frames ?? [])].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const withMachine = frames.find((f) => f.machines.length > 0);
  if (withMachine) {
    for (const m of withMachine.machines) {
      const cur = machines.find((x) => x.label === m.label);
      if (cur) cur.count += m.count ?? 1;
      else machines.push({ label: m.label, icon: m.icon, count: m.count ?? 1 });
    }
  }

  return { people, machines };
}
