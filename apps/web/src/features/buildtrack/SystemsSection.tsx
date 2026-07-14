import { useState } from "react";
import type { SiteSystem } from "@bali-moto-track/shared-types";
import { ElectricalPanel } from "./ElectricalPanel.js";
import { useSiteSystems } from "./useSiteSystems.js";
import { ConsumptionSummary } from "./ConsumptionSummary.js";

// Emojis sugeridos para un área/segmento nuevo.
const AREA_ICONS = ["⚡", "🚰", "💡", "❄️", "🔥", "🎥", "🪵", "🧱", "🌿", "🛗", "🔒", "🌊"];

// Sección de segmentos/áreas de la obra: pestañas (Eléctrico, Agua, Luces, …) con el
// panel de cada área, y opción de agregar áreas nuevas. Cada empresa arma sus áreas.
export function SystemsSection({ projectId, baseSystems }: { projectId: string; baseSystems: SiteSystem[] }) {
  const { systems, addSystem, removeSystem, isAdded } = useSiteSystems(projectId, baseSystems);
  const [activeId, setActiveId] = useState(systems[0]?.id ?? "");
  const [adding, setAdding] = useState(false);

  const active = systems.find((s) => s.id === activeId) ?? systems[0];

  function handleAdd(name: string, icon: string) {
    const id = addSystem(name, icon);
    setActiveId(id);
    setAdding(false);
  }

  function handleRemove(s: SiteSystem) {
    if (!confirm(`¿Eliminar el área "${s.name}"?`)) return;
    removeSystem(s.id);
    if (activeId === s.id) setActiveId(systems.find((x) => x.id !== s.id)?.id ?? "");
  }

  return (
    <section className="bt-systems">
      <div className="bt-systems__bar">
        <h2 className="bt-systems__title">Áreas de la obra</h2>
        <div className="bt-systems__tabs">
          {systems.map((s) => (
            <div key={s.id} className={`bt-systab ${s.id === activeId ? "bt-systab--active" : ""}`}>
              <button className="bt-systab__btn" onClick={() => setActiveId(s.id)}>
                <span className="bt-systab__icon">{s.icon}</span>
                <span className="bt-systab__name">{s.name}</span>
                <span className="bt-systab__pct">{s.overallPct}%</span>
              </button>
              {isAdded(s.id) && (
                <button className="bt-systab__x" title="Eliminar área" onClick={() => handleRemove(s)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button className="bt-systems__add" onClick={() => setAdding(true)}>
            + Área
          </button>
        </div>
      </div>

      {active ? (
        <ElectricalPanel key={active.id} system={active} storageKey={`${projectId}.${active.id}`} />
      ) : (
        <p className="bt-elec__empty">No hay áreas cargadas. Agregá una con “+ Área”.</p>
      )}

      {systems.length > 0 && <ConsumptionSummary systems={systems} />}

      {adding && <SegmentAdder onAdd={handleAdd} onClose={() => setAdding(false)} />}
    </section>
  );
}

function SegmentAdder({ onAdd, onClose }: { onAdd: (name: string, icon: string) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(AREA_ICONS[0]);

  return (
    <div className="bt-modal" onClick={onClose}>
      <div className="bt-modal__box bt-modal__box--sm" onClick={(e) => e.stopPropagation()}>
        <div className="bt-modal__head">
          <h3 className="bt-modal__title">Nueva área de obra</h3>
          <button className="bt-modal__x" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="bt-field">
          <span className="bt-field__label">Nombre del área</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Cañerías y agua, Climatización, Seguridad…" autoFocus />
        </label>

        <div className="bt-field" style={{ marginTop: "0.9rem" }}>
          <span className="bt-field__label">Ícono</span>
          <div className="bt-iconpick">
            {AREA_ICONS.map((ic) => (
              <button
                key={ic}
                className={`bt-iconpick__btn ${ic === icon ? "bt-iconpick__btn--active" : ""}`}
                onClick={() => setIcon(ic)}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="bt-editor__actions">
          <button className="bt-editor__cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="bt-editor__save" onClick={() => name.trim() && onAdd(name, icon)}>
            Crear área
          </button>
        </div>
      </div>
    </div>
  );
}
