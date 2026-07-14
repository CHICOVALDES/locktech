import { useMemo, useState, type FormEvent } from "react";
import { clientAccounts } from "../auth/accounts.js";
import {
  ASSET_TYPES,
  buildNvrChannelRtsp,
  buildRtspUrl,
  buildSnapshotUrl,
  CAMERA_TYPES,
  NVR_BRANDS,
  TRACKER_PROTOCOLS,
  useDevices,
  type AssetType,
  type Camera,
  type CameraType,
  type Nvr,
  type NvrBrand,
  type TrackerProtocol,
} from "./deviceStore.js";
import { CameraPreview } from "./CameraPreview.js";

type Section = "gps" | "nvr" | "cameras";

export function DeviceManager() {
  const [section, setSection] = useState<Section>("gps");
  const { gps, cameras, nvrs, addGps, removeGps, addCamera, removeCamera, addNvr, removeNvr } = useDevices();
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
          <button className={`devmgr__tab ${section === "nvr" ? "devmgr__tab--active" : ""}`} onClick={() => setSection("nvr")}>
            NVR ({nvrs.length})
          </button>
          <button className={`devmgr__tab ${section === "cameras" ? "devmgr__tab--active" : ""}`} onClick={() => setSection("cameras")}>
            Cámaras ({cameras.length})
          </button>
        </div>
      </header>

      {clients.length === 0 && <p className="devmgr__warn">No hay clientes registrados todavía. Registrá un rental primero.</p>}

      {section === "nvr" ? (
        <div className="devmgr__cols">
          <NvrForm clients={clients} onAdd={addNvr} />
          <NvrList
            nvrs={nvrs}
            clientLabel={clientLabel}
            onRemove={removeNvr}
            onAddChannelCamera={addCamera}
          />
        </div>
      ) : section === "gps" ? (
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
          <CameraList cameras={cameras} clientLabel={clientLabel} onRemove={removeCamera} />
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
  const [previewUrl, setPreviewUrl] = useState("");
  const [testing, setTesting] = useState(false);

  const isHik = type === "hikvision";
  const rtspUrl = buildRtspUrl({ type, host: host || "IP-CAMARA", port, username, password, channel, stream, path });
  const canSubmit = name.trim() && host.trim() && clientUsername;

  function suggestSnapshot() {
    setPreviewUrl(buildSnapshotUrl({ type, host: host || "192.168.1.64", username, password, channel }));
  }

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
      previewUrl: previewUrl.trim() || undefined,
      clientUsername,
    });
    setName("");
    setHost("");
    setPassword("");
    setPreviewUrl("");
    setTesting(false);
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

      {/* Test en vivo: URL reproducible en el navegador (HLS/MJPEG/snapshot). */}
      <div className="devform__test">
        <div className="devform__test-head">
          <span className="devform__label">Probar imagen en vivo (URL HLS / MJPEG / snapshot)</span>
          <button type="button" className="devform__mini" onClick={suggestSnapshot} title="Sugerir snapshot HTTP por marca">
            sugerir
          </button>
        </div>
        <input
          className="devform__input"
          placeholder="https://tu-tunel/api/stream.m3u8?src=cam  ·  o snapshot .jpg"
          value={previewUrl}
          onChange={(e) => setPreviewUrl(e.target.value)}
        />
        <button
          type="button"
          className="devform__test-btn"
          onClick={() => setTesting(Boolean(previewUrl.trim()))}
          disabled={!previewUrl.trim()}
        >
          🔴 Probar en vivo
        </button>
        {testing && <CameraPreview url={previewUrl.trim()} />}
        <p className="devform__note">
          El navegador no reproduce RTSP directo. Para ver la cámara acá exponé un <b>HLS/MJPEG</b> por el túnel
          (ej. <code>go2rtc</code>/<code>MediaMTX</code> convierte RTSP→HLS) y pegá esa URL.
        </p>
      </div>

      <button className="devform__submit" type="submit" disabled={!canSubmit}>
        Agregar cámara
      </button>
    </form>
  );
}

