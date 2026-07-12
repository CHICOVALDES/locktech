import type { VehicleState } from "../../hooks/useDemoPositions.js";
import type { IconStyle } from "../customization/presets.js";
import { DigitalCluster } from "../../components/DigitalCluster.js";
import { FuelGauge } from "../../components/FuelGauge.js";
import { CheckEngineLight } from "../../components/CheckEngineLight.js";

interface GaugeClusterProps {
  vehicles: VehicleState[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  onSelectHome: () => void;
  isHomeSelected: boolean;
  accentColor: string;
  iconId: IconStyle;
}

export function GaugeCluster({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onSelectHome,
  isHomeSelected,
  accentColor,
  iconId,
}: GaugeClusterProps) {
  const selected = vehicles.find((v) => v.position.vehicleId === selectedVehicleId) ?? vehicles[0];
  const isAnimalTheme = iconId === "bird";

  return (
    <section className="gauge-cluster">
      <h2 className="gauge-cluster__title">{isAnimalTheme ? "Bandada en vivo" : "Flota en vivo"}</h2>

      {selected ? (
        <>
          <div className="gauge-cluster__hero-label">{selected.position.vehicleId}</div>

          <DigitalCluster
            speedKmh={selected.position.speedKmh}
            secondaryLabel={isAnimalTheme ? "ALTITUD" : "RPM"}
            secondaryValue={isAnimalTheme ? selected.telemetry?.altitudeM ?? 0 : selected.telemetry?.rpm ?? 0}
            secondaryUnit={isAnimalTheme ? "m" : "rpm"}
            tripLabel={isAnimalTheme ? "VUELO" : "ODO"}
            tripKm={selected.telemetry?.odometerKm ?? 0}
            warningActive={!isAnimalTheme && (selected.telemetry?.checkEngine ?? false)}
          />

          {selected.telemetry && !isAnimalTheme && (
            <>
              <FuelGauge fuelPct={selected.telemetry.fuelPct} accentColor={accentColor} />
              <CheckEngineLight active={selected.telemetry.checkEngine} />
            </>
          )}
        </>
      ) : (
        <p className="gauge-cluster__empty">Esperando posiciones...</p>
      )}

      <ul className="gauge-cluster__list">
        <li>
          <button
            className={`gauge-cluster__row ${isHomeSelected ? "gauge-cluster__row--active" : ""}`}
            onClick={onSelectHome}
          >
            <span className="gauge-cluster__row-photo gauge-cluster__row-photo--home">🏠</span>
            <span className="gauge-cluster__row-id">Casa</span>
          </button>
        </li>
        {vehicles.map(({ position }) => (
          <li key={position.vehicleId}>
            <button
              className={`gauge-cluster__row ${position.vehicleId === selectedVehicleId ? "gauge-cluster__row--active" : ""}`}
              onClick={() => onSelectVehicle(position.vehicleId)}
            >
              <img
                className="gauge-cluster__row-photo"
                src={`/images/${position.vehicleId.toLowerCase()}.jpg`}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />
              <span className="gauge-cluster__row-id">{position.vehicleId}</span>
              <span className="gauge-cluster__row-speed">{Math.round(position.speedKmh)} km/h</span>
              <span className={`gauge-cluster__row-dot ${position.ignition ? "gauge-cluster__row-dot--on" : ""}`} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
