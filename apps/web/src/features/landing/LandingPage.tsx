import "./landing.css";

// Landing de presentación (BUILD TRACKING · Real-Time Construction Intelligence).
// Se muestra al entrar a la plataforma, ANTES del login. El botón "Ingresar"
// (onEnter) lleva a la pantalla de login/registro. Contenido basado en el
// material de marketing del producto (módulos IA, planes, kits de hardware).

function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg className="lp-logo" width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="BuildTracking">
      <path d="M6 8 h13 a10 10 0 0 1 0 20 H6 Z" fill="#f7941d" />
      <path d="M6 20 h15 a10 10 0 0 1 0 20 H6 Z" fill="#ffffff" opacity="0.92" />
      <path d="M27 6 l15 9 v18 l-15 9 -3-2 V8 Z" fill="#f7941d" opacity="0.85" />
    </svg>
  );
}

const MODULES = [
  { ic: "👷", name: "Worker Counting" },
  { ic: "🚚", name: "Truck Counting" },
  { ic: "🚜", name: "Equipment Tracking" },
  { ic: "📦", name: "Material Deliveries" },
  { ic: "⛏️", name: "Earth Movement" },
  { ic: "📈", name: "Productivity Analysis" },
];

const FEATURES = [
  { ic: "🧠", t: "AI Powered Analytics" },
  { ic: "☀️", t: "Solar Powered & Autonomous" },
  { ic: "📶", t: "4G Connected" },
  { ic: "🕐", t: "24/7 Monitoring" },
  { ic: "🛡️", t: "Weather Resistant" },
];

