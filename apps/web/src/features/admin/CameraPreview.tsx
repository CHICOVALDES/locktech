import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

// Preview / test en vivo de una cámara desde el admin. El navegador NO reproduce
// RTSP, así que este componente prueba una URL reproducible en el browser:
//   • HLS (.m3u8)         -> <video> con hls.js (o nativo en Safari)
//   • MJPEG / snapshot    -> <img>  (ej. go2rtc /api/stream.mjpeg, /api/frame.jpeg)
// Muestra el estado: conectando / imagen recibida / sin señal. Sirve para probar
// en el momento si la cámara (por el túnel) está dando imagen.

type Status = "idle" | "loading" | "ok" | "error";

export function CameraPreview({ url, onStatus }: { url: string; onStatus?: (ok: boolean) => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [nonce, setNonce] = useState(0); // para forzar recarga
  const videoRef = useRef<HTMLVideoElement>(null);

  const isHls = /\.m3u8(\?|$)/i.test(url);

  // Reproducción HLS.
  useEffect(() => {
    if (!isHls || !url) return;
    const video = videoRef.current;
    if (!video) return;
    setStatus("loading");
    let hls: Hls | null = null;
    let retries = 0;
    // El transcode (go2rtc/ffmpeg) arranca on-demand y tarda unos segundos: damos
    // tiempo y reintentamos ante errores de red antes de rendirnos.
    const timeout = window.setTimeout(() => setStatus((s) => (s === "loading" ? "error" : s)), 30000);

    function ok() {
      window.clearTimeout(timeout);
      setStatus("ok");
      onStatus?.(true);
    }
    function fail() {
      window.clearTimeout(timeout);
      setStatus("error");
      onStatus?.(false);
    }

    if (Hls.isSupported()) {
      hls = new Hls({ lowLatencyMode: true, manifestLoadingMaxRetry: 8, levelLoadingMaxRetry: 8, fragLoadingMaxRetry: 8 });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => void video.play().then(ok).catch(ok));
      hls.on(Hls.Events.FRAG_BUFFERED, ok); // hay video real -> OK
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal || !hls) return;
        // Arranque en frío del stream: reintentar en vez de fallar.
        if (retries < 6) {
          retries++;
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else window.setTimeout(() => hls && hls.startLoad(), 2500);
        } else {
          fail();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari: HLS nativo
      video.src = url;
      video.addEventListener("loadeddata", ok, { once: true });
      video.addEventListener("error", fail, { once: true });
      void video.play().catch(() => {});
    } else {
      fail();
    }

    return () => {
      window.clearTimeout(timeout);
      hls?.destroy();
    };
  }, [url, isHls, nonce, onStatus]);

  if (!url) {
    return <div className="campreview campreview--empty">Ingresá una URL de preview (HLS/MJPEG/snapshot) y tocá “Probar”.</div>;
  }

  return (
    <div className="campreview">
      <div className="campreview__stage">
        {isHls ? (
          <video ref={videoRef} className="campreview__media" muted autoPlay playsInline controls />
        ) : (
          <img
            className="campreview__media"
            src={`${url}${url.includes("?") ? "&" : "?"}_=${nonce}`}
            alt="preview"
            onLoad={() => {
              setStatus("ok");
              onStatus?.(true);
            }}
            onError={() => {
              setStatus("error");
              onStatus?.(false);
            }}
          />
        )}
        <span className={`campreview__badge campreview__badge--${status}`}>
          {status === "ok" && "● IMAGEN RECIBIDA"}
          {status === "loading" && "○ CONECTANDO…"}
          {status === "error" && "✕ SIN SEÑAL"}
          {status === "idle" && "○ LISTO"}
        </span>
      </div>
      <div className="campreview__actions">
        <button type="button" className="campreview__btn" onClick={() => { setStatus("loading"); setNonce((n) => n + 1); }}>
          ↻ Reintentar
        </button>
        <span className="campreview__hint">
          {isHls ? "HLS (video en vivo)" : "MJPEG / snapshot (imagen)"}
        </span>
      </div>
    </div>
  );
}
