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
  /** Rango [inicio, fin] en segundos del video que corresponde SOLO a este período. */
  clip?: [number, number];
  /** Foto representativa del período (frame extraído del time-lapse). */
  image?: string;
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
  /** Promedio de trabajadores en obra durante el período. */
  workers?: number;
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
  /** Segmentos/áreas de la obra monitoreados: eléctrico, agua, luces, etc. */
  systems?: SiteSystem[];
  /** Conteo de personal por captura de cámara (analítica de obra). */
  workforce?: WorkforceLog;
  /** Contrato de mano de obra con pagos por hitos (modalidad por contrato). */
  laborContract?: LaborContract;
  /** Análisis por imagen: máquinas y actividades detectadas por día. */
  analysis?: ImageAnalysis;
}

// ===== Análisis de imagen (visión por computadora) =====
// Detección por día de máquinas trabajando y actividades de obra (movimiento de
// tierra, hormigonado, colocación de piedras, etc.), con un estimativo del trabajo
// realizado. En producción lo produce un modelo de visión sobre cada captura.

export interface DetectedItem {
  label: string; // "Excavadora", "Movimiento de tierra"
  icon: string; // emoji
  count?: number; // cantidad detectada (para máquinas)
}

// Qué tipo de objeto marca una caja de detección (define el color del marco).
export type DetectionKind = "machine" | "person" | "structure" | "activity";

// Caja de detección sobre la imagen (lo que "ve" el modelo de visión). Se dibuja como
// un marco sutil sobre la foto ampliada. La caja es NORMALIZADA (0..1) relativa al
// ancho/alto de la imagen: [x, y, w, h] con x,y = esquina superior izquierda.
export interface Detection {
  label: string;
  icon?: string;
  kind: DetectionKind;
  box: [number, number, number, number];
  conf?: number; // confianza 0..1 (opcional, para mostrar %)
}

export interface AnalysisFrame {
  imageUrl: string;
  date: string; // "2023-04-09"
  time: string; // "13:02"
  /** Máquinas detectadas trabajando ese día. */
  machines: DetectedItem[];
  /** Actividades de obra detectadas. */
  activities: DetectedItem[];
  /** Resumen de lo que se ve en la imagen. */
  summary: string;
  /** Avance de obra estimado a partir de la imagen ese día (0-100). */
  workDonePct: number;
  /** Cajas de detección para marcar sobre la foto ampliada (máquinas, estructuras…). */
  detections?: Detection[];
}

export interface ImageAnalysis {
  frames: AnalysisFrame[];
}

// Una captura de la cámara de obra con el conteo de personas detectadas (por visión).
// Se toma una foto por día a distintas horas; cada una registra cuánta gente había.
export interface PeopleCapture {
  imageUrl: string;
  date: string; // "2023-02-13"
  time: string; // "13:00"
  people: number;
  /** Cajas de las personas visibles para marcar sobre la foto ampliada. */
  detections?: Detection[];
}

// Dotación de un día (para el log diario que se puede scrollear hacia atrás).
export interface DayWorkers {
  date: string; // "2026-07-13"
  workers: number;
}

export interface WorkforceLog {
  captures: PeopleCapture[];
  /** Log diario de dotación (para ver hacia atrás cuántos trabajadores por día). */
  daily?: DayWorkers[];
}

// Modalidad de pago de la mano de obra: por jornal diario o por contrato con pagos
// atados a hitos del trabajo realizado.
export type LaborMilestoneStatus = "paid" | "in_progress" | "pending";

export interface LaborMilestone {
  name: string; // "Fundaciones", "Estructura", "Entrega final"
  pct: number; // % del contrato que representa este hito
  amount: number; // monto en IDR
  status: LaborMilestoneStatus;
}

export interface LaborContract {
  total: number; // monto total del contrato de mano de obra (IDR)
  milestones: LaborMilestone[];
}

// ===== Electrical Installation Tracking System (BuildTrack) =====
// "Pasaporte eléctrico digital" de la obra: registro fotográfico y técnico de toda
// la instalación, de la acometida al comisionado. Ver docs/buildtrack-prd.md.

export type ElectricalPhaseStatus = "completed" | "in_progress" | "pending";

// Una de las 6 fases del proceso eléctrico (infraestructura → comisionado).
export interface ElectricalPhase {
  id: string;
  number: number;
  name: string;
  status: ElectricalPhaseStatus;
  progressPct: number;
  description: string;
}

// Categorías conocidas (con ícono/filtro propios). El campo `category` admite
// además cualquier texto libre (ej. "Bombeo", "Climatización") que la empresa cargue.
export type KnownCategory = "panel" | "box" | "circuit" | "switch" | "outlet" | "lighting" | "equipment";
export type ComponentCategory = KnownCategory | (string & {});

// Componente eléctrico documentado: tablero, circuito, llave, toma, luminaria o
// equipo. Guarda foto, ubicación, datos técnicos y su relación circuito/tablero.
export interface ElectricalComponent {
  id: string; // "DB-01", "S-01", "C-03"
  category: ComponentCategory;
  name: string;
  room: string;
  photo?: string;
  installedAt?: string;
  installer?: string;
  specs?: string;
  circuit?: string; // circuito al que pertenece, ej. "C-03"
  panel?: string; // tablero del que cuelga, ej. "DB-01"
  breaker?: string; // térmica asignada, ej. "16A"
  controls?: string; // qué controla/alimenta, ej. "Luces del living"
  load?: string; // carga eléctrica, ej. "2.2 kW"
}

export type TestResult = "pass" | "pending" | "fail";

// Ensayo de la fase de testing/comisionado (tensión, tierra, térmicas, carga).
export interface ElectricalTest {
  id: string;
  name: string;
  result: TestResult;
  value?: string;
  date?: string;
}

export interface ElectricalInstallation {
  /** Avance global de la instalación eléctrica (0-100). */
  overallPct: number;
  phases: ElectricalPhase[];
  components: ElectricalComponent[];
  tests: ElectricalTest[];
}

// Un "segmento" o área de la obra: eléctrico, luces, cañerías y agua, climatización,
// etc. Cada área tiene su propio avance, fases, componentes (editables con foto) y
// ensayos — misma estructura que la instalación eléctrica, generalizada. La empresa
// puede agregar las áreas que necesite.
export interface SiteSystem {
  id: string; // "electrico", "agua", "luces"
  name: string; // "Instalación eléctrica"
  icon: string; // emoji, ej. "⚡", "🚰", "💡"
  overallPct: number;
  phases: ElectricalPhase[];
  components: ElectricalComponent[];
  tests: ElectricalTest[];
}