/* ---------- Listado de cámaras con preview en vivo ---------- */

function CameraList({
  cameras,
  clientLabel,
  onRemove,
}: {
  cameras: Camera[];
  clientLabel: (username: string) => string;
  onRemove: (id: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="devlist">
      <h2 className="devlist__title">Cámaras dadas de alta</h2>
      {cameras.length === 0 ? (
        <p className="devlist__empty">Todavía no cargaste ninguna cámara.</p>
      ) : (
        <ul className="devlist__items">
          {cameras.map((c) => {
            const open = openId === c.id;
            return (
              <li key={c.id} className="devlist__item">
                <div className="devlist__item-main">
                  <span className="devlist__item-name">{c.name}</span>
                  <span className="devlist__badge">{CAMERA_TYPES.find((t) => t.id === c.type)?.label ?? c.type}</span>
                </div>
                <code className="devform__preview-url">{c.rtspUrl.replace(/:[^:@/]*@/, ":••••@")}</code>
                <span className="devlist__item-line">Cliente: {clientLabel(c.clientUsername)}</span>
                <div className="devlist__item-actions">
                  {c.previewUrl && (
                    <button className="devlist__action" onClick={() => setOpenId(open ? null : c.id)}>
                      {open ? "Ocultar" : "▶ Ver en vivo"}
                    </button>
                  )}
                  <button className="devlist__action devlist__action--danger" onClick={() => onRemove(c.id)}>
                    ✕ Eliminar
                  </button>
                </div>
                {open && c.previewUrl && <CameraPreview url={c.previewUrl} />}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ---------- Alta de NVR ---------- */

function NvrForm({
  clients,
  onAdd,
}: {
  clients: ReturnType<typeof clientAccounts>;
  onAdd: ReturnType<typeof useDevices>["addNvr"];
}) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState<NvrBrand>("hikvision");
  const [host, setHost] = useState("");
  const [port, setPort] = useState(554);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [channels, setChannels] = useState(8);
  const [clientUsername, setClientUsername] = useState(clients[0]?.username ?? "");

  const canSubmit = name.trim() && host.trim() && channels > 0 && clientUsername;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({
      name: name.trim(),
      brand,
      host: host.trim(),
      port,
      username: username.trim(),
      password,
      channels,
      clientUsername,
    });
    setName("");
    setHost("");
    setPassword("");
  }

  const preview = buildNvrChannelRtsp({ brand, host: host || "IP-NVR", port, username, password, channel: 1, stream: "main" });

  return (
    <form className="devform" onSubmit={handleSubmit}>
      <h2 className="devform__title">Agregar NVR / grabador</h2>

      <label className="devform__field">
        <span className="devform__label">Nombre / ubicación</span>
        <input className="devform__input" placeholder="NVR Oficina" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="devform__field">
        <span className="devform__label">Marca</span>
        <select className="devform__input" value={brand} onChange={(e) => setBrand(e.target.value as NvrBrand)}>
          {NVR_BRANDS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </label>

      <div className="devform__row">
        <label className="devform__field devform__field--grow">
          <span className="devform__label">IP / host</span>
          <input className="devform__input" placeholder="192.168.1.10" value={host} onChange={(e) => setHost(e.target.value)} />
        </label>
        <label className="devform__field devform__field--port">
          <span className="devform__label">Puerto RTSP</span>
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

      <label className="devform__field devform__field--port">
        <span className="devform__label">Cantidad de canales</span>
        <input className="devform__input" type="number" min={1} max={64} value={channels} onChange={(e) => setChannels(Number(e.target.value))} />
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

      <div className="devform__preview">
        <span className="devform__preview-label">RTSP del canal 1 (ejemplo)</span>
        <code className="devform__preview-url">{preview.replace(/:[^:@/]*@/, ":••••@")}</code>
      </div>

      <button className="devform__submit" type="submit" disabled={!canSubmit}>
        Agregar NVR
      </button>
    </form>
  );
}

/* ---------- Listado de NVR con canales ---------- */

function NvrList({
  nvrs,
  clientLabel,
  onRemove,
  onAddChannelCamera,
}: {
  nvrs: Nvr[];
  clientLabel: (username: string) => string;
  onRemove: (id: string) => void;
  onAddChannelCamera: ReturnType<typeof useDevices>["addCamera"];
}) {
  return (
    <section className="devlist">
      <h2 className="devlist__title">NVR dados de alta</h2>
      {nvrs.length === 0 ? (
        <p className="devlist__empty">Todavía no cargaste ningún grabador.</p>
      ) : (
        <ul className="devlist__items">
          {nvrs.map((nvr) => (
            <NvrCard key={nvr.id} nvr={nvr} clientLabel={clientLabel} onRemove={onRemove} onAddChannelCamera={onAddChannelCamera} />
          ))}
        </ul>
      )}
    </section>
  );
}

function NvrCard({
  nvr,
  clientLabel,
  onRemove,
  onAddChannelCamera,
}: {
  nvr: Nvr;
  clientLabel: (username: string) => string;
  onRemove: (id: string) => void;
  onAddChannelCamera: ReturnType<typeof useDevices>["addCamera"];
}) {
  const [open, setOpen] = useState(false);
  const brandLabel = NVR_BRANDS.find((b) => b.id === nvr.brand)?.label ?? nvr.brand;
  const channels = Array.from({ length: nvr.channels }, (_, i) => i + 1);

  function addChannel(channel: number) {
    const rtspUrl = buildNvrChannelRtsp({
      brand: nvr.brand,
      host: nvr.host,
      port: nvr.port,
      username: nvr.username,
      password: nvr.password,
      channel,
      stream: "main",
    });
    onAddChannelCamera({
      name: `${nvr.name} · Canal ${channel}`,
      type: "rtsp",
      host: nvr.host,
      port: nvr.port,
      username: nvr.username,
      password: nvr.password,
      channel,
      stream: "main",
      path: rtspUrl.replace(/^rtsp:\/\/[^/]+\//, ""),
      rtspUrl,
      clientUsername: nvr.clientUsername,
    });
  }

  return (
    <li className="devlist__item">
      <div className="devlist__item-main">
        <span className="devlist__item-name">{nvr.name}</span>
        <span className="devlist__badge">{brandLabel}</span>
      </div>
      <span className="devlist__item-line">
        {nvr.host}:{nvr.port} · {nvr.channels} canales
      </span>
      <span className="devlist__item-line">Cliente: {clientLabel(nvr.clientUsername)}</span>

      <button className="devform__submit" style={{ marginTop: 8 }} onClick={() => setOpen((v) => !v)} type="button">
        {open ? "Ocultar canales" : `Ver ${nvr.channels} canales`}
      </button>

      {open && (
        <ul className="devlist__items" style={{ marginTop: 8 }}>
          {channels.map((ch) => {
            const url = buildNvrChannelRtsp({
              brand: nvr.brand,
              host: nvr.host,
              port: nvr.port,
              username: nvr.username,
              password: nvr.password,
              channel: ch,
              stream: "main",
            });
            return (
              <li key={ch} className="devlist__item">
                <div className="devlist__item-main">
                  <span className="devlist__item-name">Canal {ch}</span>
                  <button className="devlist__badge" style={{ cursor: "pointer" }} onClick={() => addChannel(ch)} type="button">
                    + Cámara
                  </button>
                </div>
                <code className="devform__preview-url">{url.replace(/:[^:@/]*@/, ":••••@")}</code>
              </li>
            );
          })}
        </ul>
      )}

      <button className="devlist__remove" onClick={() => onRemove(nvr.id)} aria-label="Eliminar">
        ✕
      </button>
    </li>
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
