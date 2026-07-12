export interface LiveryPreset {
  id: string;
  label: string;
  primary: string;
  secondary: string;
}

// Colores reales de la flota de MR Rental Bali / Custom by Valdés (catálogo de
// colores Yamaha NMAX 155), más BMA (Bali Motorsport Academy) y BMW M como
// opciones extra. No son datos de un gráfico —son una paleta de "colores de
// auto", así que no pasan por el validador de dataviz. Los hex son aproximados,
// sacados a ojo de las fotos del catálogo, no de un archivo de marca oficial.
export const LIVERY_PRESETS: LiveryPreset[] = [
  { id: "azul-yamaha", label: "Azul Yamaha", primary: "#0f52ba", secondary: "#0d0d0d" },
  { id: "amarillo-neon", label: "Amarillo Neón", primary: "#e5e600", secondary: "#0d0d0d" },
  { id: "turquesa-tropical", label: "Turquesa Tropical", primary: "#17c4c4", secondary: "#0d0d0d" },
  { id: "naranja-metalico", label: "Naranja Metálico", primary: "#ea7a1e", secondary: "#0d0d0d" },
  { id: "rojo-racing", label: "Rojo Racing", primary: "#d81e2c", secondary: "#0d0d0d" },
  { id: "verde-lima", label: "Verde Lima", primary: "#8dc63f", secondary: "#0d0d0d" },
  { id: "bma", label: "BMA Rally", primary: "#c41e2a", secondary: "#0a0a09" },
  { id: "bmw-m", label: "BMW M", primary: "#1c69d4", secondary: "#e6222a" },
];

export type KitStyle = "stock" | "race" | "street";

export const KIT_STYLES: { id: KitStyle; label: string }[] = [
  { id: "stock", label: "Stock" },
  { id: "race", label: "Race" },
  { id: "street", label: "Street" },
];

export type IconStyle = "moto" | "helmet" | "bird" | "car";

export const ICON_STYLES: { id: IconStyle; label: string }[] = [
  { id: "moto", label: "Moto" },
  { id: "helmet", label: "Casco" },
  { id: "bird", label: "Ave" },
  { id: "car", label: "Auto" },
];

export interface VehicleCustomization {
  liveryId: string;
  kit: KitStyle;
  iconId: IconStyle;
}

export const DEFAULT_CUSTOMIZATION: VehicleCustomization = { liveryId: "azul-yamaha", kit: "stock", iconId: "moto" };
