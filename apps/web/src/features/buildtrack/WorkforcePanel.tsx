import { useEffect, useRef, useState } from "react";
import type {
  DayWorkers,
  LaborContract,
  LaborMilestone,
  PeopleCapture,
  WorkforceLog,
} from "@bali-moto-track/shared-types";
import { formatIdr, WAGE_IDR_PER_DAY } from "./helpers.js";
import { DetectionLightbox } from "./DetectionLightbox.js";

const DATE_FMT: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

// Días laborables asumidos para proyectar el costo de mano de obra.
const WORK_DAYS_WEEK = 6;
const WORK_DAYS_MONTH = 26;

// Panel de dotación de personal: log DIARIO scrollable (se scrollea hacia atrás para
// ver cuántos trabajadores hubo en días pasados) + capturas de cámara + estimativo de
// costo de mano de obra. El número es la cuadrilla estimada del día (no solo la gente
// visible en el frame aéreo). En producción lo afina un modelo de visión + parte diario.
export function WorkforcePanel({ workforce, contract }: { workforce: WorkforceLog; contract?: LaborContract }) {
  const daily = [...(workforce.daily ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const caps = [...workforce.captures].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // Métricas sobre el log diario (si no hay, cae a las capturas).
  const series = daily.length ? daily.map((d) => d.workers) : caps.map((c) => c.people);
  const active = series.filter((n) => n > 0);
  const avgActive = active.length ? active.reduce((a, b) => a + b, 0) / active.length : 0;
  const peak = series.length ? Math.max(...series) : 0;
  const peakDay = daily.find((d) => d.workers === peak);
  const people = Math.round(avgActive);
  const [openCap, setOpenCap] = useState<PeopleCapture | null>(null);

  return (
    <section className="bt-wf">
      <div className="bt-wf__head">
        <div>
          <h2 className="bt-wf__title">👷 Dotación de personal</h2>
          <p className="bt-wf__sub">Cuadrilla por día · scrolleá para ver días anteriores</p>
        </div>
        <div className="bt-wf__kpis">
          <Kpi value={String(people)} label="Prom. (días activos)" />
          <Kpi value={String(peak)} label="Pico" tone="gold" />
          <Kpi value={String(daily.length || caps.length)} label="Días" />
        </div>
      </div>

      {peakDay && (
        <p className="bt-wf__peak">
          Máxima dotación: <strong>{peak} personas</strong> el {new Date(peakDay.date).toLocaleDateString("es", DATE_FMT)}.
        </p>
      )}

      {daily.length > 0 && <DailyChart days={daily} peak={peak} />}

      <div className="bt-wf__caps-title">Capturas de cámara</div>
      <div className="bt-wf__grid">
        {caps.map((c) => (
          <CaptureCard key={c.imageUrl} capture={c} onOpen={() => setOpenCap(c)} />
        ))}
      </div>

      <LaborCost people={people} contract={contract} />

      <p className="bt-wf__note">
        ⚠ Dotación estimada de la cuadrilla (la foto aérea no muestra a todos: la mayoría trabaja bajo estructura o
        fuera de cuadro). Con parte diario + un modelo de visión sobre cada captura, el número se afina automáticamente.
      </p>

      {openCap && (
        <DetectionLightbox
          imageUrl={openCap.imageUrl}
          title={`Captura ${new Date(openCap.date).toLocaleDateString("es", DATE_FMT)} · ${openCap.time}`}
          subtitle={
            openCap.detections && openCap.detections.length > 0
              ? `${openCap.detections.length} persona(s) visibles en cuadro · dotación estimada del día: ${openCap.people}`
              : `Dotación estimada del día: ${openCap.people}`
          }
          detections={openCap.detections}
          badge={`👷 ${openCap.people}`}
          onClose={() => setOpenCap(null)}
        />
      )}
    </section>
  );
}

// Gráfico diario scrollable: una barra por día. Arranca scrolleado a la derecha (día
// más reciente); se scrollea a la izquierda para ver días pasados. Serie única en
// dorado sobre navy, consistente con la plataforma; tooltip nativo por barra.
function DailyChart({ days, peak }: { days: DayWorkers[]; peak: number }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const maxY = Math.max(peak, 1);

  // Al montar, posiciona el scroll en el día más reciente (extremo derecho).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [days.length]);

  return (
    <figure className="bt-wf-chart-fig">
      <figcaption className="bt-wf-chart-fig__cap">Trabajadores por día</figcaption>
      <div className="bt-wf-daily" ref={scrollRef}>
        {days.map((d) => {
          const dt = new Date(d.date);
          const h = maxY > 0 ? (d.workers / maxY) * 100 : 0;
          const weekend = dt.getUTCDay() === 0 || dt.getUTCDay() === 6;
          return (
            <div className="bt-wf-day" key={d.date} title={`${dt.toLocaleDateString("es", DATE_FMT)}: ${d.workers} trabajadores`}>
              <span className="bt-wf-day__val">{d.workers}</span>
              <div className="bt-wf-day__track">
                <div className={`bt-wf-day__bar ${d.workers === 0 ? "bt-wf-day__bar--zero" : ""}`} style={{ height: `${h}%` }} />
              </div>
              <span className={`bt-wf-day__date ${weekend ? "bt-wf-day__date--wknd" : ""}`}>
                {dt.toLocaleDateString("es", { day: "2-digit", month: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}

function CaptureCard({ capture: c, onOpen }: { capture: PeopleCapture; onOpen: () => void }) {
  return (
    <figure className="bt-wf-cap">
      <button className="bt-wf-cap__photo bt-wf-cap__photo--btn" onClick={onOpen} title="Ampliar y ver personas detectadas">
        <img src={c.imageUrl} alt={`Captura ${c.date} ${c.time}`} loading="lazy" />
        <span className="bt-wf-cap__stamp">
          {new Date(c.date).toLocaleDateString("es", { day: "2-digit", month: "short" })} · {c.time}
        </span>
        <span className={`bt-wf-cap__count ${c.people === 0 ? "bt-wf-cap__count--zero" : ""}`}>👷 {c.people}</span>
        <span className="bt-wf-cap__zoom">🔍</span>
      </button>
    </figure>
  );
}

type LaborMode = "day" | "contract";

// Estimativo de mano de obra con dos modalidades: por JORNAL (personas × 140.000
// IDR/día) o por CONTRATO (monto total con pagos atados a hitos del trabajo).
function LaborCost({ people, contract }: { people: number; contract?: LaborContract }) {
  const [mode, setMode] = useState<LaborMode>("day");
  const effectiveMode = mode === "contract" && !contract ? "day" : mode;

  return (
    <div className="bt-wf-labor">
      <div className="bt-wf-labor__head">
        <span className="bt-wf-labor__title">💰 Estimativo de mano de obra</span>
        <div className="bt-wf-labor__modes">
          <button
            className={`bt-wf-labor__mode ${effectiveMode === "day" ? "bt-wf-labor__mode--active" : ""}`}
            onClick={() => setMode("day")}
          >
            Por jornal
          </button>
          <button
            className={`bt-wf-labor__mode ${effectiveMode === "contract" ? "bt-wf-labor__mode--active" : ""}`}
            onClick={() => setMode("contract")}
            disabled={!contract}
            title={contract ? "" : "Esta obra no tiene contrato cargado"}
          >
            Por contrato
          </button>
        </div>
      </div>

      {effectiveMode === "day" ? <DayMode people={people} /> : <ContractMode contract={contract!} />}
    </div>
  );
}

// Modalidad por jornal: personas × jornal/día + proyección semanal/mensual.
function DayMode({ people }: { people: number }) {
  const perDay = people * WAGE_IDR_PER_DAY;
  return (
    <>
      <p className="bt-wf-labor__sub">Pago por día trabajado · {formatIdr(WAGE_IDR_PER_DAY)} por persona</p>
      <div className="bt-wf-labor__row">
        <LaborStat value={String(people)} label="Personas (prom.)" />
        <LaborStat value={formatIdr(perDay)} label="Costo por día" strong />
        <LaborStat value={formatIdr(perDay * WORK_DAYS_WEEK)} label={`Semana (${WORK_DAYS_WEEK} días)`} />
        <LaborStat value={formatIdr(perDay * WORK_DAYS_MONTH)} label={`Mes (${WORK_DAYS_MONTH} días)`} />
      </div>
    </>
  );
}

// Modalidad por contrato: total + pagos por hitos, con lo pagado y el saldo.
function ContractMode({ contract }: { contract: LaborContract }) {
  const paid = contract.milestones.filter((m) => m.status === "paid").reduce((a, m) => a + m.amount, 0);
  const saldo = contract.total - paid;
  const paidPct = contract.total > 0 ? Math.round((paid / contract.total) * 100) : 0;

  return (
    <>
      <p className="bt-wf-labor__sub">Pago por contrato · desembolsos atados a hitos del trabajo realizado</p>
      <div className="bt-wf-labor__row">
        <LaborStat value={formatIdr(contract.total)} label="Contrato total" strong />
        <LaborStat value={formatIdr(paid)} label={`Pagado (${paidPct}%)`} />
        <LaborStat value={formatIdr(saldo)} label="Saldo pendiente" />
      </div>

      <div className="bt-wf-labor__bar">
        <div className="bt-wf-labor__bar-fill" style={{ width: `${paidPct}%` }} />
      </div>

      <ul className="bt-wf-labor__milestones">
        {contract.milestones.map((m) => (
          <MilestoneRow key={m.name} milestone={m} />
        ))}
      </ul>
    </>
  );
}

function MilestoneRow({ milestone: m }: { milestone: LaborMilestone }) {
  const icon = m.status === "paid" ? "✅" : m.status === "in_progress" ? "🟡" : "⏳";
  const label = m.status === "paid" ? "Pagado" : m.status === "in_progress" ? "En curso" : "Pendiente";
  return (
    <li className={`bt-wf-hito bt-wf-hito--${m.status}`}>
      <span className="bt-wf-hito__icon">{icon}</span>
      <span className="bt-wf-hito__name">{m.name}</span>
      <span className="bt-wf-hito__pct">{m.pct}%</span>
      <span className="bt-wf-hito__amount">{formatIdr(m.amount)}</span>
      <span className="bt-wf-hito__status">{label}</span>
    </li>
  );
}

function LaborStat({ value, label, strong }: { value: string; label: string; strong?: boolean }) {
  return (
    <div className="bt-wf-labor__stat">
      <span className={`bt-wf-labor__value ${strong ? "bt-wf-labor__value--strong" : ""}`}>{value}</span>
      <span className="bt-wf-labor__label">{label}</span>
    </div>
  );
}

function Kpi({ value, label, tone }: { value: string; label: string; tone?: "gold" }) {
  return (
    <div className="bt-wf-kpi">
      <span className={`bt-wf-kpi__value ${tone === "gold" ? "bt-wf-kpi__value--gold" : ""}`}>{value}</span>
      <span className="bt-wf-kpi__label">{label}</span>
    </div>
  );
}
