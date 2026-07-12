import { useMemo, useState, type FormEvent } from "react";
import { clientAccounts } from "../auth/accounts.js";
import {
  ASSET_TYPES,
  buildRtspUrl,
  CAMERA_TYPES,
  TRACKER_PROTOCOLS,
  useDevices,
  type AssetType,
  type CameraType,
  type TrackerProtocol,
} from "./deviceStore.js";

type Section = "gps" | "cameras";

export function DeviceManager() {
  const [section, setSection] = useState<Section>("gps");
  const { gps, cameras, addGps, removeGps, addCamera, removeCamera } = useDevices();
  const clients = useMemo(() => clientAccounts(), []);
  const clientLabel = (username: string) => clients.find((c) => c.username === username)?.profile.businessName ?? username;

  return (
    <div className="devmgr">
      <header className="devmgr__head">
        <h1 className="devmgr__title">DISPOSITIVOS</h1>
        <div className="devmgr__tabs">
          <button className={`devmgr__tab ${section === "gps" ? "devmgr__tab--active" : ""}`} onClick={() => setSection("gps")}>
            GPS ({gps.length})
          </button>
          <button className={`devmgr__tab ${section === "cameras" ? "devmgr__tab--active" : ""}`} onClick={() => setSection("cameras")}>
            Cámaras ({cameras.length})
          </button>
        </div>
      </header>

      {clients.length === 0 && <p className="devmgr__warn">No hay clientes registrados todavía. Registrá un rental primero.</p>}

      {section === "gps" ? (
        <div className="devmgr__cols">
          <GpsForm clients={clients} onAdd={addGps} />
          <DeviceList
            title="GPS dados de alta"
            empty="Todavía no cargaste ningún tracker."
            items={gps.map((d) => ({
              id: d.id,
              primary: d.vehicleId,
              badge: ASSET_TYPES.find((a) => a.id === d.assetType)?.label ?? d.assetType ?? "—",
              lines: [
                [d.brand, d.model].filter(Boolean).join(" ") || "Sin marca/modelo",
                `IMEI ${d.imei} · ${TRACKER_PROTOCOLS.find((p) => p.id === d.protocol)?.label ?? d.protocol}`,
                `Cliente: ${clientLabel(d.clientUsername)}`,
              ],
            }))}
            onRemove={removeGps}
          />
        </div>
      ) : (
        <div className="devmgr__cols">
          <CameraForm clients={clients} onAdd={addCamera} />
          <DeviceList
            title="Cámaras dadas de alta"
            empty="Todavía no cargaste ninguna cámara."
            items={cameras.map((c) => ({
              id: c.id,
              primary: c.name,
              badge: CAMERA_TYPES.find((t) => t.id === c.type)?.label ?? c.type,
              lines: [c.rtspUrl.replace(/:[^:@/]*@/, ":••••@"), `Cliente: ${clientLabel(c.clientUsername)}`],
            }))}
            onRemove={removeCamera}
          />
        </div>
      )}
    </div>
  );
}

/* ---------- Alta de GPS ---------- */

function GpsForm({
  clients,
  onAdd,
}: {
  clients: ReturnType<typeof clientAccounts>;
  onAdd: ReturnType<typeof useDevices>["addGps"];
}) {
  const [vehicleId, setVehicleId] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("moto");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [imei, setImei] = useState("");
  const [protocol, setProtocol] = useState<TrackerProtocol>("h02");
  const [clientUsername, setClientUsername] = useState(clients[0]?.username ?? "");

  const canSubmit = vehicleId.trim() && imei.trim() && clientUsername;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({ vehicleId: vehicleId.trim(), assetType, brand: brand.trim(), model: model.trim(), imei: imei.trim(), protocol, clientUsername });
    setVehicleId("");
    setBrand("");
    setModel("");
    setImei("");
  }

  return (
    <form className="devform" onSubmit={handleSubmit}>
      <h2 className="devform__title">Agregar equipo</h2>

      <label className="devform__field">
        <span className="devform__label">Identificador / patente</span>
        <input className="devform__input" placeholder="RM-XMAX-180" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
      </label>

      <label className="devform__field">
        <span className="devform__label">Tipo de activo</span>
        <select className="devform__input" value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)}>
          {ASSET_TYPES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <div className="devform__row">
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Marca</span>
          <input className="devform__input" placeholder="Yamaha" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </label>
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Modelo</span>
          <input className="devform__input" placeholder="NMAX 155" value={model} onChange={(e) => setModel(e.target.value)} />
        </label>
      </div>

      <label className="devform__field">
        <span className="devform__label">IMEI del tracker</span>
        <input className="devform__input" placeholder="860123456789012" value={imei} onChange={(e) => setImei(e.target.value)} />
      </label>

      <label className="devform__field">
        <span className="devform__label">Protocolo del tracker</span>
        <select className="devform__input" value={protocol} onChange={(e) => setProtocol(e.target.value as TrackerProtocol)}>
          {TRACKER_PROTOCOLS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="devform__field">
        <span className="devform__label">Asignar a cliente</span>
        <select className="devform__input" value={clientUsername} onChange={(e) => setClientUsername(e.target.value)}>
          {clients.map((c) => (
            <option key={c.username} value={c.username}>
              {c.profile.businessName}
            </option>
          ))}
        </select>
      </label>

      <button className="devform__submit" type="submit" disabled={!canSubmit}>
        Agregar equipo
      </button>
    </form>
  );
}

