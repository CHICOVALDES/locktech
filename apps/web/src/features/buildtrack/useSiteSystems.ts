import { useCallback, useEffect, useState } from "react";
import type { SiteSystem } from "@bali-moto-track/shared-types";

// Segmentos/áreas de una obra: los que vienen de la API (base) + los que la empresa
// agrega desde el navegador (localStorage). Así cada empresa suma las áreas que
// necesite (eléctrico, agua, luces, climatización…) sin backend. Cuando haya
// persistencia real, esto se reemplaza por POST /projects/:id/systems.

interface Stored {
  added: SiteSystem[];
  removed: string[]; // ids de segmentos base ocultados
}

const EMPTY: Stored = { added: [], removed: [] };

function keyFor(projectId: string) {
  return `bmt.segments.${projectId}`;
}

function load(projectId: string): Stored {
  try {
    const raw = localStorage.getItem(keyFor(projectId));
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Stored) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useSiteSystems(projectId: string, base: SiteSystem[]) {
  const [stored, setStored] = useState<Stored>(() => load(projectId));

  useEffect(() => {
    setStored(load(projectId));
  }, [projectId]);

  const persist = useCallback(
    (next: Stored) => {
      setStored(next);
      try {
        localStorage.setItem(keyFor(projectId), JSON.stringify(next));
      } catch {
        // quota llena: sigue en memoria esta sesión.
      }
    },
    [projectId],
  );

  const systems = [...base.filter((s) => !stored.removed.includes(s.id)), ...stored.added];

  const addSystem = useCallback(
    (name: string, icon: string) => {
      const id = `seg-${Date.now().toString(36)}`;
      const system: SiteSystem = { id, name: name.trim() || "Nueva área", icon: icon || "🧱", overallPct: 0, phases: [], components: [], tests: [] };
      persist({ ...stored, added: [...stored.added, system] });
      return id;
    },
    [stored, persist],
  );

  const removeSystem = useCallback(
    (id: string) => {
      const isBase = base.some((s) => s.id === id);
      if (isBase) persist({ ...stored, removed: [...stored.removed, id] });
      else persist({ ...stored, added: stored.added.filter((s) => s.id !== id) });
    },
    [stored, persist, base],
  );

  const isAdded = (id: string) => stored.added.some((s) => s.id === id);

  return { systems, addSystem, removeSystem, isAdded };
}
