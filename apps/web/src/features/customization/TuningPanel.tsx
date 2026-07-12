import { vehicleIconSvg } from "../../components/vehicleIconSvg.js";
import { ICON_STYLES, KIT_STYLES, LIVERY_PRESETS, type VehicleCustomization } from "./presets.js";

interface TuningPanelProps {
  vehicleId: string | null;
  customization: VehicleCustomization;
  onChange: (next: VehicleCustomization) => void;
}

export function TuningPanel({ vehicleId, customization, onChange }: TuningPanelProps) {
  const preset = LIVERY_PRESETS.find((p) => p.id === customization.liveryId) ?? LIVERY_PRESETS[0];

  if (!vehicleId) return null;

  return (
    <section className="tuning-panel">
      <h2 className="gauge-cluster__title">Tuning — {vehicleId}</h2>

      <div
        className="tuning-panel__preview"
        dangerouslySetInnerHTML={{
          __html: vehicleIconSvg(customization.iconId, preset.primary, preset.secondary, customization.kit, false).replace(
            'width="30" height="30"',
            'width="96" height="96"',
          ),
        }}
      />

      <div className="tuning-panel__group">
        <span className="tuning-panel__group-label">Ícono</span>
        <div className="tuning-panel__kits">
          {ICON_STYLES.map((i) => (
            <button
              key={i.id}
              className={`tuning-panel__kit-btn ${i.id === customization.iconId ? "tuning-panel__kit-btn--active" : ""}`}
              onClick={() => onChange({ ...customization, iconId: i.id })}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tuning-panel__group">
        <span className="tuning-panel__group-label">Pintura</span>
        <div className="tuning-panel__swatches">
          {LIVERY_PRESETS.map((p) => (
            <button
              key={p.id}
              title={p.label}
              className={`tuning-panel__swatch ${p.id === customization.liveryId ? "tuning-panel__swatch--active" : ""}`}
              style={{ background: `linear-gradient(135deg, ${p.primary} 60%, ${p.secondary} 60%)` }}
              onClick={() => onChange({ ...customization, liveryId: p.id })}
            />
          ))}
        </div>
      </div>

      <div className="tuning-panel__group">
        <span className="tuning-panel__group-label">Kit</span>
        <div className="tuning-panel__kits">
          {KIT_STYLES.map((k) => (
            <button
              key={k.id}
              className={`tuning-panel__kit-btn ${k.id === customization.kit ? "tuning-panel__kit-btn--active" : ""}`}
              onClick={() => onChange({ ...customization, kit: k.id })}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