/* ---------- Alta de cámara ---------- */

function CameraForm({
  clients,
  onAdd,
}: {
  clients: ReturnType<typeof clientAccounts>;
  onAdd: ReturnType<typeof useDevices>["addCamera"];
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CameraType>("hikvision");
  const [host, setHost] = useState("");
  const [port, setPort] = useState(554);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [channel, setChannel] = useState(1);
  const [stream, setStream] = useState<"main" | "sub">("main");
  const [path, setPath] = useState("Streaming/Channels/101");
  const [clientUsername, setClientUsername] = useState(clients[0]?.username ?? "");

  const isHik = type === "hikvision";
  const rtspUrl = buildRtspUrl({ type, host: host || "IP-CAMARA", port, username, password, channel, stream, path });
  const canSubmit = name.trim() && host.trim() && clientUsername;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({
      name: name.trim(),
      type,
      host: host.trim(),
      port,
      username: username.trim(),
      password,
      channel,
      stream,
      path: path.trim(),
      rtspUrl: buildRtspUrl({ type, host: host.trim(), port, username: username.trim(), password, channel, stream, path: path.trim() }),
      clientUsername,
    });
    setName("");
    setHost("");
    setPassword("");
  }

  return (
    <form className="devform" onSubmit={handleSubmit}>
      <h2 className="devform__title">Agregar cámara</h2>

      <label className="devform__field">
        <span className="devform__label">Nombre / ubicación</span>
        <input className="devform__input" placeholder="Portón entrada" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="devform__field">
        <span className="devform__label">Tipo</span>
        <select className="devform__input" value={type} onChange={(e) => setType(e.target.value as CameraType)}>
          {CAMERA_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <div className="devform__row">
        <label className="devform__field devform__field--grow">
          <span className="devform__label">IP / host</span>
          <input className="devform__input" placeholder="192.168.1.64" value={host} onChange={(e) => setHost(e.target.value)} />
        </label>
        <label className="devform__field devform__field--port">
          <span className="devform__label">Puerto</span>
          <input className="devform__input" type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} />
        </label>
      </div>

      <div className="devform__row">
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Usuario</span>
          <input className="devform__input" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Contraseña</span>
          <input className="devform__input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      </div>

      {isHik ? (
        <div className="devform__row">
          <label className="devform__field devform__field--port">
            <span className="devform__label">Canal</span>
            <input className="devform__input" type="number" min={1} value={channel} onChange={(e) => setChannel(Number(e.target.value))} />
          </label>
          <label className="devform__field devform__field--grow">
            <span className="devform__label">Stream</span>
            <select className="devform__input" value={stream} onChange={(e) => setStream(e.target.value as "main" | "sub")}>
              <option value="main">Principal (alta)</option>
              <option value="sub">Secundario (baja)</option>
            </select>
          </label>
        </div>
      ) : (
        <label className="devform__field">
          <span className="devform__label">Ruta del stream</span>
          <input className="devform__input" placeholder="onvif1 / live/ch0" value={path} onChange={(e) => setPath(e.target.value)} />
        </label>
      )}

      <label className="devform__field">
        <span className="devform__label">Asignar a cliente</span>
        <select className="devform__input" value={clientUsername} onChange={(e) => setClientUsername(e.target.value)}>
          {clients.map((c) => (
            <option key={c.username} value={c.username}>
              {c.profile.businessName}
            </option>
          ))}
        </select>
      </label>

      <div className="devform__preview">
        <span className="devform__preview-label">URL RTSP generada</span>
        <code className="devform__preview-url">{rtspUrl.replace(/:[^:@/]*@/, ":••••@")}</code>
      </div>

      <button className="devform__submit" type="submit" disabled={!canSubmit}>
        Agregar cámara
      </button>
    </form>
  );
}

/* ---------- Listado genérico ---------- */

interface ListItem {
  id: string;
  primary: string;
  badge: string;
  lines: string[];
}

function DeviceList({
  title,
  empty,
  items,
  onRemove,
}: {
  title: string;
  empty: string;
  items: ListItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <section className="devlist">
      <h2 className="devlist__title">{title}</h2>
      {items.length === 0 ? (
        <p className="devlist__empty">{empty}</p>
      ) : (
        <ul className="devlist__items">
          {items.map((item) => (
            <li key={item.id} className="devlist__item">
              <div className="devlist__item-main">
                <span className="devlist__item-name">{item.primary}</span>
                <span className="devlist__badge">{item.badge}</span>
              </div>
              {item.lines.map((line) => (
                <span key={line} className="devlist__item-line">
                  {line}
                </span>
              ))}
              <button className="devlist__remove" onClick={() => onRemove(item.id)} aria-label="Eliminar">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
