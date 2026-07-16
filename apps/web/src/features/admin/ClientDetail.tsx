import { useState } from "react";
import type { ClientAccount } from "../auth/accounts.js";
import {
  useDevices,
  buildNvrChannelRtsp,
  ASSET_TYPES,
  TRACKER_PROTOCOLS,
  CAMERA_TYPES,
  NVR_BRANDS,
  type GpsDevice,
  type Camera,
  type Nvr,
} from "./deviceStore.js";
import { GpsForm, CameraForm, NvrForm } from "./DeviceManager.js";
import { CameraPreview } from "./CameraPreview.js";

// Detalle de un cliente (admin): alta / edición / test de conexión de SUS equipos
// (GPS, NVR, cámaras) — todo asignado a este cliente.
type Section = "gps" | "nvr" | "cameras";

export function ClientDetail({ client, onBack }: { client: ClientAccount; onBack: () => void }) {
  const dev = useDevices();
  const [section, setSection] = useState<Section>("gps");

  const only = [client];
  const myGps = dev.gps.filter((d) => d.clientUsername === client.username);
  const myNvrs = dev.nvrs.filter((n) => n.clientUsername === client.username);
  const myCams = dev.cameras.filter((c) => c.clientUsername === client.username);

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
          <GpsForm clients={only} onAdd={dev.addGps} />
          <section className="devlist">
            <h2 className="devlist__title">Equipos GPS</h2>
            {myGps.length === 0 ? (
              <p className="devlist__empty">Todavía no tiene equipos GPS. Agregá uno con el formulario.</p>
            ) : (
              <ul className="devlist__items">
                {myGps.map((d) => (
                  <GpsRow key={d.id} d={d} onUpdate={dev.updateGps} onRemove={dev.removeGps} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {section === "nvr" && (
        <div className="devmgr__cols">
          <NvrForm clients={only} onAdd={dev.addNvr} />
          <section className="devlist">
            <h2 className="devlist__title">NVR</h2>
            {myNvrs.length === 0 ? (
              <p className="devlist__empty">Sin grabadores todavía.</p>
            ) : (
              <ul className="devlist__items">
                {myNvrs.map((n) => (
                  <NvrRow key={n.id} n={n} onUpdate={dev.updateNvr} onRemove={dev.removeNvr} onAddCamera={dev.addCamera} clientUsername={client.username} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {section === "cameras" && (
        <div className="devmgr__cols">
          <CameraForm clients={only} onAdd={dev.addCamera} />
          <section className="devlist">
            <h2 className="devlist__title">Cámaras</h2>
            {myCams.length === 0 ? (
              <p className="devlist__empty">Sin cámaras todavía.</p>
            ) : (
              <ul className="devlist__items">
                {myCams.map((c) => (
                  <CameraRow key={c.id} c={c} onUpdate={dev.updateCamera} onRemove={dev.removeCamera} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

/* ---------- Fila de GPS: info + conectar (señal) + editar ---------- */
function GpsRow({ d, onUpdate, onRemove }: { d: GpsDevice; onUpdate: (id: string, p: Partial<GpsDevice>) => void; onRemove: (id: string) => void }) {
  const [edit, setEdit] = useState(false);
  const [vehicleId, setVehicleId] = useState(d.vehicleId);
  const [brand, setBrand] = useState(d.brand);
  const [model, setModel] = useState(d.model);
  const [imei, setImei] = useState(d.imei);

  function save() {
    onUpdate(d.id, { vehicleId: vehicleId.trim(), brand: brand.trim(), model: model.trim(), imei: imei.trim() });
    setEdit(false);
  }

  return (
    <li className="devlist__item">
      <div className="devlist__item-main">
        <span className="devlist__item-name">{d.vehicleId}</span>
        <span className="devlist__badge">{ASSET_TYPES.find((a) => a.id === d.assetType)?.label ?? d.assetType}</span>
      </div>
      {!edit ? (
        <>
          <span className="devlist__item-line">
            {[d.brand, d.model].filter(Boolean).join(" ") || "Sin marca/modelo"} · IMEI {d.imei} ·{" "}
            {TRACKER_PROTOCOLS.find((p) => p.id === d.protocol)?.label ?? d.protocol}
          </span>
          <ConnectTest kind="gps" />
          <div className="devlist__item-actions">
            <button className="devlist__action" onClick={() => setEdit(true)}>✎ Editar</button>
            <button className="devlist__action devlist__action--danger" onClick={() => onRemove(d.id)}>✕ Eliminar</button>
          </div>
        </>
      ) : (
        <div className="devrow-edit">
          <input className="devform__input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} placeholder="Identificador" />
          <div className="devform__row">
            <input className="devform__input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marca" />
            <input className="devform__input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Modelo" />
          </div>
          <input className="devform__input" value={imei} onChange={(e) => setImei(e.target.value)} placeholder="IMEI" />
          <div className="devform__row">
            <button className="devform__submit" onClick={save}>Guardar</button>
            <button className="devform__cancel" onClick={() => setEdit(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </li>
  );
}

/* ---------- Fila de NVR: info + editar IP + ver cámaras de su red ---------- */
function NvrRow({
  n,
  onUpdate,
  onRemove,
  onAddCamera,
  clientUsername,
}: {
  n: Nvr;
  onUpdate: (id: string, p: Partial<Nvr>) => void;
  onRemove: (id: string) => void;
  onAddCamera: (c: Omit<Camera, "id" | "createdAt">) => void;
  clientUsername: string;
}) {
  const [edit, setEdit] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [name, setName] = useState(n.name);
  const [host, setHost] = useState(n.host);
  const [port, setPort] = useState(n.port);
  const [username, setUsername] = useState(n.username);
  const [password, setPassword] = useState(n.password);
  const [channels, setChannels] = useState(n.channels);

  function save() {
    onUpdate(n.id, { name: name.trim(), host: host.trim(), port, username: username.trim(), password, channels });
    setEdit(false);
  }

  function addChannelAsCamera(ch: number) {
    const rtspUrl = buildNvrChannelRtsp({ brand: n.brand, host: n.host, port: n.port, username: n.username, password: n.password, channel: ch, stream: "main" });
    onAddCamera({
      name: `${n.name} · Canal ${ch}`,
      type: "rtsp",
      host: n.host,
      port: n.port,
      username: n.username,
      password: n.password,
      channel: ch,
      stream: "main",
      path: rtspUrl.replace(/^rtsp:\/\/[^/]+\//, ""),
      rtspUrl,
      clientUsername,
    });
  }

  return (
    <li className="devlist__item">
      <div className="devlist__item-main">
        <span className="devlist__item-name">{n.name}</span>
        <span className="devlist__badge">{NVR_BRANDS.find((b) => b.id === n.brand)?.label ?? n.brand}</span>
      </div>
      {!edit ? (
        <>
          <span className="devlist__item-line">
            📡 {n.host}:{n.port} · {n.channels} canales
          </span>
          <ConnectTest kind="nvr" />
          <div className="devlist__item-actions">
            <button className="devlist__action" onClick={() => setShowChannels((s) => !s)}>
              {showChannels ? "Ocultar cámaras" : `📷 Ver cámaras de la red (${n.channels})`}
            </button>
            <button className="devlist__action" onClick={() => setEdit(true)}>✎ Editar IP / accesos</button>
            <button className="devlist__action devlist__action--danger" onClick={() => onRemove(n.id)}>✕ Eliminar</button>
          </div>

          {/* Cámaras que cuelgan del NVR (su red): cada canal con su RTSP */}
          {showChannels && (
            <ul className="devlist__items nvr-channels">
              {Array.from({ length: n.channels }, (_, i) => i + 1).map((ch) => {
                const url = buildNvrChannelRtsp({ brand: n.brand, host: n.host, port: n.port, username: n.username, password: n.password, channel: ch, stream: "main" });
                return (
                  <li key={ch} className="devlist__item">
                    <div className="devlist__item-main">
                      <span className="devlist__item-name">Canal {ch}</span>
                      <button className="devlist__action" onClick={() => addChannelAsCamera(ch)}>+ Agregar cámara</button>
                    </div>
                    <code className="devform__preview-url">{url.replace(/:[^:@/]*@/, ":••••@")}</code>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <div className="devrow-edit">
          <input className="devform__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
          <div className="devform__row">
            <input className="devform__input" value={host} onChange={(e) => setHost(e.target.value)} placeholder="IP / host" />
            <input className="devform__input" type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} placeholder="Puerto" />
          </div>
          <div className="devform__row">
            <input className="devform__input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
            <input className="devform__input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
          </div>
          <input className="devform__input" type="number" value={channels} onChange={(e) => setChannels(Number(e.target.value))} placeholder="Canales" />
          <div className="devform__row">
            <button className="devform__submit" onClick={save}>Guardar</button>
            <button className="devform__cancel" onClick={() => setEdit(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </li>
  );
}

/* ---------- Fila de cámara: info + conectar (imagen) + editar ---------- */
function CameraRow({ c, onUpdate, onRemove }: { c: Camera; onUpdate: (id: string, p: Partial<Camera>) => void; onRemove: (id: string) => void }) {
  const [edit, setEdit] = useState(false);
  const [show, setShow] = useState(false);
  const [name, setName] = useState(c.name);
  const [host, setHost] = useState(c.host);
  const [username, setUsername] = useState(c.username);
  const [password, setPassword] = useState(c.password);
  const [previewUrl, setPreviewUrl] = useState(c.previewUrl ?? "");

  function save() {
    onUpdate(c.id, { name: name.trim(), host: host.trim(), username: username.trim(), password, previewUrl: previewUrl.trim() || undefined });
    setEdit(false);
  }

  return (
    <li className="devlist__item">
      <div className="devlist__item-main">
        <span className="devlist__item-name">{c.name}</span>
        <span className="devlist__badge">{CAMERA_TYPES.find((t) => t.id === c.type)?.label ?? c.type}</span>
      </div>
      {!edit ? (
        <>
          <code className="devform__preview-url">{c.rtspUrl.replace(/:[^:@/]*@/, ":••••@")}</code>
          <div className="devlist__item-actions">
            {c.previewUrl ? (
              <button className="devlist__action" onClick={() => setShow((s) => !s)}>
                {show ? "Ocultar" : "🔌 Conectar"}
              </button>
            ) : (
              <span className="devlist__item-line">Agregá una URL de preview (Editar) para conectar</span>
            )}
            <button className="devlist__action" onClick={() => setEdit(true)}>✎ Editar</button>
            <button className="devlist__action devlist__action--danger" onClick={() => onRemove(c.id)}>✕ Eliminar</button>
          </div>
          {show && c.previewUrl && <CameraPreview url={c.previewUrl} />}
        </>
      ) : (
        <div className="devrow-edit">
          <input className="devform__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre / ubicación" />
          <div className="devform__row">
            <input className="devform__input" value={host} onChange={(e) => setHost(e.target.value)} placeholder="IP / host" />
            <input className="devform__input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
          </div>
          <input className="devform__input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
          <input className="devform__input" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="URL de preview (HLS/MJPEG)" />
          <div className="devform__row">
            <button className="devform__submit" onClick={save}>Guardar</button>
            <button className="devform__cancel" onClick={() => setEdit(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </li>
  );
}

/* ---------- Test de conexión (GPS = señal, NVR = enlace) ---------- */
function ConnectTest({ kind }: { kind: "gps" | "nvr" }) {
  const [st, setSt] = useState<"idle" | "connecting" | "ok">("idle");

  function connect() {
    setSt("connecting");
    // En la demo se simula; con el tracker real la señal llega por el server H02.
    window.setTimeout(() => setSt("ok"), 1400);
  }

  if (st === "idle") {
    return (
      <button className="devconn__btn" onClick={connect}>
        🔌 Conectar
      </button>
    );
  }
  if (st === "connecting") {
    return <span className="devconn devconn--loading">○ Conectando…</span>;
  }
  return (
    <span className="devconn devconn--ok">
      ● {kind === "gps" ? "GPS conectado · señal OK (4G · sat 9/12)" : "NVR conectado · enlace OK"}
    </span>
  );
}
