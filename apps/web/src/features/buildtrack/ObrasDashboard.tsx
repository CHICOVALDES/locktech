import { useState } from "react";
import type { Project } from "@bali-moto-track/shared-types";
import { useProjects } from "./useProjects.js";
import { daysRemaining, projectProgress, projectStatusLabel } from "./helpers.js";
import { ProjectDetail } from "./ProjectDetail.js";
import { BuildTrackLogo } from "./BuildTrackLogo.js";
import { ObrasMap } from "./ObrasMap.js";

// Sección BuildTrack: dashboard multi-proyecto de obras (villas) + detalle.
// Primer slice del PRD (docs/buildtrack-prd.md): listado con estado/avance/días
// restantes y, al abrir una obra, su timeline de hitos.
export function ObrasDashboard() {
  const { projects, status } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = projects.find((p) => p.id === selectedId) ?? null;
  if (selected) {
    return <ProjectDetail project={selected} onBack={() => setSelectedId(null)} />;
  }

  const active = projects.filter((p) => p.status === "active").length;
  const delayed = projects.filter((p) => p.status === "delayed").length;

  return (
    <div className="bt">
      <header className="bt__header">
        <div className="bt__brand">
          <BuildTrackLogo />
          <div>
            <h1 className="bt__title">BuildTrack</h1>
            <p className="bt__subtitle">Construction Intelligence · Monitoreo remoto de obras</p>
          </div>
        </div>
        <div className="bt__kpis">
          <Kpi label="Obras" value={projects.length} />
          <Kpi label="En obra" value={active} tone="good" />
          <Kpi label="Demoradas" value={delayed} tone="warn" />
        </div>
      </header>

      {status === "loading" && <p className="bt__msg">Cargando obras…</p>}
      {status === "error" && <p className="bt__msg bt__msg--error">No se pudieron cargar las obras.</p>}
      {status === "ready" && projects.length === 0 && <p className="bt__msg">Todavía no hay obras cargadas.</p>}

      {projects.length > 0 && <ObrasMap projects={projects} onOpen={(id) => setSelectedId(id)} />}

      <div className="bt__grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={() => setSelectedId(project.id)} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const progress = projectProgress(project);
  const remaining = daysRemaining(project);

  return (
    <button className="bt-card" onClick={onOpen}>
      <div className={`bt-card__photo bt-photo--${project.status}`}>
        {project.currentImageUrl ? (
          <img className="bt-photo__img" src={project.currentImageUrl} alt={project.name} />
        ) : (
          <span className="bt-photo__placeholder">Sin captura</span>
        )}
        <span className={`bt-pill bt-pill--${project.status}`}>{projectStatusLabel(project.status)}</span>
      </div>
      <div className="bt-card__body">
        <h3 className="bt-card__name">{project.name}</h3>
        <p className="bt-card__address">{project.address}</p>

        <div className="bt-progress">
          <div className="bt-progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="bt-card__footer">
          <span>{progress}% avance</span>
          <span className={remaining < 0 ? "bt-card__late" : ""}>
            {remaining >= 0 ? `${remaining} días rest.` : `${Math.abs(remaining)} días atraso`}
          </span>
        </div>
      </div>
    </button>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "good" | "warn" }) {
  return (
    <div className="bt-kpi">
      <span className={`bt-kpi__value ${tone ? `bt-kpi__value--${tone}` : ""}`}>{value}</span>
      <span className="bt-kpi__label">{label}</span>
    </div>
  );
}
