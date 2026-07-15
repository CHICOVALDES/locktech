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

export function CameraFeed({ clientUsername }: { clientUsername?: string }) {
  const [now, setNow] = useState(new Date());
  const [motionAlert, setMotionAlert] = useState(false);

  // Cámaras reales dadas de alta para este cliente por el admin (con preview).
  const myCameras = useMemo(
    () => (clientUsername ? loadCamerasForClient(clientUsername).filter((c) => c.previewUrl) : []),
    [clientUsername],
  );

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
            <div className="camera-mine__item" key={cam.id}>
              <div className="camera-mine__head">
                <span className="camera-mine__name">📹 {cam.name}</span>
                <span className="camera-mine__badge">EN VIVO</span>
              </div>
              <CameraPreview url={cam.previewUrl!} />
            </div>
          ))}
        </div>
      )}

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
          Cámara pública en vivo de Bali (costa Kuta/Seminyak/Canggu). Para conectar tu Hikvision real necesito: la
          IP de la cámara en la red donde corra el servidor, usuario/contraseña (o el ID de Hik-Connect), y un
          servicio que convierta el RTSP a HLS/WebRTC reproducible en el navegador.
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
    </div>
  );
}
