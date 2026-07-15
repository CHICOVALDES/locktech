import { useMemo } from "react";
import type { VehicleState } from "../../hooks/useDemoPositions.js";
import { clientAccounts } from "../auth/accounts.js";
import { useProjects } from "../buildtrack/useProjects.js";
import { PROJECT_OWNERS } from "../buildtrack/ownership.js";
import { loadCamerasForClient, loadGpsForClient } from "./deviceStore.js";
import { fleetAccentColor } from "./fleetColors.js";

// Vista de administración CENTRADA EN EL CLIENTE: cada cliente con SUS activos
// (motos, obras, cámaras) por separado — no todo junto como una sola bolsa.
// El admin ve la plataforma como lo que es: varios clientes, cada uno con lo suyo.
export function ClientsOverview({
  vehicles,
  onOpenVehicle,
}: {
  vehicles: VehicleState[];
  onOpenVehicle: (vehicleId: string) => void;
}) {
  const clients = useMemo(() => clientAccounts(), []);
  const { projects } = useProjects();

  return (
    <div className="clients">
      <header className="clients__hero fleet__hero">
        <div>
          <h1 className="fleet__title">CLIENTES</h1>
          <p className="fleet__subtitle">Cada cliente con sus motos, obras y cámaras</p>
        </div>
        <div className="fleet__stats">
          <div className="fleet__stat">
            <span className="fleet__stat-value">{clients.length}</span>
            <span className="fleet__stat-label">Clientes</span>
          </div>
        </div>
      </header>

      {clients.length === 0 ? (
        <p className="fleet__empty">Todavía no hay clientes. Creá uno en Usuarios.</p>
      ) : (
        <div className="clients__list">
          {clients.map((c) => {
            const motos = vehicles.filter((v) => c.devices.some((d) => d.vehicleId === v.position.vehicleId));
            const gps = loadGpsForClient(c.username); // equipos GPS asignados desde el admin
            const obras = projects.filter((p) => PROJECT_OWNERS[p.id] === c.username);
            const cams = loadCamerasForClient(c.username);
            const totalUnits = motos.length + gps.length;
            const kinds = [
              totalUnits > 0 ? "🏍️ Unidades" : null,
              obras.length > 0 ? "🏗️ Obras" : null,
              cams.length > 0 ? "📹 Cámaras" : null,
            ].filter(Boolean);

            return (
              <section className="client-card" key={c.username}>
                <div className="client-card__head">
                  <div>
                    <h2 className="client-card__name">{c.profile.businessName}</h2>
                    <span className="client-card__meta">
                      @{c.username} · {c.profile.plan}
                    </span>
                  </div>
                  <div className="client-card__kinds">
                    {kinds.length ? kinds.map((k) => <span key={k} className="client-card__kind">{k}</span>) : <span className="client-card__kind client-card__kind--empty">Sin activos</span>}
                  </div>
                </div>

                {/* Motos del cliente */}
                {motos.length > 0 && (
                  <div className="client-card__group">
                    <span className="client-card__group-title">🏍️ Motos ({motos.length})</span>
                    <div className="client-card__motos">
                      {motos.map((v, i) => (
                        <button
                          key={v.position.vehicleId}
                          className="client-moto"
                          style={{ "--accent": fleetAccentColor(v.position.vehicleId, i) } as React.CSSProperties}
                          onClick={() => onOpenVehicle(v.position.vehicleId)}
                        >
                          <span className="client-moto__id">{v.position.vehicleId}</span>
                          <span className={`client-moto__status ${v.position.speedKmh > 3 ? "client-moto__status--live" : ""}`}>
                            {v.position.speedKmh > 3 ? `● ${Math.round(v.position.speedKmh)} km/h` : v.position.ignition ? "○ detenida" : "○ apagada"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipos GPS asignados al cliente desde el admin */}
                {gps.length > 0 && (
                  <div className="client-card__group">
                    <span className="client-card__group-title">🛰️ Equipos GPS ({gps.length})</span>
                    <div className="client-card__obras">
                      {gps.map((d) => (
                        <span key={d.id} className="client-obra">
                          🛰️ {d.vehicleId}
                          {d.brand || d.model ? ` · ${[d.brand, d.model].filter(Boolean).join(" ")}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Obras del cliente */}
                {obras.length > 0 && (
                  <div className="client-card__group">
                    <span className="client-card__group-title">🏗️ Obras ({obras.length})</span>
                    <div className="client-card__obras">
                      {obras.map((p) => (
                        <span key={p.id} className="client-obra">
                          {p.icon ?? "🏗️"} {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cámaras del cliente */}
                {cams.length > 0 && (
                  <div className="client-card__group">
                    <span className="client-card__group-title">📹 Cámaras ({cams.length})</span>
                    <div className="client-card__obras">
                      {cams.map((cam) => (
                        <span key={cam.id} className="client-obra">
                          📹 {cam.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
