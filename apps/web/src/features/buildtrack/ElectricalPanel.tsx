import { useMemo, useState } from "react";
import type {
  ComponentCategory,
  ElectricalComponent,
  ElectricalPhase,
  ElectricalTest,
  SiteSystem,
} from "@bali-moto-track/shared-types";
import { componentCategoryMeta, electricalPhaseLabel } from "./helpers.js";
import { useElectricalEdits } from "./useElectricalEdits.js";
import { ComponentEditor } from "./ComponentEditor.js";
import { DetectionLightbox } from "./DetectionLightbox.js";

// estado del editor: cerrado, editando uno existente, o creando uno nuevo.
type EditorState = { component: ElectricalComponent; isNew: boolean } | null;

function blankComponent(): ElectricalComponent {
  return { id: "", category: "equipment", name: "", room: "" };
}

// Panel de un segmento/área de obra (eléctrico, agua, luces, …): avance por fases +
// buscador/filtro de componentes con su relación circuito→tablero + ensayos. Cada
// componente es editable (foto + datos + empresa) y se pueden agregar nuevos; las
// ediciones quedan en el navegador de cada empresa. `storageKey` = projectId.systemId.
export function ElectricalPanel({ system, storageKey }: { system: SiteSystem; storageKey: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ComponentCategory | "all">("all");
  const [editor, setEditor] = useState<EditorState>(null);

  const { applyTo, saveComponent, removeComponent, resetAll, hasEdits, addedIds } = useElectricalEdits(storageKey);

  // Componentes efectivos = base de la API + ediciones locales de esta empresa.
  const components = useMemo(() => applyTo(system.components), [applyTo, system.components]);
  const baseIds = useMemo(() => new Set(system.components.map((c) => c.id)), [system.components]);
  const isBase = (id: string) => baseIds.has(id) && !addedIds.includes(id);

  const categories = useMemo(() => Array.from(new Set(components.map((c) => c.category))), [components]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return components.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (!q) return true;
      // Buscar por habitación, circuito, tablero, id o nombre (PRD: search by room/circuit/equipment).
      return [c.name, c.room, c.id, c.circuit, c.panel, c.controls, c.specs]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q));
    });
  }, [components, query, category]);

  function handleDelete(c: ElectricalComponent) {
    if (confirm(`¿Eliminar ${c.id} — ${c.name}?`)) removeComponent(c.id, isBase(c.id));
  }

  return (
    <section className="bt-elec">
      <div className="bt-elec__head">
        <div>
          <h2 className="bt-elec__title">
            {system.icon} {system.name}
          </h2>
          <p className="bt-elec__sub">{components.length} componentes registrados</p>
        </div>
        <div className="bt-elec__total">
          <span className="bt-elec__total-value">{system.overallPct}%</span>
          <span className="bt-elec__total-label">avance</span>
        </div>
      </div>

      {/* Fases */}
      <div className="bt-elec__phases">
        {system.phases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </div>

      {/* Buscador + filtro por categoría */}
      <div className="bt-elec__toolbar">
        <input
          className="bt-elec__search"
          placeholder="Buscar por ambiente, circuito, tablero o equipo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="bt-elec__toolbar-row">
          <div className="bt-elec__filters">
            <button
              className={`bt-elec__chip ${category === "all" ? "bt-elec__chip--active" : ""}`}
              onClick={() => setCategory("all")}
            >
              Todos ({components.length})
            </button>
            {categories.map((cat) => {
              const meta = componentCategoryMeta(cat);
              const count = components.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  className={`bt-elec__chip ${category === cat ? "bt-elec__chip--active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {meta.icon} {meta.label} ({count})
                </button>
              );
            })}
          </div>
          <div className="bt-elec__actions-row">
            {hasEdits && (
              <button className="bt-elec__reset" onClick={() => confirm("¿Descartar todas tus ediciones locales?") && resetAll()}>
                ↺ Restaurar
              </button>
            )}
            <button className="bt-elec__add" onClick={() => setEditor({ component: blankComponent(), isNew: true })}>
              + Agregar componente
            </button>
          </div>
        </div>
      </div>

      {/* Componentes */}
      <div className="bt-elec__components">
        {filtered.map((c) => (
          <ComponentCard
            key={c.id}
            component={c}
            onEdit={() => setEditor({ component: c, isNew: false })}
            onDelete={() => handleDelete(c)}
          />
        ))}
        {filtered.length === 0 && <p className="bt-elec__empty">Sin componentes para esa búsqueda.</p>}
      </div>

      {/* Testing y comisionado */}
      <div className="bt-elec__tests">
        <h3 className="bt-elec__tests-title">Testing y comisionado</h3>
        <ul className="bt-elec__tests-list">
          {system.tests.map((t) => (
            <TestRow key={t.id} test={t} />
          ))}
          {system.tests.length === 0 && <li className="bt-elec__empty">Sin ensayos registrados todavía.</li>}
        </ul>
      </div>

      {editor && (
        <ComponentEditor
          initial={editor.component}
          isNew={editor.isNew}
          onSave={(c) => {
            saveComponent(c, editor.isNew ? false : isBase(c.id));
            setEditor(null);
          }}
          onClose={() => setEditor(null)}
        />
      )}
    </section>
  );
}

function PhaseCard({ phase }: { phase: ElectricalPhase }) {
  return (
    <div className={`bt-phase bt-phase--${phase.status}`}>
      <div className="bt-phase__top">
        <span className="bt-phase__num">Fase {phase.number}</span>
        <span className="bt-phase__pct">{phase.progressPct}%</span>
      </div>
      <div className="bt-phase__name">{phase.name}</div>
      <div className="bt-phase__track">
        <div className="bt-phase__bar" style={{ width: `${phase.progressPct}%` }} />
      </div>
      <div className="bt-phase__status">{electricalPhaseLabel(phase.status)}</div>
    </div>
  );
}

function ComponentCard({
  component: c,
  onEdit,
  onDelete,
}: {
  component: ElectricalComponent;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = componentCategoryMeta(c.category);
  const [zoom, setZoom] = useState(false);
  return (
    <div className="bt-comp">
      <div className="bt-comp__photo-wrap">
        {c.photo ? (
          <button className="bt-comp__photo bt-comp__photo--btn" onClick={() => setZoom(true)} title="Ampliar foto">
            <img src={c.photo} alt={c.name} />
            <span className="bt-comp__zoom">🔍</span>
          </button>
        ) : (
          <div className="bt-comp__photo bt-comp__photo--empty">{meta.icon}</div>
        )}
        <div className="bt-comp__tools">
          <button className="bt-comp__tool" title="Editar foto y datos" onClick={onEdit}>
            ✏️ Editar
          </button>
          <button className="bt-comp__tool bt-comp__tool--del" title="Eliminar" onClick={onDelete}>
            🗑
          </button>
        </div>
      </div>
      <div className="bt-comp__body">
        <div className="bt-comp__head">
          <span className="bt-comp__id">{c.id}</span>
          <span className="bt-comp__cat">{meta.icon} {meta.label}</span>
        </div>
        <div className="bt-comp__name">{c.name}</div>
        <div className="bt-comp__room">📍 {c.room}</div>

        {(c.circuit || c.panel || c.breaker) && (
          <div className="bt-comp__wiring">
            {c.circuit && <span className="bt-comp__tag">Circuito {c.circuit}</span>}
            {c.panel && <span className="bt-comp__tag">Tablero {c.panel}</span>}
            {c.breaker && <span className="bt-comp__tag">Térmica {c.breaker}</span>}
          </div>
        )}
        {c.controls && <div className="bt-comp__line">Controla: {c.controls}</div>}
        {c.load && <div className="bt-comp__line">Carga: {c.load}</div>}
        {c.specs && <div className="bt-comp__specs">{c.specs}</div>}
        <div className="bt-comp__meta">
          {c.installedAt && <span>🗓 {c.installedAt}</span>}
          {c.installer && <span>👷 {c.installer}</span>}
        </div>
      </div>

      {zoom && c.photo && (
        <DetectionLightbox
          imageUrl={c.photo}
          title={`${c.id} — ${c.name}`}
          subtitle={[c.room && `📍 ${c.room}`, c.specs].filter(Boolean).join(" · ")}
          badge={`${meta.icon} ${meta.label}`}
          onClose={() => setZoom(false)}
        />
      )}
    </div>
  );
}

function TestRow({ test }: { test: ElectricalTest }) {
  const icon = test.result === "pass" ? "✅" : test.result === "fail" ? "❌" : "⏳";
  return (
    <li className={`bt-test bt-test--${test.result}`}>
      <span className="bt-test__icon">{icon}</span>
      <span className="bt-test__name">{test.name}</span>
      {test.value && <span className="bt-test__value">{test.value}</span>}
      <span className="bt-test__date">{test.date}</span>
    </li>
  );
}
