import { useState } from "react";
import type { ClientAccount } from "../auth/accounts.js";
import { useDevices, ASSET_TYPES, TRACKER_PROTOCOLS, CAMERA_TYPES, NVR_BRANDS } from "./deviceStore.js";
import { GpsForm, CameraForm, NvrForm } from "./DeviceManager.js";

// Detalle de un cliente (admin): desde acá se le dan de alta SUS equipos (GPS),
// NVR y cámaras — ya asignados a este cliente. Reutiliza los formularios del
// DeviceManager con el cliente fijo (el selector "asignar a cliente" queda en él).
type Section = "gps" | "nvr" | "cameras";

export function ClientDetail({ client, onBack }: { client: ClientAccount; onBack: () => void }) {
  const { gps, cameras, nvrs, addGps, addCamera, addNvr, removeGps, removeCamera, removeNvr } = useDevices();
  const [section, setSection] = useState<Section>("gps");

  const only = [client]; // el form asigna todo a este cliente
  const myGps = gps.filter((d) => d.clientUsername === client.username);
  const myNvrs = nvrs.filter((n) => n.clientUsername === client.username);
  const myCams = cameras.filter((c) => c.clientUsername === client.username);

  return (
    <div className="devmgr">
      <button className="bt-back" onClick={onBack}>
        ← Clientes
      </button>

      <header className="devmgr__head">
        <div>
          <h1 className="devmgr__title">{client.profile.businessName}</h1>
          <p className="fleet__subtitle">
            @{client.username} · {client.profile.plan} · {client.profile.contactName} · {client.profile.phone}
          </p>
        </div>
        <div className="devmgr__tabs">
          <button className={`devmgr__tab ${section === "gps" ? "devmgr__tab--active" : ""}`} onClick={() => setSection("gps")}>
            GPS ({myGps.length})
          </button>
          <button className={`devmgr__tab ${section === "nvr" ? "devmgr__tab--active" : ""}`} onClick={() => setSection("nvr")}>
            NVR ({myNvrs.length})
          </button>
          <button className={`devmgr__tab ${section === "cameras" ? "devmgr__tab--active" : ""}`} onClick={() => setSection("cameras")}>
            Cámaras ({myCams.length})
          </button>
        </div>
      </header>

      {section === "gps" && (
        <div className="devmgr__cols">
          <GpsForm clients={only} onAdd={addGps} />
          <section className="devlist">
            <h2 className="devlist__title">Equipos GPS de {client.profile.businessName}</h2>
            {myGps.length === 0 ? (
              <p className="devlist__empty">Todavía no tiene equipos GPS. Agregá uno con el formulario.</p>
            ) : (
              <ul className="devlist__items">
                {myGps.map((d) => (
                  <li key={d.id} className="devlist__item">
                    <div className="devlist__item-main">
                      <span className="devlist__item-name">{d.vehicleId}</span>
                      <span className="devlist__badge">{ASSET_TYPES.find((a) => a.id === d.assetType)?.label ?? d.assetType}</span>
                    </div>
                    <span className="devlist__item-line">
                      {[d.brand, d.model].filter(Boolean).join(" ") || "Sin marca/modelo"} · IMEI {d.imei} ·{" "}
                      {TRACKER_PROTOCOLS.find((p) => p.id === d.protocol)?.label ?? d.protocol}
                    </span>
                    <div className="devlist__item-actions">
                      <button className="devlist__action devlist__action--danger" onClick={() => removeGps(d.id)}>
                        ✕ Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {section === "nvr" && (
        <div className="devmgr__cols">
          <NvrForm clients={only} onAdd={addNvr} />
          <section className="devlist">
            <h2 className="devlist__title">NVR de {client.profile.businessName}</h2>
            {myNvrs.length === 0 ? (
              <p className="devlist__empty">Sin grabadores todavía.</p>
            ) : (
              <ul className="devlist__items">
                {myNvrs.map((n) => (
                  <li key={n.id} className="devlist__item">
                    <div className="devlist__item-main">
                      <span className="devlist__item-name">{n.name}</span>
                      <span className="devlist__badge">{NVR_BRANDS.find((b) => b.id === n.brand)?.label ?? n.brand}</span>
                    </div>
                    <span className="devlist__item-line">
                      {n.host}:{n.port} · {n.channels} canales
                    </span>
                    <div className="devlist__item-actions">
                      <button className="devlist__action devlist__action--danger" onClick={() => removeNvr(n.id)}>
                        ✕ Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {section === "cameras" && (
        <div className="devmgr__cols">
          <CameraForm clients={only} onAdd={addCamera} />
          <section className="devlist">
            <h2 className="devlist__title">Cámaras de {client.profile.businessName}</h2>
            {myCams.length === 0 ? (
              <p className="devlist__empty">Sin cámaras todavía.</p>
            ) : (
              <ul className="devlist__items">
                {myCams.map((c) => (
                  <li key={c.id} className="devlist__item">
                    <div className="devlist__item-main">
                      <span className="devlist__item-name">{c.name}</span>
                      <span className="devlist__badge">{CAMERA_TYPES.find((t) => t.id === c.type)?.label ?? c.type}</span>
                    </div>
                    <code className="devform__preview-url">{c.rtspUrl.replace(/:[^:@/]*@/, ":••••@")}</code>
                    <div className="devlist__item-actions">
                      <button className="devlist__action devlist__action--danger" onClick={() => removeCamera(c.id)}>
                        ✕ Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
