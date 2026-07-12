// Marca de BuildTrack: barras doradas ascendentes (avance de obra) sobre un
// badge navy — coherente con el branding del PRD (Dark Navy + Construction Gold).
// Es SVG inline (sin assets externos); si más adelante hay un logo oficial, se
// reemplaza este componente y listo.
export function BuildTrackLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="BuildTrack">
      <rect x="1" y="1" width="38" height="38" rx="10" fill="#0f1b2d" stroke="#e0a938" strokeWidth="1.5" />
      <rect x="9.5" y="22" width="5.5" height="9" rx="1.2" fill="#e0a938" />
      <rect x="17.25" y="16" width="5.5" height="15" rx="1.2" fill="#f4c869" />
      <rect x="25" y="10" width="5.5" height="21" rx="1.2" fill="#e0a938" />
    </svg>
  );
}
