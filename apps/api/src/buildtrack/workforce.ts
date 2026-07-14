import type { Detection, WorkforceLog } from "@bali-moto-track/shared-types";

// Caja de una persona sobre la toma aérea (figuras chicas). Marca a los trabajadores
// VISIBLES en cuadro; el resto de la cuadrilla trabaja bajo estructura o fuera de toma.
const P = (x: number, y: number): Detection => ({
  label: "Persona",
  icon: "👷",
  kind: "person",
  box: [x, y, 0.014, 0.038],
  conf: 0.62,
});

// Dotación estimada de la obra por captura de cámara (una foto por día a distintas
// horas). El número es la CUADRILLA estimada del día, no solo la gente visible en el
// frame aéreo (la mayoría trabaja bajo estructura/fuera de cuadro): son valores
// realistas de obra, coherentes con el avance mensual. Fechas/horas = timestamp real
// del frame. En producción el conteo lo afina un modelo de visión + parte diario.

// Log diario de dotación (últimas 2 semanas). Fines de semana bajan; en Canggu el
// 07/07 hubo tormenta. Realista según el tamaño/etapa de cada obra.
const DAILY: Record<string, WorkforceLog["daily"]> = {
  "villa-ubud": [
    { date: "2026-06-30", workers: 22 }, { date: "2026-07-01", workers: 24 }, { date: "2026-07-02", workers: 23 },
    { date: "2026-07-03", workers: 21 }, { date: "2026-07-04", workers: 9 }, { date: "2026-07-05", workers: 0 },
    { date: "2026-07-06", workers: 20 }, { date: "2026-07-07", workers: 22 }, { date: "2026-07-08", workers: 25 },
    { date: "2026-07-09", workers: 23 }, { date: "2026-07-10", workers: 20 }, { date: "2026-07-11", workers: 8 },
    { date: "2026-07-12", workers: 0 }, { date: "2026-07-13", workers: 21 },
  ],
  "villa-uluwatu": [
    { date: "2026-06-30", workers: 14 }, { date: "2026-07-01", workers: 16 }, { date: "2026-07-02", workers: 15 },
    { date: "2026-07-03", workers: 13 }, { date: "2026-07-04", workers: 5 }, { date: "2026-07-05", workers: 0 },
    { date: "2026-07-06", workers: 14 }, { date: "2026-07-07", workers: 17 }, { date: "2026-07-08", workers: 18 },
    { date: "2026-07-09", workers: 15 }, { date: "2026-07-10", workers: 13 }, { date: "2026-07-11", workers: 4 },
    { date: "2026-07-12", workers: 0 }, { date: "2026-07-13", workers: 14 },
  ],
  "villa-canggu": [
    { date: "2026-06-30", workers: 9 }, { date: "2026-07-01", workers: 11 }, { date: "2026-07-02", workers: 10 },
    { date: "2026-07-03", workers: 8 }, { date: "2026-07-04", workers: 3 }, { date: "2026-07-05", workers: 0 },
    { date: "2026-07-06", workers: 7 }, { date: "2026-07-07", workers: 2 }, { date: "2026-07-08", workers: 9 },
    { date: "2026-07-09", workers: 10 }, { date: "2026-07-10", workers: 8 }, { date: "2026-07-11", workers: 0 },
    { date: "2026-07-12", workers: 0 }, { date: "2026-07-13", workers: 7 },
  ],
};

export const WORKFORCE_BY_PROJECT: Record<string, WorkforceLog> = {
  // Luna Beach Club (cámara "Temple") — beach club grande, cuadrilla numerosa.
  "villa-ubud": {
    daily: DAILY["villa-ubud"],
    captures: [
      {
        imageUrl: "/images/villa-ubud-1.jpg", date: "2023-02-13", time: "13:00", people: 24,
        detections: [P(0.66, 0.705), P(0.68, 0.7), P(0.698, 0.708), P(0.716, 0.715), P(0.69, 0.73)],
      },
      {
        imageUrl: "/images/villa-ubud-2.jpg", date: "2023-04-09", time: "13:02", people: 22,
        detections: [P(0.3, 0.56), P(0.32, 0.565), P(0.61, 0.64), P(0.64, 0.65)],
      },
      {
        imageUrl: "/images/villa-ubud-3.jpg", date: "2023-06-06", time: "10:01", people: 18,
        detections: [P(0.315, 0.6), P(0.34, 0.61), P(0.36, 0.6), P(0.43, 0.6)],
      },
      {
        imageUrl: "/images/villa-ubud-4.jpg", date: "2023-07-24", time: "08:00", people: 14,
        detections: [P(0.7, 0.56), P(0.76, 0.47)],
      },
    ],
  },
  // Hotel Cliff Pantay Nany (cámara "CAM01") — obra media, cuadrilla media.
  "villa-uluwatu": {
    daily: DAILY["villa-uluwatu"],
    captures: [
      {
        imageUrl: "/images/villa-uluwatu-1.jpg", date: "2023-02-05", time: "08:00", people: 10,
        detections: [P(0.56, 0.56), P(0.62, 0.5)],
      },
      {
        imageUrl: "/images/villa-uluwatu-2.jpg", date: "2023-03-20", time: "12:02", people: 18,
        detections: [P(0.06, 0.56), P(0.3, 0.53), P(0.56, 0.52)],
      },
      {
        imageUrl: "/images/villa-uluwatu-3.jpg", date: "2023-05-25", time: "12:04", people: 14,
        detections: [P(0.47, 0.56), P(0.52, 0.55)],
      },
      {
        imageUrl: "/images/villa-uluwatu-4.jpg", date: "2023-07-20", time: "14:02", people: 11,
        detections: [P(0.64, 0.52), P(0.7, 0.56)],
      },
    ],
  },
  // Villa Canggu Garden (cámara "Construction 1") — obra de bambú, demorada; el
  // 12/04 hubo tormenta (obra casi parada).
  "villa-canggu": {
    daily: DAILY["villa-canggu"],
    captures: [
      {
        imageUrl: "/images/villa-canggu-1.jpg", date: "2023-02-14", time: "09:02", people: 12,
        detections: [P(0.1, 0.55), P(0.15, 0.56), P(0.38, 0.5)],
      },
      // Tormenta: obra casi parada, sin gente visible en cuadro.
      { imageUrl: "/images/villa-canggu-2.jpg", date: "2023-04-12", time: "11:00", people: 2 },
      {
        imageUrl: "/images/villa-canggu-3.jpg", date: "2023-06-06", time: "09:00", people: 9,
        detections: [P(0.25, 0.36), P(0.47, 0.34)],
      },
      {
        imageUrl: "/images/villa-canggu-4.jpg", date: "2023-08-01", time: "08:00", people: 7,
        detections: [P(0.47, 0.36)],
      },
    ],
  },
};
