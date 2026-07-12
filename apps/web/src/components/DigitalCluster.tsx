interface DigitalClusterProps {
  speedKmh: number;
  secondaryLabel: string;
  secondaryValue: number;
  secondaryUnit: string;
  tripLabel: string;
  tripKm: number;
  warningActive: boolean;
}

function padOdometer(km: number): string {
  return Math.round(km).toString().padStart(6, "0");
}

// Tablero 100% digital (sin foto de fondo) inspirado en el tablero real de la
// NMAX: housing oscuro + pantalla LCD azul, flechas de giro verdes, testigo
// ámbar, y el odómetro en formato de dígitos fijos como un LCD real.
export function DigitalCluster({
  speedKmh,
  secondaryLabel,
  secondaryValue,
  secondaryUnit,
  tripLabel,
  tripKm,
  warningActive,
}: DigitalClusterProps) {
  return (
    <div className="digital-cluster">
      <span className="digital-cluster__arrow digital-cluster__arrow--left" />

      <div className="digital-cluster__screen">
        <div className="digital-cluster__top-row">
          <span className={`digital-cluster__dot ${warningActive ? "digital-cluster__dot--active" : ""}`} />
          <span className="digital-cluster__secondary">
            {Math.round(secondaryValue)} <em>{secondaryUnit}</em>
          </span>
        </div>

        <div className="digital-cluster__speed-row">
          <span className="digital-cluster__speed">{Math.round(speedKmh)}</span>
          <span className="digital-cluster__speed-unit">km/h</span>
        </div>

        <div className="digital-cluster__bottom-row">
          <span>{secondaryLabel}</span>
          <span className="digital-cluster__odo">
            {tripLabel} {padOdometer(tripKm)}
          </span>
        </div>
      </div>

      <span className="digital-cluster__arrow digital-cluster__arrow--right" />
    </div>
  );
}
