import type { VehicleState } from "../../hooks/useDemoPositions.js";
import { fleetAccentColor } from "./fleetColors.js";

interface AdminFleetProps {
  vehicles: VehicleState[];
  onOpenVehicle: (vehicleId: string) => void;
}

export function AdminFleet({ vehicles, onOpenVehicle }: AdminFleetProps) {
  const moving = vehicles.filter((v) => v.position.speedKmh > 3).length;

  return (
    <div className="fleet">
      <header className="fleet__hero">
        <div>
          <h1 className="fleet__title">FLOTA GLOBAL</h1>
          <p className="fleet__subtitle">Panel de administración · todas las motos de la plataforma</p>
        </div>
        <div className="fleet__stats">
          <div className="fleet__stat">
            <span className="fleet__stat-value">{vehicles.length}</span>
            <span className="fleet__stat-label">Dispositivos</span>
          </div>
          <div className="fleet__stat">
            <span className="fleet__stat-value fleet__stat-value--live">{moving}</span>
            <span className="fleet__stat-label">En ruta</span>
          </div>
        </div>
      </header>

      {vehicles.length === 0 ? (
        <p className="fleet__empty">Esperando señal de los dispositivos…</p>
      ) : (
        <div className="fleet__grid">
          {vehicles.map((v, index) => {
            const { vehicleId, speedKmh, ignition } = v.position;
            const accent = fleetAccentColor(vehicleId, index);
            const isMoving = speedKmh > 3;
            const photoUrl = `/images/${vehicleId.toLowerCase()}.jpg`;

            return (
              <button
                key={vehicleId}
                className="fleet-card"
                style={{ "--accent": accent } as React.CSSProperties}
                onClick={() => onOpenVehicle(vehicleId)}
              >
                <div className="fleet-card__photo-wrap">
                  <img
                    className="fleet-card__photo"
                    src={photoUrl}
                    alt={vehicleId}
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <div className="fleet-card__tint" />
                  <span className={`fleet-card__status ${isMoving ? "fleet-card__status--live" : ""}`}>
                    {ignition ? (isMoving ? "● EN RUTA" : "● DETENIDA") : "○ APAGADA"}
                  </span>
                </div>

                <div className="fleet-card__body">
                  <span className="fleet-card__id">{vehicleId}</span>
                  <div className="fleet-card__speed">
                    <span className="fleet-card__speed-value">{Math.round(speedKmh)}</span>
                    <span className="fleet-card__speed-unit">km/h</span>
                    {v.telemetry && <span className="fleet-card__odo">{Math.round(v.telemetry.odometerKm)} km</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
