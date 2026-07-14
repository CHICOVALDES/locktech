import type { ElectricalInstallation, SiteSystem } from "@bali-moto-track/shared-types";
import { CANGGU_ELECTRICAL, CLIFF_ELECTRICAL, LUNA_ELECTRICAL } from "./electrical.js";

// Segmentos/áreas de obra por proyecto. Cada área (eléctrico, agua, luces, …) es un
// SiteSystem con la misma estructura (fases + componentes + tests). El área eléctrica
// reutiliza los datos existentes; agua y luces son demos propios de cada obra.

// Envuelve una instalación eléctrica existente como segmento "Eléctrico".
function electricalSystem(data: ElectricalInstallation): SiteSystem {
  return { id: "electrico", name: "Instalación eléctrica", icon: "⚡", ...data };
}

// --- Luna Beach Club: eléctrico + agua + luces ---
const LUNA_AGUA: SiteSystem = {
  id: "agua",
  name: "Cañerías y agua",
  icon: "🚰",
  overallPct: 58,
  phases: [
    { id: "a-p1", number: 1, name: "Acometida y tanque", status: "completed", progressPct: 100, description: "Conexión PDAM, tanque de reserva y bomba presurizadora." },
    { id: "a-p2", number: 2, name: "Cañerías embutidas", status: "in_progress", progressPct: 70, description: "Agua fría/caliente antes de cerrar paredes." },
    { id: "a-p3", number: 3, name: "Desagües y cloacas", status: "in_progress", progressPct: 50, description: "Cañerías de desagüe y ventilaciones." },
    { id: "a-p4", number: 4, name: "Artefactos y grifería", status: "pending", progressPct: 10, description: "Inodoros, bachas, duchas y grifería." },
    { id: "a-p5", number: 5, name: "Pruebas de presión", status: "pending", progressPct: 0, description: "Ensayo de estanqueidad y presión." },
  ],
  components: [
    { id: "TK-01", category: "Tanque", name: "Tanque de reserva 5.000L", room: "Terraza técnica", installedAt: "2026-05-10", installer: "CV Tirta Bali", specs: "Polietileno 5.000L + bomba presurizadora 1HP" },
    { id: "PU-01", category: "Bombeo", name: "Bomba presurizadora", room: "Sala de máquinas", installedAt: "2026-05-12", installer: "CV Tirta Bali", load: "0.75 kW", specs: "1HP · presostato automático" },
    { id: "PIPE-CW", category: "Cañería", name: "Red de agua fría", room: "Toda la obra", installedAt: "2026-06-20", installer: "CV Tirta Bali", specs: "PPR Ø20-32mm embutido" },
    { id: "PIPE-HW", category: "Cañería", name: "Red de agua caliente", room: "Suites y cocina", installedAt: "2026-06-25", installer: "CV Tirta Bali", specs: "PPR fibra Ø20mm aislado" },
    { id: "WH-01", category: "equipment", name: "Termotanque solar", room: "Techo", installedAt: "2026-07-02", installer: "CV Tirta Bali", load: "1.5 kW", specs: "300L colector solar + resistencia backup" },
    { id: "FT-01", category: "Fuente", name: "Cascada / fuente de acero", room: "Pileta oeste", photo: "/images/prod-fuente.jpg", installedAt: "2026-07-11", installer: "CV Tirta Bali", load: "0.55 kW", specs: "Cascada de acero inox 600mm + bomba de recirculación" },
    { id: "DR-01", category: "Desagüe", name: "Colector principal de cloacas", room: "Subsuelo", installedAt: "2026-06-15", installer: "CV Tirta Bali", specs: "PVC Ø110mm con cámara de inspección" },
  ],
  tests: [
    { id: "wt-press", name: "Prueba de presión (parcial)", result: "pass", value: "6 bar / 2h", date: "2026-07-05" },
    { id: "wt-leak", name: "Estanqueidad de desagües", result: "pending", date: "—" },
  ],
};

