import type { MilestoneStatus, PerfStatus, Project, ProjectStatus } from "@bali-moto-track/shared-types";

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
