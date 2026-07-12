import type { CheckinRecord } from "./useCheckinLog.js";

interface RegistrosLogProps {
  records: CheckinRecord[];
}

const ACTIVITY_LABEL: Record<string, string> = {
  motocross: "🏍️ Motocross",
  gokart: "🏎️ Go-Kart",
};

// Vista para el staff (adultos): lista simple de quién se registró, a qué
// actividad y cuándo. No necesita ser "kid-friendly" — la usan los instructores.
export function RegistrosLog({ records }: RegistrosLogProps) {
  return (
    <div className="registros">
      <h1 className="registros__title">Registros del día</h1>
      {records.length === 0 ? (
        <p className="registros__empty">Todavía no se registró nadie.</p>
      ) : (
        <table className="registros__table">
          <thead>
            <tr>
              <th>Chico</th>
              <th>Actividad</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.kidEmoji} {r.kidName}
                </td>
                <td>{ACTIVITY_LABEL[r.activity] ?? r.activity}</td>
                <td>{new Date(r.checkedInAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