const LUNA_LUCES: SiteSystem = {
  id: "luces",
  name: "Iluminación",
  icon: "💡",
  overallPct: 40,
  phases: [
    { id: "l-p1", number: 1, name: "Proyecto lumínico", status: "completed", progressPct: 100, description: "Plano de luminarias y escenas de iluminación." },
    { id: "l-p2", number: 2, name: "Iluminación interior", status: "in_progress", progressPct: 55, description: "Spots, tiras LED y colgantes en interiores." },
    { id: "l-p3", number: 3, name: "Iluminación exterior", status: "in_progress", progressPct: 30, description: "Jardín, pileta y fachada." },
    { id: "l-p4", number: 4, name: "Control y escenas", status: "pending", progressPct: 5, description: "Domótica de iluminación y escenas." },
  ],
  components: [
    { id: "LT-LIV", category: "lighting", name: "Spots de riel · living", room: "Living principal", photo: "/images/prod-lampara1.jpg", installedAt: "2026-07-04", installer: "CV Arus Bali", circuit: "C-05", load: "0.08 kW", specs: "10 spots LED de riel 7W 3000K orientables" },
    { id: "LT-STRIP", category: "lighting", name: "Tira LED lineal cielorraso", room: "Living / comedor", photo: "/images/prod-lampara2.jpg", installedAt: "2026-07-06", installer: "CV Arus Bali", circuit: "C-06", load: "0.12 kW", specs: "Perfil LED lineal 24V 2700K perimetral" },
    { id: "LT-KITCHEN", category: "lighting", name: "Colgantes de cocina", room: "Cocina / isla", photo: "/images/prod-lampu.jpg", installedAt: "2026-07-09", installer: "CV Arus Bali", circuit: "C-07", load: "0.09 kW", specs: "6 colgantes LED + spots empotrados" },
    { id: "LT-WALL", category: "lighting", name: "Apliques de pared exteriores", room: "Fachada y terraza", photo: "/images/prod-lampara3.jpg", installedAt: "2026-07-10", installer: "CV Arus Bali", circuit: "C-08", load: "0.18 kW", specs: "12 apliques LED up/down IP65" },
    { id: "LT-POOL", category: "lighting", name: "Luces de pileta RGB", room: "Pileta oeste", photo: "/images/elec-poollight.jpg", installedAt: "2026-07-05", installer: "CV Arus Bali", circuit: "C-14", load: "0.15 kW", specs: "6 focos LED 24V IP68 · control DMX" },
    { id: "LT-GARDEN", category: "lighting", name: "Iluminación de jardín", room: "Jardín perimetral", photo: "/images/elec-gardenlight.jpg", installedAt: "2026-07-08", installer: "CV Arus Bali", circuit: "C-15", load: "0.17 kW", specs: "14 balizas LED 12V · fotocélula" },
  ],
  tests: [{ id: "lt-scene", name: "Prueba de escenas de iluminación", result: "pending", date: "—" }],
};

// --- Hotel Cliff: eléctrico + agua (arrancando) ---
const CLIFF_AGUA: SiteSystem = {
  id: "agua",
  name: "Cañerías y agua",
  icon: "🚰",
  overallPct: 22,
  phases: [
    { id: "a-p1", number: 1, name: "Acometida y tanque", status: "in_progress", progressPct: 60, description: "Conexión y tanque de reserva del hotel." },
    { id: "a-p2", number: 2, name: "Cañerías embutidas", status: "in_progress", progressPct: 20, description: "Montantes principales por núcleo húmedo." },
    { id: "a-p3", number: 3, name: "Desagües y cloacas", status: "pending", progressPct: 5, description: "A la espera de losas." },
    { id: "a-p4", number: 4, name: "Artefactos y grifería", status: "pending", progressPct: 0, description: "No iniciado." },
  ],
  components: [
    { id: "TK-01", category: "Tanque", name: "Tanque de reserva 10.000L", room: "Sala de tanques", installedAt: "2026-06-01", installer: "PT Air Bersih", specs: "2× tanques 5.000L en paralelo" },
    { id: "PIPE-MAIN", category: "Cañería", name: "Montante principal", room: "Núcleo húmedo", installedAt: "2026-06-18", installer: "PT Air Bersih", specs: "PPR Ø40mm" },
  ],
  tests: [],
};

