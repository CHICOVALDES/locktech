// Logo oficial BUILD TRACKING: barras ascendentes doradas + "BT" (B blanco, T
// dorado), según el manual de marca (dorado #FFC107). Reutilizable en header,
// login y donde haga falta. Sin ".ai".
export function BtLogo({ height = 30 }: { height?: number }) {
  return (
    <svg height={height} viewBox="0 0 90 48" role="img" aria-label="Build Tracking">
      <rect x="2" y="30" width="7" height="16" rx="1" fill="#ffc107" />
      <rect x="12" y="21" width="7" height="25" rx="1" fill="#ffc107" />
      <rect x="22" y="12" width="7" height="34" rx="1" fill="#ffc107" />
      <text x="34" y="40" fontFamily="Montserrat, system-ui, sans-serif" fontWeight="800" fontSize="40" fill="#ffffff">B</text>
      <text x="60" y="40" fontFamily="Montserrat, system-ui, sans-serif" fontWeight="800" fontSize="40" fill="#ffc107">T</text>
    </svg>
  );
}
