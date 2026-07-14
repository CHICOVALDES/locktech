import { useState } from "react";
import type { ElectricalComponent } from "@bali-moto-track/shared-types";
import { componentCategoryMeta, KNOWN_CATEGORIES } from "./helpers.js";
import { fileToScaledDataUrl } from "./useElectricalEdits.js";

// Modal para editar un componente existente o crear uno nuevo. Permite cargar foto
// (se reduce y guarda en el navegador) y todos los datos técnicos + la empresa.
export function ComponentEditor({
  initial,
  isNew,
  onSave,
  onClose,
}: {
  initial: ElectricalComponent;
  isNew: boolean;
  onSave: (c: ElectricalComponent) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ElectricalComponent>(initial);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof ElectricalComponent>(key: K, value: ElectricalComponent[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const dataUrl = await fileToScaledDataUrl(file);
    setUploading(false);
    if (dataUrl) set("photo", dataUrl);
  }

  function submit() {
    const id = form.id.trim();
    if (!id || !form.name.trim()) return; // id y nombre son obligatorios
    onSave({ ...form, id });
  }

  return (
    <div className="bt-modal" onClick={onClose}>
      <div className="bt-modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="bt-modal__head">
          <h3 className="bt-modal__title">{isNew ? "Agregar componente" : `Editar ${initial.id}`}</h3>
          <button className="bt-modal__x" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Foto */}
        <div className="bt-editor__photo">
          {form.photo ? (
            <img src={form.photo} alt={form.name} />
          ) : (
            <div className="bt-editor__photo-empty">{componentCategoryMeta(form.category).icon}</div>
          )}
          <label className="bt-editor__upload">
            {uploading ? "Procesando…" : form.photo ? "Cambiar foto" : "Subir foto"}
            <input type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
        </div>

        <div className="bt-editor__grid">
          <Field label="ID / código">
            <input value={form.id} disabled={!isNew} onChange={(e) => set("id", e.target.value)} placeholder="DB-01" />
          </Field>
          <Field label="Categoría (elegí o escribí una)">
            <input
              list="bt-cat-options"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Ej: Bombeo, Iluminación…"
            />
            <datalist id="bt-cat-options">
              {KNOWN_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {componentCategoryMeta(c).label}
                </option>
              ))}
            </datalist>
          </Field>
          <Field label="Nombre" wide>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Tablero general" />
          </Field>
          <Field label="Ambiente / ubicación">
            <input value={form.room} onChange={(e) => set("room", e.target.value)} placeholder="Sala eléctrica" />
          </Field>
          <Field label="Empresa / instalador">
            <input value={form.installer ?? ""} onChange={(e) => set("installer", e.target.value)} placeholder="CV Arus Bali" />
          </Field>
          <Field label="Fecha de instalación">
            <input type="date" value={form.installedAt ?? ""} onChange={(e) => set("installedAt", e.target.value)} />
          </Field>
          <Field label="Circuito">
            <input value={form.circuit ?? ""} onChange={(e) => set("circuit", e.target.value)} placeholder="C-03" />
          </Field>
          <Field label="Tablero">
            <input value={form.panel ?? ""} onChange={(e) => set("panel", e.target.value)} placeholder="DB-01" />
          </Field>
          <Field label="Térmica">
            <input value={form.breaker ?? ""} onChange={(e) => set("breaker", e.target.value)} placeholder="16A" />
          </Field>
          <Field label="Carga">
            <input value={form.load ?? ""} onChange={(e) => set("load", e.target.value)} placeholder="2.2 kW" />
          </Field>
          <Field label="Controla / alimenta" wide>
            <input value={form.controls ?? ""} onChange={(e) => set("controls", e.target.value)} placeholder="Luces del living" />
          </Field>
          <Field label="Especificaciones técnicas" wide>
            <textarea value={form.specs ?? ""} onChange={(e) => set("specs", e.target.value)} rows={2} placeholder="18 circuitos · 63A · IP54" />
          </Field>
        </div>

        <div className="bt-editor__actions">
          <button className="bt-editor__cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="bt-editor__save" onClick={submit}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`bt-field ${wide ? "bt-field--wide" : ""}`}>
      <span className="bt-field__label">{label}</span>
      {children}
    </label>
  );
}
