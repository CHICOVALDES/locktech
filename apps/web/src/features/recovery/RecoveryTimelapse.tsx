import { useEffect, useRef, useState } from "react";

// Sección "Recovery": time-lapse por día. Muestra las 4 fotos diarias que el API
// captura del stream online a horarios fijos, y las reproduce en secuencia.
// Lee /timelapse/manifest.json (lo genera el API en apps/web/public/timelapse).

interface Shot {
  time: string;
  url: string;
}
interface Day {
  date: string;
  shots: Shot[];
}
interface Manifest {
  days: Day[];
  times: string[];
}

const FRAME_MS = 1100;

export function RecoveryTimelapse() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  async function loadManifest() {
    try {
      // cache-buster para ver capturas nuevas sin recargar la página
      const res = await fetch(`/timelapse/manifest.json?t=${Date.now()}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Manifest;
      setManifest(data);
      setSelectedDate((prev) => prev ?? data.days[0]?.date ?? null);
    } catch {
      setManifest({ days: [], times: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadManifest();
    const poll = window.setInterval(() => void loadManifest(), 30_000);
    return () => window.clearInterval(poll);
  }, []);

  const day = manifest?.days.find((d) => d.date === selectedDate) ?? null;
  const shots = day?.shots ?? [];

  // Reproducción del time-lapse.
  useEffect(() => {
    if (!playing || shots.length < 2) return;
    timerRef.current = window.setInterval(() => {
      setFrame((f) => (f + 1) % shots.length);
    }, FRAME_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [playing, shots.length]);

  // Al cambiar de día, reset del cursor.
  useEffect(() => {
    setFrame(0);
    setPlaying(false);
  }, [selectedDate]);

  const current = shots[Math.min(frame, Math.max(0, shots.length - 1))];
  const expectedTimes = manifest?.times ?? [];

  return (
    <div className="recovery">
      <div className="recovery__head">
        <h1 className="registros__title">Recovery · Time-lapse</h1>
        <span className="recovery__hint">
          {expectedTimes.length > 0 && `4 tomas/día · ${expectedTimes.join(" · ")}`}
        </span>
      </div>

      {loading ? (
        <p className="recovery__empty">Cargando…</p>
      ) : shots.length === 0 ? (
        <p className="recovery__empty">
          Todavía no hay capturas. Las fotos se toman automáticamente del stream online a los horarios
          {expectedTimes.length ? ` (${expectedTimes.join(", ")})` : ""}. Aparecerán acá a medida que se capturen.
        </p>
      ) : (
        <div className="recovery__body">
          <div className="recovery__stage">
            <div className="recovery__viewer">
              {current && <img className="recovery__frame" src={current.url} alt={`${selectedDate} ${current.time}`} />}
              <div className="recovery__viewer-top">
                <span className="recovery__date">{selectedDate}</span>
                <span className="recovery__timestamp">{current?.time}</span>
              </div>
            </div>

            <div className="recovery__controls">
              <button className="app__nav-btn" onClick={() => setPlaying((p) => !p)} disabled={shots.length < 2}>
                {playing ? "⏸ Pausar" : "▶ Reproducir"}
              </button>
              <div className="recovery__thumbs">
                {shots.map((s, i) => (
                  <button
                    key={s.url}
                    className={`recovery__thumb ${i === frame ? "recovery__thumb--active" : ""}`}
                    onClick={() => {
                      setPlaying(false);
                      setFrame(i);
                    }}
                    title={s.time}
                  >
                    <img src={s.url} alt={s.time} />
                    <span>{s.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="recovery__days">
            <h2 className="recovery__days-title">Días</h2>
            {manifest?.days.map((d) => (
              <button
                key={d.date}
                className={`recovery__day ${d.date === selectedDate ? "recovery__day--active" : ""}`}
                onClick={() => setSelectedDate(d.date)}
              >
                <span className="recovery__day-date">{d.date}</span>
                <span className="recovery__day-count">{d.shots.length}/4</span>
              </button>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
