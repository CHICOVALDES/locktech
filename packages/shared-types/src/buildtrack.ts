// BuildTrack — Construction Intelligence Platform.
// Tipos compartidos entre la API (store in-memory) y el front (dashboard de obras).
// Ver docs/buildtrack-prd.md. Primer slice: proyectos + timeline de hitos.

export type ProjectStatus = "planning" | "active" | "delayed" | "completed";

export type MilestoneStatus = "not_started" | "in_progress" | "completed" | "delayed";

// Los 9 hitos estándar de una obra, en orden cronológico (PRD §8). Este paquete
// es SOLO de tipos (se consume como fuente .ts, sin build), por eso acá va el
// union de nombres; la lista concreta como valor vive en la API (buildtrack/store).
export type MilestoneName =
  | "Site Preparation"
  | "Excavation"
  | "Foundation"
  | "Structure"
  | "Roofing"
  | "MEP Installation"
  | "Finishing"
  | "Landscaping"
  | "Completion";

export interface Milestone {
  id: string;
  name: MilestoneName;
  status: MilestoneStatus;
}

// Ritmo de avance de un período del time-lapse. Permite contar el caso real:
// "antes del techo" venía demorado, "después del techo" recupera / vuelve al ritmo.
export type PerfStatus = "on_track" | "delayed" | "recovering";

// Un período del desglose del time-lapse (una semana o un mes) con su rendimiento.
export interface TimelapseSegment {
  id: string;
  label: string; // "Marzo", "Semana 23"
  period: string; // "1–31 mar", "3–9 jun"
  /** Rendimiento (% de obra avanzado) en ese período. */
  progressPct: number;
  status: PerfStatus;
  /** Nota del período, ej. "Antes del techo · estructura demorada". */
  note?: string;
}

// Desglose de un time-lapse real de la obra en rendimiento semanal, mensual y total.
export interface TimelapseBreakdown {
  /** Nombre del ángulo/cámara, ej. "Vista general", "Pileta · Oeste". */
  label: string;
  videoUrl: string;
  /** Rango que cubre el video, ej. "Enero – Agosto 2026". */
  span: string;
  /** Avance total acumulado que muestra el time-lapse (0-100). */
  totalProgressPct: number;
  weekly: TimelapseSegment[];
  monthly: TimelapseSegment[];
}

export type ReportType = "weekly" | "monthly";

// Reporte de avance de obra (PRD §7). Se genera por período con resumen, avance y
// puntos destacados; el front lo puede previsualizar y descargar.
export interface ProjectReport {
  id: string;
  type: ReportType;
  title: string; // "Reporte semanal · Semana 25"
  period: string; // "15–21 jun 2026"
  /** ISO date en que se generó. */
  generatedAt: string;
  /** Avance acumulado de la obra al cierre del reporte (0-100). */
  progressPct: number;
  status: PerfStatus;
  summary: string;
  highlights: string[];
}

export interface Project {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  /** ISO date (YYYY-MM-DD). */
  startDate: string;
  /** ISO date (YYYY-MM-DD) — fecha estimada de finalización. */
  estimatedCompletion: string;
  clientName: string;
  description: string;
  status: ProjectStatus;
  /** Emoji/ícono para el marcador en el mapa, ej. "🏨", "🏗️", "🏖️". */
  icon?: string;
  /** URL de la última imagen de la obra; null = todavía sin captura. */
  currentImageUrl: string | null;
  /** Galería de fotos de la obra (progresión); la primera suele ser la más reciente. */
  gallery?: string[];
  milestones: Milestone[];
  /** Time-lapses de la obra, uno por ángulo/cámara (opcional). */
  timelapses?: TimelapseBreakdown[];
  /** Reportes de avance generados (opcional). */
  reports?: ProjectReport[];
}