// Luna: área de Climatización (aires) — obra avanzada, equipos en montaje.
const LUNA_CLIMA: SiteSystem = {
  id: "clima",
  name: "Climatización",
  icon: "❄️",
  overallPct: 45,
  phases: [
    { id: "cl-p1", number: 1, name: "Cañerías de refrigerante", status: "completed", progressPct: 100, description: "Tendido de líneas de refrigerante y drenajes." },
    { id: "cl-p2", number: 2, name: "Unidades interiores", status: "in_progress", progressPct: 60, description: "Montaje de splits en suites y áreas comunes." },
    { id: "cl-p3", number: 3, name: "Unidades exteriores", status: "in_progress", progressPct: 30, description: "Condensadoras y soportes." },
    { id: "cl-p4", number: 4, name: "Carga y puesta en marcha", status: "pending", progressPct: 0, description: "Carga de gas y pruebas." },
  ],
  components: [
    { id: "AC-S1", category: "equipment", name: "Split · Suite 1", room: "Suite principal", photo: "/images/elec-ac.jpg", installedAt: "2026-07-09", installer: "CV Dingin Bali", circuit: "C-09", breaker: "16A", load: "1.8 kW", specs: "Split inverter 12.000 BTU" },
    { id: "AC-S2", category: "equipment", name: "Split · Suite 2", room: "Suite 2", photo: "/images/elec-ac.jpg", installedAt: "2026-07-11", installer: "CV Dingin Bali", circuit: "C-10", breaker: "16A", load: "1.8 kW", specs: "Split inverter 12.000 BTU" },
    { id: "AC-LIV", category: "equipment", name: "Cassette · área común", room: "Living / bar", installedAt: "2026-07-13", installer: "CV Dingin Bali", circuit: "C-12", breaker: "20A", load: "3.5 kW", specs: "Cassette inverter 24.000 BTU" },
  ],
  tests: [{ id: "cl-gas", name: "Prueba de estanqueidad de gas", result: "pending", date: "—" }],
};

// Hotel Cliff: área de Iluminación recién iniciada.
const CLIFF_LUCES: SiteSystem = {
  id: "luces",
  name: "Iluminación",
  icon: "💡",
  overallPct: 12,
  phases: [
    { id: "l-p1", number: 1, name: "Proyecto lumínico", status: "completed", progressPct: 100, description: "Plano de luminarias del hotel aprobado." },
    { id: "l-p2", number: 2, name: "Iluminación interior", status: "in_progress", progressPct: 15, description: "Primeras habitaciones piloto." },
    { id: "l-p3", number: 3, name: "Iluminación exterior", status: "pending", progressPct: 0, description: "No iniciado." },
  ],
  components: [
    { id: "LT-LOBBY", category: "lighting", name: "Spots de lobby (muestra)", room: "Lobby", photo: "/images/prod-lampara1.jpg", installedAt: "2026-06-28", installer: "PT Cahaya Listrik", load: "0.1 kW", specs: "Spots LED de riel · habitación piloto" },
  ],
  tests: [],
};

// Mapa proyecto → segmentos.
export const SYSTEMS_BY_PROJECT: Record<string, SiteSystem[]> = {
  "villa-ubud": [electricalSystem(LUNA_ELECTRICAL), LUNA_AGUA, LUNA_LUCES, LUNA_CLIMA],
  "villa-uluwatu": [electricalSystem(CLIFF_ELECTRICAL), CLIFF_AGUA, CLIFF_LUCES],
  "villa-canggu": [electricalSystem(CANGGU_ELECTRICAL)],
};
