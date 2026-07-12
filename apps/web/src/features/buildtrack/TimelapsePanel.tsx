import { useState } from "react";
import type { TimelapseBreakdown, TimelapseSegment } from "@bali-moto-track/shared-types";
import { perfStatusLabel } from "./helpers.js";

type Grain = "monthly" | "weekly";

// Panel del time-lapse real de la obra: selector de ángulo/cámara (si hay más de
// uno) + reproductor + desglose de rendimiento por mes o semana, con el estado de
// cada período (para contar el caso de la obra). Ver docs/buildtrack-prd.md §6.
export function TimelapsePanel({ timelapses }: { timelapses: TimelapseBreakdown[] }) {
  const [angleIdx, setAngleIdx] = useState(0);
  const [grain, setGrain] = useState<Grain>("monthly");

  const timelapse = timelapses[Math.min(angleIdx, timelapses.length - 1)];
  if (!timelapse) return null;

  const segments = grain === "monthly" ? timelapse.monthly : timelapse.weekly;
  const maxPct = Math.max(...segments.map((s) => s.progressPct), 1);
  const best = segments.reduce((a, b) => (b.progressPct > a.progressPct ? b : a), segments[0]);

  return (
    <section className="bt-tl">
      <div className="bt-tl__head">
        <div>
          <h2 className="bt-tl__title">Time-lapse de obra</h2>
          <p className="bt-tl__span">
            {timelapse.label} · {timelapse.span}
          </p>
        </div>
        <div className="bt-tl__total">
          <span className="bt-tl__total-value">{timelapse.totalProgressPct}%</span>
          <span className="bt-tl__total-label">avance total</span>
        </div>
      </div>

      {timelapses.length > 1 && (
        <div className="bt-tl__angles">
          {timelapses.map((t, i) => (
            <button
              key={t.videoUrl}
              className={`bt-tl__angle ${i === angleIdx ? "bt-tl__angle--active" : ""}`}
              onClick={() => setAngleIdx(i)}
            >
              🎥 {t.label}
            </button>
          ))}
        </div>
      )}

      <video
        key={timelapse.videoUrl}
        className="bt-tl__video"
        src={timelapse.videoUrl}
        controls
        preload="metadata"
        playsInline
      />

      <div className="bt-tl__breakdown">
        <div className="bt-tl__toggle">
          <button
            className={`bt-tl__toggle-btn ${grain === "monthly" ? "bt-tl__toggle-btn--active" : ""}`}
            onClick={() => setGrain("monthly")}
          >
            Por mes
          </button>
          <button
            className={`bt-tl__toggle-btn ${grain === "weekly" ? "bt-tl__toggle-btn--active" : ""}`}
            onClick={() => setGrain("weekly")}
          >
            Por semana
          </button>
        </div>

        <ul className="bt-tl__list">
          {segments.map((seg) => (
            <SegmentRow key={seg.id} segment={seg} widthPct={(seg.progressPct / maxPct) * 100} isBest={seg.id === best?.id} />
          ))}
        </ul>

        <p className="bt-tl__hint">
          Mejor {grain === "monthly" ? "mes" : "semana"}: <strong>{best?.label}</strong> (+{best?.progressPct}%)
          {best?.note ? ` — ${best.note}.` : "."}
        </p>
      </div>
    </section>
  );
}

function SegmentRow({ segment, widthPct, isBest }: { segment: TimelapseSegment; widthPct: number; isBest: boolean }) {
  return (
    <li className={`bt-seg bt-seg--${segment.status} ${isBest ? "bt-seg--best" : ""}`}>
      <div className="bt-seg__head">
        <span className="bt-seg__label">{segment.label}</span>
        <span className="bt-seg__period">{segment.period}</span>
        <span className={`bt-pill bt-pill--perf-${segment.status}`}>{perfStatusLabel(segment.status)}</span>
        <span className="bt-seg__pct">+{segment.progressPct}%</span>
      </div>
      <div className="bt-seg__track">
        <div className="bt-seg__bar" style={{ width: `${widthPct}%` }} />
      </div>
      {segment.note && <p className="bt-seg__note">{segment.note}</p>}
    </li>
  );
}
