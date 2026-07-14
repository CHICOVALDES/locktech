import { useEffect } from "react";
import type { Detection, DetectionKind } from "@bali-moto-track/shared-types";

const KIND_LABEL: Record<DetectionKind, string> = {
  machine: "Máquina",
  person: "Persona",
  structure: "Estructura",
  activity: "Actividad",
};

interface LightboxProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  detections?: Detection[];
  /** Texto del contador arriba a la derecha (ej. "👷 24 personas" o "🚜 2 máquinas"). */
  badge?: string;
  onClose: () => void;
}

// Lightbox que amplía una captura de obra y dibuja marcos SUTILES sobre lo detectado
// (máquinas, personas, estructuras). Las cajas son normalizadas (0..1) respecto de la
// imagen, así que se posicionan en % y acompañan a la foto en cualquier tamaño.
export function DetectionLightbox({ imageUrl, title, subtitle, detections = [], badge, onClose }: LightboxProps) {
  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Resumen de detecciones por tipo, para la leyenda del pie.
  const counts = detections.reduce<Record<string, number>>((acc, d) => {
    acc[d.kind] = (acc[d.kind] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="dlb" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="dlb__panel" onClick={(e) => e.stopPropagation()}>
        <header className="dlb__bar">
          <div className="dlb__titles">
            <span className="dlb__title">{title}</span>
            {subtitle && <span className="dlb__sub">{subtitle}</span>}
          </div>
          {badge && <span className="dlb__badge">{badge}</span>}
          <button className="dlb__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className="dlb__stage">
          <div className="dlb__imgwrap">
            <img className="dlb__img" src={imageUrl} alt={title} />
            {detections.map((d, i) => {
              const [x, y, w, h] = d.box;
              return (
                <div
                  key={i}
                  className={`dlb-box dlb-box--${d.kind}`}
                  style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
                >
                  <span className="dlb-box__tag">
                    {d.icon ? `${d.icon} ` : ""}
                    {d.label}
                    {typeof d.conf === "number" ? ` ${Math.round(d.conf * 100)}%` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {detections.length > 0 && (
          <footer className="dlb__legend">
            <span className="dlb__legend-lead">Detectado por visión:</span>
            {(Object.keys(counts) as DetectionKind[]).map((k) => (
              <span key={k} className={`dlb__legend-item dlb__legend-item--${k}`}>
                <span className="dlb__legend-dot" /> {counts[k]} {KIND_LABEL[k].toLowerCase()}
                {counts[k] > 1 ? "s" : ""}
              </span>
            ))}
            <span className="dlb__legend-note">· marcado automático (demo)</span>
          </footer>
        )}
      </div>
    </div>
  );
}
