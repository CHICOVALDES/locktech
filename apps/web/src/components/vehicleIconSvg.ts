import type { IconStyle, KitStyle } from "../features/customization/presets.js";

// Ícono top-down (vista desde el mapa, y también usado agrandado como preview
// en el panel de tuning). Los markers de MapLibre son elementos DOM planos, no
// árbol de React, así que se arma acá como string en vez de JSX.
export function vehicleIconSvg(
  iconId: IconStyle,
  primary: string,
  secondary: string,
  kit: KitStyle,
  selected: boolean,
): string {
  const ring = selected
    ? `<ellipse cx="12" cy="21" rx="14" ry="14" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.75" />`
    : "";

  return `
    <svg width="30" height="30" viewBox="0 0 24 42" xmlns="http://www.w3.org/2000/svg">
      ${ring}
      ${iconBody(iconId, primary, secondary, kit)}
    </svg>
  `;
}

function iconBody(iconId: IconStyle, primary: string, secondary: string, kit: KitStyle): string {
  switch (iconId) {
    case "helmet":
      return `
        <ellipse cx="12" cy="19" rx="10" ry="12" fill="${primary}" />
        <path d="M2.5 21 Q12 30 21.5 21 L21.5 25.5 Q12 34 2.5 25.5 Z" fill="${secondary}" opacity="0.92" />
        <rect x="8.5" y="8" width="7" height="2.2" rx="1.1" fill="${secondary}" opacity="0.9" />
      `;
    case "bird":
      return `
        <path
          d="M12 5 L2 19.5 L9.5 17.5 L12 33 L14.5 17.5 L22 19.5 Z"
          fill="${primary}"
        />
        <path d="M12 5 L9.5 17.5 L14.5 17.5 Z" fill="${secondary}" opacity="0.85" />
      `;
    case "car": {
      const stripe = kit === "stock" ? "" : `<rect x="10.4" y="9" width="3.2" height="24" fill="${secondary}" opacity="0.9" />`;
      return `
        <rect x="5.5" y="8" width="13" height="26" rx="4.5" fill="${primary}" />
        <rect x="7.5" y="14" width="9" height="6.5" rx="1.6" fill="${secondary}" opacity="0.85" />
        ${stripe}
        <rect x="3.2" y="11.5" width="2.6" height="5.5" rx="1.1" fill="#0d0d0d" />
        <rect x="18.2" y="11.5" width="2.6" height="5.5" rx="1.1" fill="#0d0d0d" />
        <rect x="3.2" y="25" width="2.6" height="5.5" rx="1.1" fill="#0d0d0d" />
        <rect x="18.2" y="25" width="2.6" height="5.5" rx="1.1" fill="#0d0d0d" />
      `;
    }
    case "moto":
    default: {
      const stripe = kit === "stock" ? "" : `<rect x="10.2" y="11" width="3.6" height="20" rx="1.8" fill="${secondary}" opacity="0.9" />`;
      return `
        <ellipse cx="12" cy="34" rx="4.4" ry="5.4" fill="none" stroke="#0d0d0d" stroke-width="2.6" />
        <ellipse cx="12" cy="9" rx="4.4" ry="5.4" fill="none" stroke="#0d0d0d" stroke-width="2.6" />
        <path d="M8.2 15 L9.2 11.5 L14.8 11.5 L15.8 15 L14.8 28 L15.8 31.5 L8.2 31.5 L9.2 28 Z" fill="${primary}" />
        ${stripe}
        <path d="M9.2 11.5 L12 7 L14.8 11.5 Z" fill="${primary}" />
      `;
    }
  }
}
