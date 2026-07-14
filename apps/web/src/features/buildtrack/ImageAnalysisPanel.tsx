import { useState } from "react";
import type { AnalysisFrame, DetectedItem, ImageAnalysis } from "@bali-moto-track/shared-types";
import { DetectionLightbox } from "./DetectionLightbox.js";

const DATE_FMT: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

// Panel de análisis de imagen: por cada captura diaria muestra las máquinas y
// actividades detectadas (movimiento de tierra, hormigón, colocación de piedra, …),
// un resumen y el avance estimado. Arriba, un agregado de máquinas-día y frecuencia
// de actividades. En producción lo genera un modelo de visión sobre cada foto.
export function ImageAnalysisPanel({ analysis }: { analysis: ImageAnalysis }) {
  const frames = [...analysis.frames].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const [openFrame, setOpenFrame] = useState<AnalysisFrame | null>(null);
  if (frames.length === 0) return null;

  // Agregados
  const daysWithMachine = frames.filter((f) => f.machines.length > 0).length;
  const machineDays = frames.reduce((a, f) => a + f.machines.reduce((s, m) => s + (m.count ?? 1), 0), 0);
  const lastPct = frames[frames.length - 1].workDonePct;

  // Frecuencia de máquinas y actividades (para los chips agregados)
  const machineFreq = tally(frames.flatMap((f) => f.machines));
  const activityFreq = tally(frames.flatMap((f) => f.activities));

  return (
    <section className="bt-an">
      <div className="bt-an__head">
        <div>
          <h2 className="bt-an__title">🔍 Análisis de imagen</h2>
          <p className="bt-an__sub">Máquinas y actividades detectadas por día · estimativo de trabajos realizados</p>
        </div>
        <div className="bt-an__kpis">
          <Kpi value={String(frames.length)} label="Capturas" />
          <Kpi value={String(machineDays)} label="Máquinas·día" tone="gold" />
          <Kpi value={String(daysWithMachine)} label="Días con máquina" />
          <Kpi value={`${lastPct}%`} label="Avance detectado" tone="gold" />
        </div>
      </div>

      {/* Agregado: qué máquinas y actividades se vieron en el período */}
      <div className="bt-an__agg">
        <div className="bt-an__agg-col">
          <span className="bt-an__agg-title">Máquinas detectadas</span>
          <div className="bt-an__chips">
            {machineFreq.length ? (
              machineFreq.map((m) => (
                <span key={m.label} className="bt-an__chip bt-an__chip--machine">
                  {m.icon} {m.label} · {m.total}d
                </span>
              ))
            ) : (
              <span className="bt-an__none">Sin máquinas en el período</span>
            )}
          </div>
        </div>
        <div className="bt-an__agg-col">
          <span className="bt-an__agg-title">Actividades detectadas</span>
          <div className="bt-an__chips">
            {activityFreq.map((a) => (
              <span key={a.label} className="bt-an__chip">
                {a.icon} {a.label} · {a.total}d
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Detalle por captura */}
      <div className="bt-an__frames">
        {frames.map((f) => (
          <FrameCard key={f.imageUrl} frame={f} onOpen={() => setOpenFrame(f)} />
        ))}
      </div>

      <p className="bt-an__note">
        ⚠ Detección estimada por análisis de imagen (demo). Con la cámara conectada, un modelo de visión clasifica
        máquinas y actividades en cada captura diaria y arma el parte de trabajos realizados automáticamente.
      </p>

      {openFrame && (
        <DetectionLightbox
          imageUrl={openFrame.imageUrl}
          title={`Captura ${new Date(openFrame.date).toLocaleDateString("es", DATE_FMT)} · ${openFrame.time}`}
          subtitle={openFrame.summary}
          detections={openFrame.detections}
          badge={
            openFrame.machines.length > 0
              ? `🚜 ${openFrame.machines.reduce((s, m) => s + (m.count ?? 1), 0)} máquina(s)`
              : `${openFrame.workDonePct}% avance`
          }
          onClose={() => setOpenFrame(null)}
        />
      )}
    </section>
  );
}

function FrameCard({ frame: f, onOpen }: { frame: AnalysisFrame; onOpen: () => void }) {
  return (
    <article className="bt-an-card">
      <button className="bt-an-card__photo bt-an-card__photo--btn" onClick={onOpen} title="Ampliar y ver detección">
        <img src={f.imageUrl} alt={`Análisis ${f.date}`} loading="lazy" />
        <span className="bt-an-card__stamp">
          {new Date(f.date).toLocaleDateString("es", DATE_FMT)} · {f.time}
        </span>
        <span className="bt-an-card__pct">{f.workDonePct}%</span>
        {f.detections && f.detections.length > 0 && (
          <span className="bt-an-card__zoom">🔍 {f.detections.length} detección{f.detections.length > 1 ? "es" : ""}</span>
        )}
      </button>
      <div className="bt-an-card__body">
        {f.machines.length > 0 && (
          <div className="bt-an-card__group">
            <span className="bt-an-card__group-label">🚜 Máquinas</span>
            <div className="bt-an__chips">
              {f.machines.map((m) => (
                <span key={m.label} className="bt-an__chip bt-an__chip--machine">
                  {m.icon} {m.label}
                  {m.count && m.count > 1 ? ` ×${m.count}` : ""}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="bt-an-card__group">
          <span className="bt-an-card__group-label">🛠️ Actividades</span>
          <div className="bt-an__chips">
            {f.activities.map((a) => (
              <span key={a.label} className="bt-an__chip">
                {a.icon} {a.label}
              </span>
            ))}
          </div>
        </div>
        <p className="bt-an-card__summary">{f.summary}</p>
        <div className="bt-an-card__work">
          <span className="bt-an-card__work-label">Trabajo realizado (estimado)</span>
          <div className="bt-an-card__work-track">
            <div className="bt-an-card__work-bar" style={{ width: `${f.workDonePct}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Kpi({ value, label, tone }: { value: string; label: string; tone?: "gold" }) {
  return (
    <div className="bt-an-kpi">
      <span className={`bt-an-kpi__value ${tone === "gold" ? "bt-an-kpi__value--gold" : ""}`}>{value}</span>
      <span className="bt-an-kpi__label">{label}</span>
    </div>
  );
}

// Cuenta cuántos días apareció cada item (por label), conservando ícono.
function tally(items: DetectedItem[]): { label: string; icon: string; total: number }[] {
  const map = new Map<string, { label: string; icon: string; total: number }>();
  for (const it of items) {
    const cur = map.get(it.label);
    if (cur) cur.total += 1;
    else map.set(it.label, { label: it.label, icon: it.icon, total: 1 });
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}
