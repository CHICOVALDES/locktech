import { useState } from "react";
import type { Project } from "@bali-moto-track/shared-types";
import { daysElapsed, daysRemaining, milestoneStatusLabel, projectProgress, projectStatusLabel } from "./helpers.js";
import { TimelapsePanel } from "./TimelapsePanel.js";
import { WorkforcePanel } from "./WorkforcePanel.js";
import { ReportsPanel } from "./ReportsPanel.js";
import { SystemsSection } from "./SystemsSection.js";
import { ImageAnalysisPanel } from "./ImageAnalysisPanel.js";

const DATE_FMT: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

// Detalle de una obra (PRD §5 Live dashboard): imagen actual + galería, estado,
// % de avance, días, timeline de hitos, time-lapse y reportes.
export function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const progress = projectProgress(project);
  const elapsed = daysElapsed(project);
  const remaining = daysRemaining(project);

  const gallery = project.gallery ?? [];
  const [shownImage, setShownImage] = useState<string | null>(project.currentImageUrl);

  return (
    <div className="bt-detail">
      <button className="bt-back" onClick={onBack}>
        ← Todas las obras
      </button>

      <div className="bt-detail__grid">
        <div className="bt-detail__main">
          <div className={`bt-photo bt-photo--${project.status}`}>
            {shownImage ? (
              <img className="bt-photo__img" src={shownImage} alt={project.name} />
            ) : (
              <span className="bt-photo__placeholder">Sin captura reciente</span>
            )}
            <span className={`bt-pill bt-pill--${project.status} bt-photo__pill`}>
              {projectStatusLabel(project.status)}
            </span>
          </div>

          {gallery.length > 1 && (
            <div className="bt-gallery">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  className={`bt-gallery__thumb ${shownImage === src ? "bt-gallery__thumb--active" : ""}`}
                  onClick={() => setShownImage(src)}
                  title={`Foto ${i + 1}`}
                >
                  <img src={src} alt={`${project.name} foto ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          <h1 className="bt-detail__title">{project.name}</h1>
          <p className="bt-detail__address">{project.address}</p>
          <p className="bt-detail__desc">{project.description}</p>

          <div className="bt-stats">
            <Stat label="Avance" value={`${progress}%`} />
            <Stat label="Días transcurridos" value={String(elapsed)} />
            <Stat
              label="Días restantes"
              value={remaining >= 0 ? String(remaining) : `${Math.abs(remaining)} atrasada`}
              warn={remaining < 0}
            />
            <Stat label="Cliente" value={project.clientName} />
          </div>

          <div className="bt-progress">
            <div className="bt-progress__bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="bt-meta">
            <span>Inicio: {new Date(project.startDate).toLocaleDateString("es", DATE_FMT)}</span>
            <span>Fin estimado: {new Date(project.estimatedCompletion).toLocaleDateString("es", DATE_FMT)}</span>
          </div>
        </div>

        <aside className="bt-timeline">
          <h2 className="bt-timeline__title">Timeline de obra</h2>
          <ol className="bt-timeline__list">
            {project.milestones.map((m) => (
              <li key={m.id} className={`bt-milestone bt-milestone--${m.status}`}>
                <span className="bt-milestone__dot" />
                <span className="bt-milestone__name">{m.name}</span>
                <span className="bt-milestone__status">{milestoneStatusLabel(m.status)}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {/* Análisis de cámaras (visión) — la sección más importante, va primero. */}
      {project.analysis && <ImageAnalysisPanel analysis={project.analysis} />}

      {project.timelapses && project.timelapses.length > 0 && <TimelapsePanel timelapses={project.timelapses} />}

      {project.workforce && <WorkforcePanel workforce={project.workforce} contract={project.laborContract} />}

      {project.systems && project.systems.length > 0 && (
        <SystemsSection projectId={project.id} baseSystems={project.systems} />
      )}

      <ReportsPanel project={project} />
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="bt-stat">
      <span className="bt-stat__label">{label}</span>
      <span className={`bt-stat__value ${warn ? "bt-stat__value--warn" : ""}`}>{value}</span>
    </div>
  );
}
