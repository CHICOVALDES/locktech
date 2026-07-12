export interface Kid {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

// Datos de ejemplo para la demo — en Fase 1 esto viene de la lista real de
// inscriptos al campamento (por día/tanda), no hace falta login para el chico.
export const KIDS: Kid[] = [
  { id: "juan", name: "Juan", emoji: "🦁", color: "#eda100" },
  { id: "ana", name: "Ana", emoji: "🦄", color: "#e87ba4" },
  { id: "leo", name: "Leo", emoji: "🐯", color: "#eb6834" },
  { id: "sofia", name: "Sofía", emoji: "🐬", color: "#1baf7a" },
  { id: "mateo", name: "Mateo", emoji: "🐺", color: "#4a3aa7" },
  { id: "valentina", name: "Valentina", emoji: "🦋", color: "#2a78d6" },
];
