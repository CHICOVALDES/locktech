interface FuelGaugeProps {
  fuelPct: number;
  accentColor: string;
}

const SEGMENTS = 8;

// Medidor de nafta a segmentos, como el de la mayoría de tableros de moto
// (en vez de un dial analógico E-F, que ocupa más espacio).
export function FuelGauge({ fuelPct, accentColor }: FuelGaugeProps) {
  const filled = Math.round((fuelPct / 100) * SEGMENTS);
  const isCritical = fuelPct <= 15;
  const isWarning = fuelPct <= 30;
  const color = isCritical ? "var(--status-critical)" : isWarning ? "var(--status-warning)" : accentColor;

  return (
    <div className="fuel-gauge">
      <div className="fuel-gauge__row">
        <span className="fuel-gauge__end-label">E</span>
        <div className="fuel-gauge__segments">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span
              key={i}
              className="fuel-gauge__segment"
              style={{ background: i < filled ? color : "var(--gridline)" }}
            />
          ))}
        </div>
        <span className="fuel-gauge__end-label">F</span>
      </div>
      <span className="gauge-label">Combustible — {fuelPct}%</span>
    </div>
  );
}
