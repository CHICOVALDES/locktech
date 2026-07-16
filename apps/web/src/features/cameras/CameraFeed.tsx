import { useEffect, useMemo, useState } from "react";
import { loadCamerasForClient } from "../admin/deviceStore.js";
import { CameraPreview } from "../admin/CameraPreview.js";

// Cámara REAL en vivo (demo): stream público de una webcam 24/7 en Bali
// (costa Kuta/Seminyak/Canggu, canal @Bali_Weather en YouTube). Se embebe por
// iframe porque el navegador reproduce HLS/YouTube directo; una Hikvision propia
// (RTSP) seguiría necesitando un conversor intermedio a HLS/WebRTC.
//
// Para cambiar de cámara, reemplazá BALI_CAM_VIDEO_ID por el id de otro stream
// en vivo (la parte v=... de la URL de YouTube).
const BALI_CAM_VIDEO_ID = "L1duJDAqbJY";
const BALI_CAM_SRC = `https://www.youtube.com/embed/${BALI_CAM_VIDEO_ID}?autoplay=1&mute=1&playsinline=1&rel=0`;

// Videos grabados que se muestran debajo de la cámara online, en orden.
// Los archivos viven en apps/web/public/videos/. Para cambiar el nombre que se
// ve, editá "title"; para cambiar el video, reemplazá el archivo o "src".
interface CameraClip {
  title: string;
  subtitle: string;
  src: string;
}

const CAMERA_CLIPS: CameraClip[] = [
  { title: "Yim Lipe · Construcción", subtitle: "Seaside · ene–ago", src: "/videos/construction-seaside.mp4" },
  { title: "Templo", subtitle: "ene–ago", src: "/videos/temple.mp4" },
];

// URL HLS en vivo de la cámara de La Parada (restaurante). Se completa cuando
// go2rtc + túnel están activos (ver C:\Users\User\bt-camara\iniciar-camara.bat →
// https://<tunel>.trycloudflare.com/api/stream.m3u8?src=oficina1). Vacío = aún no
// conectada (no se muestra la tarjeta hasta tener URL).
const LAPARADA_CAM_URL = "https://throat-simply-mitsubishi-dos.trycloudflare.com/api/stream.m3u8?src=laparada";

// Cámaras "baked" por cliente (no dependen del localStorage del admin), para que
// el cliente SIEMPRE vea su cámara en su área "Cámaras".
const SEED_CAMERAS: Record<string, { id: string; name: string; url: string }[]> = {
  laparada: [{ id: "seed-parada-jardin", name: "La Parada · Jardín", url: LAPARADA_CAM_URL }],
};

// Tarjeta de cámara del cliente con LUZ verde/roja según el estado real de la
// conexión: verde = imagen recibida, rojo = sin señal, ámbar = conectando.
function ClientCameraCard({ name, url }: { name: string; url: string }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const state = ok === null ? "wait" : ok ? "on" : "off";
  return (
    <div className="camera-mine__item">
      <div className="camera-mine__head">
        <span className="camera-mine__name">📹 {name}</span>
        <span className={`camera-light camera-light--${state}`}>
          <span className="camera-light__dot" />
          {ok === null ? "CONECTANDO…" : ok ? "EN VIVO" : "SIN SEÑAL"}
        </span>
      </div>
      <CameraPreview url={url} onStatus={setOk} />
    </div>
  );
}

export function CameraFeed({ clientUsername }: { clientUsername?: string }) {
  const [now, setNow] = useState(new Date());
  const [motionAlert, setMotionAlert] = useState(false);

  // Cámaras del cliente: las "baked" (seed) + las dadas de alta por el admin
  // (localStorage). Solo las que tienen URL de preview.
  const myCameras = useMemo(() => {
    if (!clientUsername) return [] as { id: string; name: string; url: string }[];
    const seeded = (SEED_CAMERAS[clientUsername] ?? []).filter((c) => c.url);
    const registered = loadCamerasForClient(clientUsername)
      .filter((c) => c.previewUrl)
      .map((c) => ({ id: c.id, name: c.name, url: c.previewUrl! }));
    return [...seeded, ...registered];
  }, [clientUsername]);

  // Contenido demo (webcam pública de Bali + clips de obra) solo para la cuenta
  // de demostración. Un usuario nuevo ve SOLO sus propias cámaras, nada ajeno.
  const showDemoContent = clientUsername === "mrrental";

  useEffect(() => {
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    const motionInterval = setInterval(() => {
      setMotionAlert(true);
      setTimeout(() => setMotionAlert(false), 4000);
    }, 14000);
    return () => {
      clearInterval(clockInterval);
      clearInterval(motionInterval);
    };
  }, []);

  return (
    <div className="camera-panel">
      <h1 className="registros__title">Cámaras</h1>

      {/* Cámaras reales del cliente (dadas de alta por el admin) */}
      {myCameras.length > 0 && (
        <div className="camera-mine">
          {myCameras.map((cam) => (
            <ClientCameraCard key={cam.id} name={cam.name} url={cam.url} />
          ))}
        </div>
      )}

      {/* Estado vacío para clientes sin cámaras (usuario nuevo, limpio) */}
      {!showDemoContent && myCameras.length === 0 && (
        <p className="camera-empty">Todavía no tenés cámaras conectadas. El administrador puede dar de alta tus cámaras y aparecerán acá en vivo.</p>
      )}

      {/* Contenido demo: solo para la cuenta de demostración */}
      {showDemoContent && (
        <>
          <div className="camera-feed">
            <div className="camera-feed__video">
              <iframe
                className="camera-feed__stream"
                src={BALI_CAM_SRC}
                title="Cámara en vivo — Bali"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />

              {motionAlert && <span className="camera-feed__motion">⚠ MOVIMIENTO DETECTADO</span>}

              <div className="camera-feed__overlay-top">
                <span className="camera-feed__live">
                  <span className="camera-feed__live-dot" /> EN VIVO
                </span>
                <span className="camera-feed__time">
                  {now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>

              <div className="camera-feed__overlay-bottom">CAM-01 · BALI · EN VIVO</div>
            </div>

            <p className="camera-feed__note">
              Cámara pública en vivo de Bali (costa Kuta/Seminyak/Canggu) — contenido de demostración.
            </p>
          </div>

          <div className="camera-clips">
            {CAMERA_CLIPS.map((clip) => (
              <figure className="camera-clip" key={clip.src}>
                <video className="camera-clip__video" src={clip.src} controls preload="metadata" playsInline />
                <figcaption className="camera-clip__caption">
                  <span className="camera-clip__title">{clip.title}</span>
                  <span className="camera-clip__subtitle">{clip.subtitle}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