const VALUES = [
  { ic: "🛡️", t: "Reduce Delays", d: "Detectá problemas antes" },
  { ic: "💲", t: "Control Costs", d: "Recursos en tiempo real" },
  { ic: "📊", t: "Improve Productivity", d: "Decisiones con datos" },
  { ic: "🌐", t: "Full Visibility", d: "Desde cualquier lugar" },
  { ic: "📄", t: "Automatic Reports", d: "Ahorrá tiempo, más precisión" },
];

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="lp">
      <div className="lp__inner">
        {/* Topbar */}
        <div className="lp__topbar">
          <div className="lp-brand">
            <LogoMark />
            <div className="lp-brand__text">
              <div className="lp-brand__name">
                BUILD<em>TRACKING</em>
              </div>
              <div className="lp-brand__tag">Real-Time Construction Intelligence</div>
            </div>
          </div>
          <button className="lp__enter-top" onClick={onEnter}>
            Ingresar →
          </button>
        </div>

        {/* Hero */}
        <div className="lp-hero">
          <div>
            <h1 className="lp-hero__title">
              Sabé exactamente qué pasa en tu obra, <em>todos los días.</em>
            </h1>
            <ul className="lp-features">
              {FEATURES.map((f) => (
                <li className="lp-feature" key={f.t}>
                  <span className="lp-feature__ic">{f.ic}</span>
                  {f.t}
                </li>
              ))}
            </ul>
            <button className="lp__cta" onClick={onEnter}>
              Ingresar a la plataforma →
            </button>
          </div>

          {/* Dashboard preview (KPIs) */}
          <div className="lp-kpis">
            <div>
              <div className="lp-kpi__label">Workers Today</div>
              <div className="lp-kpi__value">47</div>
              <div className="lp-kpi__delta">▲ 12% vs ayer</div>
            </div>
            <div>
              <div className="lp-kpi__label">Trucks Today</div>
              <div className="lp-kpi__value">16</div>
              <div className="lp-kpi__delta">▲ 23% vs ayer</div>
            </div>
            <div>
              <div className="lp-kpi__label">Equipment Active</div>
              <div className="lp-kpi__value">7</div>
              <div className="lp-kpi__delta">▲ 2 vs ayer</div>
            </div>
            <div>
              <div className="lp-kpi__label">Material Deliveries</div>
              <div className="lp-kpi__value">12</div>
              <div className="lp-kpi__delta">▲ 8% vs ayer</div>
            </div>
            <div className="lp-kpi--wide">
              <div>
                <div className="lp-kpi__label">Project Progress</div>
                <div className="lp-kpi__value">63%</div>
                <div className="lp-kpi__delta">On Schedule</div>
              </div>
              <div className="lp-ring" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* AI modules */}
        <h2 className="lp-sec">
          Módulos de <em>análisis con IA</em>
        </h2>
        <div className="lp-modules">
          {MODULES.map((m) => (
            <div className="lp-mod" key={m.name}>
              <div className="lp-mod__ic">{m.ic}</div>
              <div className="lp-mod__name">{m.name}</div>
            </div>
          ))}
        </div>

        {/* Subscription plans */}
        <h2 className="lp-sec">
          Planes <em>mensuales</em>
        </h2>
        <div className="lp-cards">
          <div className="lp-plan lp-plan--basic">
            <div className="lp-plan__name">BASIC</div>
            <div className="lp-plan__price">
              IDR 3.900.000 <span>/ mes</span>
            </div>
            <ul className="lp-list">
              <li>Acceso al dashboard</li>
              <li>Fotos automáticas</li>
              <li>Time-lapse</li>
              <li>Reportes semanales</li>
              <li>Almacenamiento en la nube</li>
            </ul>
          </div>
          <div className="lp-plan lp-plan--pro lp-plan--popular">
            <span className="lp-badge">Más popular</span>
            <div className="lp-plan__name">PROFESSIONAL</div>
            <div className="lp-plan__price">
              IDR 6.900.000 <span>/ mes</span>
            </div>
            <ul className="lp-list">
              <li>Todo lo de Basic</li>
              <li>Conteo de personal</li>
              <li>Conteo de camiones</li>
              <li>Reportes con IA</li>
              <li>Seguimiento de avance</li>
              <li>Soporte prioritario</li>
            </ul>
          </div>
          <div className="lp-plan lp-plan--ent">
            <div className="lp-plan__name">ENTERPRISE</div>
            <div className="lp-plan__price">
              IDR 12.900.000 <span>/ mes</span>
            </div>
            <ul className="lp-list">
              <li>Todo lo de Professional</li>
              <li>Multi-proyecto</li>
              <li>Dashboard para inversores</li>
              <li>Reportes personalizados</li>
              <li>Acceso a API</li>
              <li>Soporte dedicado</li>
            </ul>
          </div>
        </div>

        {/* Hardware kits */}
        <h2 className="lp-sec">
          Kits de <em>hardware</em> (pago único)
        </h2>
        <div className="lp-cards">
          <div className="lp-kit">
            <div className="lp-kit__name">KIT STARTER</div>
            <div className="lp-kit__price">IDR 25.000.000</div>
            <ul className="lp-list">
              <li>1 cámara IA 8MP</li>
              <li>Panel solar 200W</li>
              <li>Batería LiFePO4 100Ah</li>
              <li>Router 4G LTE</li>
              <li>Instalación incluida</li>
              <li>Dashboard + time-lapse</li>
            </ul>
          </div>
          <div className="lp-kit lp-kit--pro">
            <div className="lp-kit__name">KIT PRO</div>
            <div className="lp-kit__price">IDR 39.000.000</div>
            <ul className="lp-list">
              <li>2 cámaras IA 8MP</li>
              <li>Cobertura extendida</li>
              <li>Seguimiento de equipos</li>
              <li>Control de contratistas</li>
              <li>Dashboard avanzado + IA</li>
              <li>Soporte prioritario</li>
            </ul>
          </div>
          <div className="lp-kit lp-kit--ent">
            <div className="lp-kit__name">KIT ENTERPRISE</div>
            <div className="lp-kit__price">desde IDR 59.000.000</div>
            <ul className="lp-list">
              <li>3+ cámaras IA 8MP</li>
              <li>Gestión multi-sitio</li>
              <li>Dashboard para inversores</li>
              <li>Análisis de movimiento de tierra</li>
              <li>Estimación de costos + API</li>
              <li>Soporte dedicado</li>
            </ul>
          </div>
        </div>

        {/* Value props */}
        <div className="lp-values">
          {VALUES.map((v) => (
            <div className="lp-val" key={v.t}>
              <div className="lp-val__ic">{v.ic}</div>
              <div className="lp-val__t">{v.t}</div>
              <div className="lp-val__d">{v.d}</div>
            </div>
          ))}
        </div>

        {/* Footer CTA + contacto */}
        <div className="lp-foot">
          <div className="lp-foot__contact">
            <div>
              <strong>Let's track your project</strong>
            </div>
            <div>📞 +62 812 3456 7890</div>
            <div>✉️ info@buildtracking.com · 🌐 www.buildtracking.com</div>
            <div>📍 Bali, Indonesia</div>
          </div>
          <button className="lp__cta" onClick={onEnter}>
            Ingresar a la plataforma →
          </button>
        </div>
      </div>
    </div>
  );
}
