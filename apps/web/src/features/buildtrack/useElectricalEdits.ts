import { useCallback, useEffect, useState } from "react";
import type { ElectricalComponent } from "@bali-moto-track/shared-types";

// Edición local de la instalación eléctrica de una obra. Como el demo no tiene
// backend con persistencia, cada empresa carga/edita sus datos y fotos y quedan
// guardados en SU navegador (localStorage). Se aplica como capa sobre los datos
// base que llegan de la API. Cuando haya backend real, esto se reemplaza por PATCH.

interface Edits {
  overrides: Record<string, Partial<ElectricalComponent>>; // ediciones sobre componentes base
  added: ElectricalComponent[]; // componentes nuevos cargados por el usuario
  removed: string[]; // ids ocultados
}

const EMPTY: Edits = { overrides: {}, added: [], removed: [] };

// storageKey identifica el segmento: `${projectId}.${systemId}` (ej. "villa-ubud.agua").
function keyFor(storageKey: string) {
  return `bmt.sys.${storageKey}`;
}

function load(storageKey: string): Edits {
  try {
    const raw = localStorage.getItem(keyFor(storageKey));
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Edits) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useElectricalEdits(storageKey: string) {
  const [edits, setEdits] = useState<Edits>(() => load(storageKey));

  useEffect(() => {
    setEdits(load(storageKey));
  }, [storageKey]);

  const persist = useCallback(
    (next: Edits) => {
      setEdits(next);
      try {
        localStorage.setItem(keyFor(storageKey), JSON.stringify(next));
      } catch {
        // quota llena (fotos grandes): la edición sigue en memoria esta sesión.
      }
    },
    [storageKey],
  );

  // Aplica overrides + agregados - eliminados sobre la lista base de la API.
  const applyTo = useCallback(
    (base: ElectricalComponent[]): ElectricalComponent[] => {
      const merged = base
        .filter((c) => !edits.removed.includes(c.id))
        .map((c) => ({ ...c, ...edits.overrides[c.id] }));
      const extra = edits.added.filter((c) => !edits.removed.includes(c.id));
      return [...merged, ...extra];
    },
    [edits],
  );

  // Guarda un componente: si su id ya existe en base lo hace override; si es nuevo
  // lo agrega. `isBase` indica si el componente venía de la API.
  const saveComponent = useCallback(
    (component: ElectricalComponent, isBase: boolean) => {
      if (isBase) {
        persist({ ...edits, overrides: { ...edits.overrides, [component.id]: component } });
      } else {
        const exists = edits.added.some((c) => c.id === component.id);
        const added = exists
          ? edits.added.map((c) => (c.id === component.id ? component : c))
          : [...edits.added, component];
        persist({ ...edits, added });
      }
    },
    [edits, persist],
  );

  const removeComponent = useCallback(
    (id: string, isBase: boolean) => {
      if (isBase) {
        persist({ ...edits, removed: [...edits.removed, id] });
      } else {
        persist({ ...edits, added: edits.added.filter((c) => c.id !== id) });
      }
    },
    [edits, persist],
  );

  const resetAll = useCallback(() => persist(EMPTY), [persist]);

  const hasEdits = edits.added.length > 0 || edits.removed.length > 0 || Object.keys(edits.overrides).length > 0;

  return { applyTo, saveComponent, removeComponent, resetAll, hasEdits, addedIds: edits.added.map((c) => c.id) };
}

// Convierte un archivo de imagen a dataURL reducido (máx `maxSize` px, JPEG) para
// que entre cómodo en localStorage. Devuelve null si no es imagen válida.
export function fileToScaledDataUrl(file: File, maxSize = 1000, quality = 0.82): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(null);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
