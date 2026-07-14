import type { ImageAnalysis } from "@bali-moto-track/shared-types";

// Análisis de imagen por día: máquinas y actividades detectadas + avance estimado.
// Los datos salen de lo que se observa en cada captura real de la cámara (timestamp
// real). En producción lo genera un modelo de visión (detección de objetos +
// clasificación de actividad) sobre cada foto diaria.

export const ANALYSIS_BY_PROJECT: Record<string, ImageAnalysis> = {
  // Luna Beach Club (cámara "Temple")
  "villa-ubud": {
    frames: [
      {
        imageUrl: "/images/villa-ubud-1.jpg",
        date: "2023-02-13",
        time: "13:00",
        machines: [{ label: "Retroexcavadora", icon: "🚜", count: 1 }],
        activities: [
          { label: "Movimiento de tierra", icon: "⛰️" },
          { label: "Armado de fundación", icon: "🧱" },
          { label: "Cuadrilla en sitio", icon: "👷" },
        ],
        summary: "Excavación y nivelación del sector; cuadrilla armando fundaciones junto al domo de bambú.",
        workDonePct: 18,
        detections: [
          { label: "Estructura de bambú", icon: "🎋", kind: "structure", box: [0.8, 0.27, 0.19, 0.42], conf: 0.82 },
          { label: "Retroexcavadora", icon: "🚜", kind: "machine", box: [0.58, 0.6, 0.07, 0.09], conf: 0.66 },
          { label: "Cuadrilla en sitio", icon: "👷", kind: "activity", box: [0.63, 0.68, 0.14, 0.13], conf: 0.7 },
        ],
      },
      {
        imageUrl: "/images/villa-ubud-2.jpg",
        date: "2023-04-09",
        time: "13:02",
        machines: [{ label: "Excavadora", icon: "🚜", count: 1 }],
        activities: [
          { label: "Movimiento de tierra", icon: "⛰️" },
          { label: "Hormigonado de fundación", icon: "🧱" },
          { label: "Estructura de bambú", icon: "🎋" },
        ],
        summary: "Excavadora trabajando sobre el borde oeste; hormigón en fundación circular y avance de la estructura de bambú.",
        workDonePct: 35,
        detections: [
          { label: "Excavadora", icon: "🚜", kind: "machine", box: [0.01, 0.54, 0.09, 0.1], conf: 0.8 },
          { label: "Estructura", icon: "🎋", kind: "structure", box: [0.58, 0.6, 0.24, 0.28], conf: 0.78 },
          { label: "Fundación circular", icon: "🧱", kind: "structure", box: [0.6, 0.8, 0.18, 0.15], conf: 0.72 },
        ],
      },
      {
        imageUrl: "/images/villa-ubud-3.jpg",
        date: "2023-06-06",
        time: "10:01",
        machines: [{ label: "Minicargadora", icon: "🚜", count: 1 }],
        activities: [
          { label: "Acopio de piedra", icon: "🪨" },
          { label: "Hormigón / cubierta domo", icon: "🏗️" },
        ],
        summary: "Acopio de piedra y adoquines en el centro del predio; hormigonado de la cubierta del domo.",
        workDonePct: 58,
        detections: [
          { label: "Minicargadora", icon: "🚜", kind: "machine", box: [0.29, 0.6, 0.06, 0.08], conf: 0.75 },
          { label: "Acopio de piedra", icon: "🪨", kind: "activity", box: [0.33, 0.63, 0.15, 0.09], conf: 0.73 },
          { label: "Cubierta del domo", icon: "🏗️", kind: "structure", box: [0.77, 0.42, 0.17, 0.24], conf: 0.79 },
        ],
      },
      {
        imageUrl: "/images/villa-ubud-4.jpg",
        date: "2023-07-24",
        time: "08:00",
        machines: [],
        activities: [
          { label: "Colocación de piedra en piso", icon: "🪨" },
          { label: "Pileta / terminaciones", icon: "🏊" },
          { label: "Paisajismo", icon: "🌿" },
        ],
        summary: "Colocación de piso de piedra (círculos de adoquín) en el patio; vaso de pileta terminado y paisajismo.",
        workDonePct: 84,
        detections: [
          { label: "Pileta", icon: "🏊", kind: "structure", box: [0.56, 0.55, 0.3, 0.22], conf: 0.85 },
          { label: "Piso de piedra", icon: "🪨", kind: "activity", box: [0.01, 0.62, 0.55, 0.36], conf: 0.8 },
        ],
      },
    ],
  },

  // Hotel Cliff Pantay Nany (cámara "CAM01") — con grúa en obra.
  "villa-uluwatu": {
    frames: [
      {
        imageUrl: "/images/villa-uluwatu-1.jpg",
        date: "2023-02-05",
        time: "08:00",
        machines: [{ label: "Grúa", icon: "🏗️", count: 1 }],
        activities: [
          { label: "Montaje de estructura", icon: "🏗️" },
          { label: "Acopio de acero", icon: "🔩" },
        ],
        summary: "Estructura metálica en montaje; acopio de perfiles y andamios en el sector oeste. Día lluvioso.",
        workDonePct: 22,
        detections: [
          { label: "Grúa", icon: "🏗️", kind: "machine", box: [0.3, 0.0, 0.045, 0.07], conf: 0.64 },
          { label: "Estructura metálica", icon: "🏗️", kind: "structure", box: [0.3, 0.46, 0.42, 0.24], conf: 0.81 },
          { label: "Acopio de acero", icon: "🔩", kind: "activity", box: [0.15, 0.71, 0.19, 0.18], conf: 0.7 },
        ],
      },
      {
        imageUrl: "/images/villa-uluwatu-2.jpg",
        date: "2023-03-20",
        time: "12:02",
        machines: [
          { label: "Grúa", icon: "🏗️", count: 1 },
          { label: "Camión", icon: "🚚", count: 1 },
        ],
        activities: [
          { label: "Hormigonado de losas", icon: "🧱" },
          { label: "Estructura", icon: "🏗️" },
        ],
        summary: "Camión en obra descargando material; hormigonado de losas y avance de la estructura de hormigón.",
        workDonePct: 40,
        detections: [
          { label: "Camión", icon: "🚚", kind: "machine", box: [0.22, 0.48, 0.07, 0.07], conf: 0.73 },
          { label: "Estructura de hormigón", icon: "🏗️", kind: "structure", box: [0.38, 0.48, 0.4, 0.26], conf: 0.82 },
        ],
      },
      {
        imageUrl: "/images/villa-uluwatu-3.jpg",
        date: "2023-05-25",
        time: "12:04",
        machines: [{ label: "Grúa", icon: "🏗️", count: 1 }],
        activities: [
          { label: "Montaje de cubierta", icon: "🏠" },
          { label: "Impermeabilización", icon: "💧" },
        ],
        summary: "Techo montado sobre el volumen principal; trabajos de cubierta e impermeabilización.",
        workDonePct: 60,
        detections: [
          { label: "Cubierta montada", icon: "🏠", kind: "structure", box: [0.42, 0.53, 0.26, 0.17], conf: 0.83 },
          { label: "Acopio / escombros", icon: "🪨", kind: "activity", box: [0.13, 0.72, 0.22, 0.2], conf: 0.68 },
        ],
      },
      {
        imageUrl: "/images/villa-uluwatu-4.jpg",
        date: "2023-07-20",
        time: "14:02",
        machines: [],
        activities: [
          { label: "Terminaciones", icon: "🎨" },
          { label: "Instalaciones (MEP)", icon: "⚡" },
        ],
        summary: "Obra bajo techo; avance de instalaciones y terminaciones interiores.",
        workDonePct: 74,
        detections: [
          { label: "Cubierta / volumen principal", icon: "🏠", kind: "structure", box: [0.42, 0.55, 0.26, 0.14], conf: 0.84 },
          { label: "Andamios en azotea", icon: "🏗️", kind: "structure", box: [0.54, 0.39, 0.13, 0.11], conf: 0.7 },
        ],
      },
    ],
  },

  // Villa Canggu Garden (cámara "Construction 1") — bambú, demorada.
  "villa-canggu": {
    frames: [
      {
        imageUrl: "/images/villa-canggu-1.jpg",
        date: "2023-02-14",
        time: "09:02",
        machines: [{ label: "Camioneta de carga", icon: "🛻", count: 1 }],
        activities: [
          { label: "Montaje de bambú", icon: "🎋" },
          { label: "Andamios", icon: "🪜" },
        ],
        summary: "Armado del domo de bambú con andamios; camioneta descargando cañas de bambú.",
        workDonePct: 15,
        detections: [
          { label: "Camioneta de carga", icon: "🛻", kind: "machine", box: [0.58, 0.51, 0.1, 0.1], conf: 0.71 },
          { label: "Domo de bambú", icon: "🎋", kind: "structure", box: [0.0, 0.1, 0.16, 0.33], conf: 0.8 },
        ],
      },
      {
        imageUrl: "/images/villa-canggu-2.jpg",
        date: "2023-04-12",
        time: "11:00",
        machines: [],
        activities: [{ label: "Obra detenida (tormenta)", icon: "🌧️" }],
        summary: "Tormenta fuerte: sin actividad en obra, materiales cubiertos.",
        workDonePct: 20,
        detections: [
          { label: "Obra detenida (tormenta)", icon: "🌧️", kind: "activity", box: [0.3, 0.25, 0.3, 0.25], conf: 0.6 },
        ],
      },
      {
        imageUrl: "/images/villa-canggu-3.jpg",
        date: "2023-06-06",
        time: "09:00",
        machines: [],
        activities: [
          { label: "Movimiento de tierra", icon: "⛰️" },
          { label: "Columnas de bambú", icon: "🎋" },
        ],
        summary: "Nivelación del terreno y montaje de columnas de bambú; acopio de material disperso.",
        workDonePct: 30,
        detections: [
          { label: "Columnas de bambú", icon: "🎋", kind: "structure", box: [0.33, 0.12, 0.36, 0.62], conf: 0.78 },
          { label: "Acopio de material", icon: "🪨", kind: "activity", box: [0.8, 0.55, 0.18, 0.22], conf: 0.64 },
        ],
      },
      {
        imageUrl: "/images/villa-canggu-4.jpg",
        date: "2023-08-01",
        time: "08:00",
        machines: [],
        activities: [
          { label: "Colocación de piedra", icon: "🪨" },
          { label: "Terreno / drenaje", icon: "⛰️" },
        ],
        summary: "Colocación de piedra en senderos y trabajos de terreno; obra con dotación reducida.",
        workDonePct: 28,
        detections: [
          { label: "Colocación de piedra", icon: "🪨", kind: "activity", box: [0.38, 0.52, 0.32, 0.22], conf: 0.66 },
          { label: "Acopio (bolsas)", icon: "📦", kind: "activity", box: [0.52, 0.19, 0.13, 0.1], conf: 0.6 },
        ],
      },
    ],
  },
};
