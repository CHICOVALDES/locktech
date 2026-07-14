import "./landing.css";
import { useI18n } from "../../i18n/I18nProvider.js";
import { LanguageSwitcher } from "../../i18n/LanguageSwitcher.js";
import { landingT } from "./landingTranslations.js";

// Landing de presentación (BUILD TRACKING · Real-Time Construction Intelligence).
// Se muestra al entrar, ANTES del login. Traducida a los 8 idiomas de la
// plataforma (usa el mismo `locale` compartido) con su propio diccionario.

function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg className="lp-logo" width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="BuildTracking">
      <path d="M6 8 h13 a10 10 0 0 1 0 20 H6 Z" fill="#f7941d" />
      <path d="M6 20 h15 a10 10 0 0 1 0 20 H6 Z" fill="#ffffff" opacity="0.92" />
      <path d="M27 6 l15 9 v18 l-15 9 -3-2 V8 Z" fill="#f7941d" opacity="0.85" />
    </svg>
  );
}

// Número de teléfono de contacto (único dato por ahora; el resto se agrega luego).
const CONTACT_PHONE = "+62 812 3456 7890";

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const { locale } = useI18n();
  const t = (k: string) => landingT(locale, k);

  const modules = [
    { ic: "👷", k: "mWorker" },
    { ic: "🚚", k: "mTruck" },
    { ic: "🚜", k: "mEquip" },
    { ic: "📦", k: "mMaterial" },
    { ic: "⛏️", k: "mEarth" },
    { ic: "📈", k: "mProductivity" },
  ];
  const features = [
    { ic: "🧠", k: "fAi" },
    { ic: "☀️", k: "fSolar" },
    { ic: "📶", k: "f4g" },
    { ic: "🕐", k: "f247" },
    { ic: "🛡️", k: "fWeather" },
  ];
  const values = [
    { ic: "🛡️", t: "v1t", d: "v1d" },
    { ic: "💲", t: "v2t", d: "v2d" },
    { ic: "📊", t: "v3t", d: "v3d" },
    { ic: "🌐", t: "v4t", d: "v4d" },
    { ic: "📄", t: "v5t", d: "v5d" },
  ];

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
              <div className="lp-brand__tag">{t("tag")}</div>
            </div>
          </div>
          <div className="lp__topbar-actions">
            <LanguageSwitcher />
            <button className="lp__enter-top" onClick={onEnter}>
              {t("enter")} →
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="lp-hero">
          <div>
            <h1 className="lp-hero__title">
              {t("heroA")} <em>{t("heroB")}</em>
            </h1>
            <ul className="lp-features">
              {features.map((f) => (
                <li className="lp-feature" key={f.k}>
                  <span className="lp-feature__ic">{f.ic}</span>
                  {t(f.k)}
                </li>
              ))}
            </ul>
            <button className="lp__cta" onClick={onEnter}>
              {t("enterCta")} →
            </button>
          </div>

          {/* Dashboard preview (KPIs) */}
          <div className="lp-kpis">
            <div>
              <div className="lp-kpi__label">{t("kpiWorkers")}</div>
              <div className="lp-kpi__value">47</div>
              <div className="lp-kpi__delta">▲ 12% {t("vsYesterday")}</div>
            </div>
            <div>
              <div className="lp-kpi__label">{t("kpiTrucks")}</div>
              <div className="lp-kpi__value">16</div>
              <div className="lp-kpi__delta">▲ 23% {t("vsYesterday")}</div>
            </div>
            <div>
              <div className="lp-kpi__label">{t("kpiEquip")}</div>
              <div className="lp-kpi__value">7</div>
              <div className="lp-kpi__delta">▲ 2 {t("vsYesterday")}</div>
            </div>
            <div>
              <div className="lp-kpi__label">{t("kpiDeliveries")}</div>
              <div className="lp-kpi__value">12</div>
              <div className="lp-kpi__delta">▲ 8% {t("vsYesterday")}</div>
            </div>
            <div className="lp-kpi--wide">
              <div>
                <div className="lp-kpi__label">{t("kpiProgress")}</div>
                <div className="lp-kpi__value">63%</div>
                <div className="lp-kpi__delta">{t("onSchedule")}</div>
              </div>
              <div className="lp-ring" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* AI modules */}
        <h2 className="lp-sec">{t("secModules")}</h2>
        <div className="lp-modules">
          {modules.map((m) => (
            <div className="lp-mod" key={m.k}>
              <div className="lp-mod__ic">{m.ic}</div>
              <div className="lp-mod__name">{t(m.k)}</div>
            </div>
          ))}
        </div>

        {/* Subscription plans */}
        <h2 className="lp-sec">{t("secPlans")}</h2>
        <div className="lp-cards">
          <div className="lp-plan lp-plan--basic">
            <div className="lp-plan__name">BASIC</div>
            <div className="lp-plan__price">
              IDR 3.900.000 <span>{t("perMonth")}</span>
            </div>
            <ul className="lp-list">
              <li>{t("b1")}</li>
              <li>{t("b2")}</li>
              <li>{t("b3")}</li>
              <li>{t("b4")}</li>
              <li>{t("b5")}</li>
            </ul>
          </div>
          <div className="lp-plan lp-plan--pro lp-plan--popular">
            <span className="lp-badge">{t("popular")}</span>
            <div className="lp-plan__name">PROFESSIONAL</div>
            <div className="lp-plan__price">
              IDR 6.900.000 <span>{t("perMonth")}</span>
            </div>
            <ul className="lp-list">
              <li>{t("p1")}</li>
              <li>{t("p2")}</li>
              <li>{t("p3")}</li>
              <li>{t("p4")}</li>
              <li>{t("p5")}</li>
              <li>{t("p6")}</li>
            </ul>
          </div>
          <div className="lp-plan lp-plan--ent">
            <div className="lp-plan__name">ENTERPRISE</div>
            <div className="lp-plan__price">
              IDR 12.900.000 <span>{t("perMonth")}</span>
            </div>
            <ul className="lp-list">
              <li>{t("e1")}</li>
              <li>{t("e2")}</li>
              <li>{t("e3")}</li>
              <li>{t("e4")}</li>
              <li>{t("e5")}</li>
              <li>{t("e6")}</li>
            </ul>
          </div>
        </div>

        {/* Hardware kits */}
        <h2 className="lp-sec">{t("secKits")}</h2>
        <div className="lp-cards">
          <div className="lp-kit">
            <div className="lp-kit__name">KIT STARTER</div>
            <div className="lp-kit__price">IDR 25.000.000</div>
            <ul className="lp-list">
              <li>{t("ks1")}</li>
              <li>{t("ks2")}</li>
              <li>{t("ks3")}</li>
              <li>{t("ks4")}</li>
              <li>{t("ks5")}</li>
              <li>{t("ks6")}</li>
            </ul>
          </div>
          <div className="lp-kit lp-kit--pro">
            <div className="lp-kit__name">KIT PRO</div>
            <div className="lp-kit__price">IDR 39.000.000</div>
            <ul className="lp-list">
              <li>{t("kp1")}</li>
              <li>{t("kp2")}</li>
              <li>{t("kp3")}</li>
              <li>{t("kp4")}</li>
              <li>{t("kp5")}</li>
              <li>{t("kp6")}</li>
            </ul>
          </div>
          <div className="lp-kit lp-kit--ent">
            <div className="lp-kit__name">KIT ENTERPRISE</div>
            <div className="lp-kit__price">IDR 59.000.000+</div>
            <ul className="lp-list">
              <li>{t("ke1")}</li>
              <li>{t("ke2")}</li>
              <li>{t("ke3")}</li>
              <li>{t("ke4")}</li>
              <li>{t("ke5")}</li>
              <li>{t("ke6")}</li>
            </ul>
          </div>
        </div>

        {/* Value props */}
        <div className="lp-values">
          {values.map((v) => (
            <div className="lp-val" key={v.t}>
              <div className="lp-val__ic">{v.ic}</div>
              <div className="lp-val__t">{t(v.t)}</div>
              <div className="lp-val__d">{t(v.d)}</div>
            </div>
          ))}
        </div>

        {/* Footer CTA + contacto (solo teléfono por ahora) */}
        <div className="lp-foot">
          <div className="lp-foot__contact">
            <div>
              <strong>{t("footTitle")}</strong>
            </div>
            <div>📞 {CONTACT_PHONE}</div>
          </div>
          <button className="lp__cta" onClick={onEnter}>
            {t("enterCta")} →
          </button>
        </div>
      </div>
    </div>
  );
}
