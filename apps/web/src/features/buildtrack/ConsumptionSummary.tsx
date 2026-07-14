import type { SiteSystem } from "@bali-moto-track/shared-types";
import { parseKw } from "./helpers.js";

// Supuestos de estimación de consumo mensual (demo). Horas/día de uso promedio de
// la potencia instalada y tarifa PLN aproximada (Rp/kWh). Editables acá.
const AVG_HOURS_PER_DAY = 5;
const DAYS = 30;
const RP_PER_KWH = 1700;

const rp = new Intl.NumberFormat("es", { maximumFractionDigits: 0 });

// Resumen de consumo por segmento/área con totales: potencia instalada (kW), su
// participación, y una estimación de consumo (kWh) y costo mensual. Se ubica abajo
// de las áreas. "consumo por segmentos con totales".
export function ConsumptionSummary({ systems }: { systems: SiteSystem[] }) {
  const rows = systems.map((s) => {
    const kw = s.components.reduce((acc, c) => acc + parseKw(c.load), 0);
    const kwh = kw * AVG_HOURS_PER_DAY * DAYS;
    return { id: s.id, name: s.name, icon: s.icon, components: s.components.length, kw, kwh, cost: kwh * RP_PER_KWH };
  });

  const totalKw = rows.reduce((a, r) => a + r.kw, 0);
  const totalKwh = rows.reduce((a, r) => a + r.kwh, 0);
  const totalCost = rows.reduce((a, r) => a + r.cost, 0);
  const totalComp = rows.reduce((a, r) => a + r.components, 0);

  return (
    <section className="bt-consum">
      <div className="bt-consum__head">
        <h2 className="bt-consum__title">📊 Consumo por segmento</h2>
        <span className="bt-consum__note">Estimado · {AVG_HOURS_PER_DAY}h/día · tarifa Rp {rp.format(RP_PER_KWH)}/kWh</span>
      </div>

      <div className="bt-consum__scroll">
        <table className="bt-consum__table">
          <thead>
            <tr>
              <th>Área</th>
              <th className="num">Componentes</th>
              <th className="num">Potencia</th>
              <th className="num">Participación</th>
              <th className="num">Consumo/mes</th>
              <th className="num">Costo/mes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const share = totalKw > 0 ? (r.kw / totalKw) * 100 : 0;
              return (
                <tr key={r.id}>
                  <td>
                    <span className="bt-consum__area">
                      {r.icon} {r.name}
                    </span>
                  </td>
                  <td className="num">{r.components}</td>
                  <td className="num strong">{r.kw.toFixed(2)} kW</td>
                  <td className="num">
                    <div className="bt-consum__bar-wrap">
                      <div className="bt-consum__bar" style={{ width: `${share}%` }} />
                      <span>{share.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="num">{rp.format(Math.round(r.kwh))} kWh</td>
                  <td className="num">Rp {rp.format(Math.round(r.cost))}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>TOTAL</td>
              <td className="num">{totalComp}</td>
              <td className="num strong">{totalKw.toFixed(2)} kW</td>
              <td className="num">100%</td>
              <td className="num">{rp.format(Math.round(totalKwh))} kWh</td>
              <td className="num">Rp {rp.format(Math.round(totalCost))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
