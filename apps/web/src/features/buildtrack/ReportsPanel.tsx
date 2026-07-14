import { useState } from "react";
import type { Project, ProjectReport } from "@bali-moto-track/shared-types";
import { formatIdr, perfStatusLabel, WAGE_IDR_PER_DAY } from "./helpers.js";

// Días laborables por tipo de reporte, para el costo de mano de obra del período.
const WORK_DAYS: Record<ProjectReport["type"], number> = { weekly: 6, monthly: 26 };

function laborCost(report: ProjectReport): number {
  return (report.workers ?? 0) * WAGE_IDR_PER_DAY * WORK_DAYS[report.type];
}

// Panel de reportes de avance (PRD §7): lista los reportes generados, permite
// abrir el detalle y descargar cada uno como HTML imprimible (Ctrl+P → PDF).
export function ReportsPanel({ project }: { project: Project }) {
  const reports = project.reports ?? [];
  const [openId, setOpenId] = useState<string | null>(reports[0]?.id ?? null);

  if (reports.length === 0) return null;

  return (
    <section className="bt-rep">
      <h2 className="bt-rep__title">Reportes de avance</h2>
      <ul className="bt-rep__list">
        {reports.map((report) => (
          <ReportRow
            key={report.id}
            report={report}
            open={openId === report.id}
            onToggle={() => setOpenId((cur) => (cur === report.id ? null : report.id))}
            onDownload={() => downloadReport(project, report)}
          />
        ))}
      </ul>
    </section>
  );
}

function ReportRow({
  report,
  open,
  onToggle,
  onDownload,
}: {
  report: ProjectReport;
  open: boolean;
  onToggle: () => void;
  onDownload: () => void;
}) {
  return (
    <li className={`bt-rep-item bt-rep-item--${report.status}`}>
      <button className="bt-rep-item__head" onClick={onToggle}>
        <span className={`bt-rep-item__type bt-rep-item__type--${report.type}`}>
          {report.type === "monthly" ? "Mensual" : "Semanal"}
        </span>
        <span className="bt-rep-item__name">{report.title}</span>
        <span className="bt-rep-item__period">{report.period}</span>
        <span className={`bt-pill bt-pill--perf-${report.status}`}>{perfStatusLabel(report.status)}</span>
        <span className="bt-rep-item__pct">{report.progressPct}%</span>
        <span className="bt-rep-item__chevron">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="bt-rep-item__body">
          <p className="bt-rep-item__summary">{report.summary}</p>
          <ul className="bt-rep-item__highlights">
            {report.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
          {report.workers != null && (
            <div className="bt-rep-item__labor">
              <span>
                👷 <strong>{report.workers}</strong> trabajadores (prom.)
              </span>
              <span>
                💰 Mano de obra del período: <strong>{formatIdr(laborCost(report))}</strong>
              </span>
            </div>
          )}
          <div className="bt-rep-item__footer">
            <span className="bt-rep-item__gen">
              Generado el {new Date(report.generatedAt).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
            <button className="bt-rep-item__dl" onClick={onDownload}>
              ⬇ Descargar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// Genera el reporte como HTML autocontenido y lo descarga. El usuario lo abre y
// hace Ctrl+P → "Guardar como PDF". Sin dependencias, funciona offline.
function downloadReport(project: Project, report: ProjectReport) {
  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string);
  const milestones = project.milestones
    .map((m) => `<li><b>${esc(m.name)}</b> — ${m.status.replace("_", " ")}</li>`)
    .join("");
  const highlights = report.highlights.map((h) => `<li>${esc(h)}</li>`).join("");

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${esc(report.title)} — ${esc(project.name)}</title>
<style>
  body{font-family:system-ui,Segoe UI,sans-serif;max-width:800px;margin:2rem auto;padding:0 1.5rem;color:#111}
  h1{margin:0;font-size:1.5rem}.sub{color:#666;margin:.2rem 0 1.5rem}
  .badge{display:inline-block;padding:.2rem .6rem;border-radius:999px;background:#0f1b2d;color:#e0a938;font-size:.8rem;font-weight:700}
  .row{display:flex;gap:2rem;flex-wrap:wrap;margin:1rem 0;border-top:1px solid #eee;padding-top:1rem}
  .row div{flex:1;min-width:120px}.k{font-size:.72rem;text-transform:uppercase;color:#888}.v{font-size:1.1rem;font-weight:700}
  h2{font-size:1rem;margin:1.5rem 0 .5rem}ul{margin:.3rem 0;padding-left:1.2rem;line-height:1.6}
  .foot{margin-top:2rem;border-top:1px solid #eee;padding-top:1rem;color:#888;font-size:.8rem}
</style></head><body>
  <span class="badge">BuildTrack · ${report.type === "monthly" ? "Reporte mensual" : "Reporte semanal"}</span>
  <h1>${esc(project.name)}</h1>
  <p class="sub">${esc(project.address)} · Cliente: ${esc(project.clientName)}</p>
  <div class="row">
    <div><div class="k">Período</div><div class="v">${esc(report.period)}</div></div>
    <div><div class="k">Avance</div><div class="v">${report.progressPct}%</div></div>
    <div><div class="k">Estado</div><div class="v">${perfStatusLabel(report.status)}</div></div>
    ${
      report.workers != null
        ? `<div><div class="k">Trabajadores (prom.)</div><div class="v">${report.workers}</div></div>
    <div><div class="k">Mano de obra</div><div class="v">${formatIdr(laborCost(report))}</div></div>`
        : ""
    }
  </div>
  <h2>Resumen</h2><p>${esc(report.summary)}</p>
  <h2>Puntos destacados</h2><ul>${highlights}</ul>
  <h2>Hitos de obra</h2><ul>${milestones}</ul>
  <div class="foot">Generado por BuildTrack el ${new Date(report.generatedAt).toLocaleDateString("es")} · Documento de demostración</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.id}-${report.id}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
