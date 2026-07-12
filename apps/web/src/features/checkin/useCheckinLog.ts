import { useState } from "react";

export type CampActivity = "motocross" | "gokart";

export interface CheckinRecord {
  id: string;
  kidName: string;
  kidEmoji: string;
  activity: CampActivity;
  checkedInAt: string;
}

// En memoria para la demo — Fase 1 esto se persiste en el backend (tabla de
// asistencia al campamento), pero la interacción del chico es la misma.
export function useCheckinLog() {
  const [records, setRecords] = useState<CheckinRecord[]>([]);

  function addCheckin(kidName: string, kidEmoji: string, activity: CampActivity) {
    setRecords((prev) => [
      { id: `${kidName}-${Date.now()}`, kidName, kidEmoji, activity, checkedInAt: new Date().toISOString() },
      ...prev,
    ]);
  }

  return { records, addCheckin };
}
