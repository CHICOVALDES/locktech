import "./landing.css";
import { useI18n } from "../../i18n/I18nProvider.js";
import { LanguageSwitcher } from "../../i18n/LanguageSwitcher.js";
import { landingT } from "./landingTranslations.js";

// Landing de presentación (BUILD TRACKING · BT.ai). Se muestra al entrar, ANTES
// del login. Identidad oficial: dorado #FFC107, negro #111111, Montserrat.
// Logo "BT.ai" (barras doradas + BT blanco + .ai dorado). Traducida a 8 idiomas.

// Logo oficial BT.ai: barras ascendentes doradas + "BT" blanco + ".ai" dorado.
function LogoMark({ height = 40 }: { height?: number }) {
  return (
    <svg className="lp-logo" height={height} viewBox="0 0 138 48" role="img" aria-label="BT.ai — Build Tracking">
      <rect x="2" y="30" width="7" height="16" rx="1" fill="#ffc107" />
      <rect x="12" y="21" width="7" height="25" rx="1" fill="#ffc107" />
      <rect x="22" y="12" width="7" height="34" rx="1" fill="#ffc107" />
      <text x="34" y="40" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="40" fill="#ffffff">BT</text>
      <text x="90" y="40" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="40" fill="#ffc107">.ai</text>
    </svg>
  );
}

const CONTACT = {
  phone: "+62 812 3675 4965",
  ig: "@buildtracking.ai",
  email: "eduardo@buildtracking.ai",
  location: "Bali, Indonesia",
};

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
  const tiles = [
    { ic: "👷", label: "kpiWorkers", value: "47", delta: "▲ 12%" },
    { ic: "🚚", label: "kpiTrucks", value: "16", delta: "▲ 23%" },
    { ic: "🚜", label: "kpiEquip", value: "7", delta: "▲ 2" },
    { ic: "📦", label: "kpiDeliveries", value: "12", delta: "▲ 8%" },
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
            <LogoMark height={42} />
            <div className="lp-brand__text">
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

          {/* Producto: cámara autónoma de marca */}
          <div className="lp-hero__cam">
            <img src="/images/cam-bt.jpg" alt="BT.ai autonomous camera" />
            <span className="lp-hero__cam-tag">📷 {t("camT")}</span>
          </div>
        </div>

        {/* AI detection — dashboard (tiles) + live site view */}
        <h2 className="lp-sec">{t("secDetect")}</h2>
        <div className="lp-tiles">
          {tiles.map((tl) => (
            <div className="lp-tile" key={tl.label}>
              <span className="lp-tile__ic">{tl.ic}</span>
              <div>
                <div className="lp-tile__label">{t(tl.label)}</div>
                <div className="lp-tile__value">{tl.value}</div>
                <div className="lp-tile__delta">
                  {tl.delta} {t("vsYesterday")}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lp-detect">
          <img className="lp-detect__img" src="/images/det-site.jpg" alt="Live site view" />
          <span className="lp-detect__tag">{t("live")}</span>
          <div className="lp-detect__chips">
            <span className="lp-chip lp-chip--det lp-chip--worker">WORKERS <b>47</b></span>
            <span className="lp-chip lp-chip--det lp-chip--truck">DUMP TRUCKS <b>16</b></span>
            <span className="lp-chip lp-chip--det lp-chip--equip">EXCAVATORS <b>7</b></span>
          </div>
          <div className="lp-scan" />
          <span className="lp-box lp-box--equip" style={{ left: "44%", top: "34%", width: "26%", height: "34%" }}>
            <span className="lp-box__lb">EXCAVATOR 98%</span>
          </span>
          <span className="lp-box lp-box--equip" style={{ left: "86%", top: "48%", width: "12%", height: "11%" }}>
            <span className="lp-box__lb">EXCAVATOR 91%</span>
          </span>
          <span className="lp-box lp-box--worker" style={{ left: "24%", top: "57%", width: "5%", height: "11%" }}>
            <span className="lp-box__lb">WORKER</span>
          </span>
        </div>

        <div className="lp-detect-cards">
          <div className="lp-dcard">
            <div className="lp-dcard__ph">
              <img src="/images/det-worker.jpg" alt="" />
              <span className="lp-box lp-box--worker" style={{ left: "32%", top: "36%", width: "27%", height: "48%" }}>
                <span className="lp-box__lb">WORKER 99%</span>
              </span>
            </div>
            <div className="lp-dcard__body">
              <div className="lp-dcard__name">{t("mWorker")}</div>
              <div className="lp-dcard__desc">{t("dWorkerD")}</div>
            </div>
          </div>
          <div className="lp-dcard">
            <div className="lp-dcard__ph">
              <img src="/images/det-truck.jpg" alt="" />
              <span className="lp-box lp-box--truck" style={{ left: "51%", top: "24%", width: "26%", height: "38%" }}>
                <span className="lp-box__lb">TRUCK 97%</span>
              </span>
            </div>
            <div className="lp-dcard__body">
              <div className="lp-dcard__name">{t("mTruck")}</div>
              <div className="lp-dcard__desc">{t("dTruckD")}</div>
            </div>
          </div>
          <div className="lp-dcard">
            <div className="lp-dcard__ph">
              <img src="/images/det-site.jpg" alt="" />
              <span className="lp-box lp-box--equip" style={{ left: "43%", top: "33%", width: "27%", height: "35%" }}>
                <span className="lp-box__lb">EXCAVATOR 98%</span>
              </span>
            </div>
            <div className="lp-dcard__body">
              <div className="lp-dcard__name">{t("photoA")}</div>
              <div className="lp-dcard__desc">{t("photoAD")}</div>
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

        {/* Time-lapse */}
        <div className="lp-timelapse">
          <div>
            <h3 className="lp-timelapse__title">🎬 {t("tlTitle")}</h3>
            <p className="lp-timelapse__desc">{t("tlDesc")}</p>
          </div>
          <video className="lp-timelapse__video" src="/videos/pool-jan-aug.mp4" autoPlay muted loop playsInline controls />
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
        <div className="lp-kits-head">
          <h2 className="lp-sec">{t("secKits")}</h2>
          <div className="lp-cam">
            <img className="lp-cam__photo" src="/images/cam-bt.jpg" alt={t("camT")} />
            <div>
              <b>{t("camT")}</b>
              <div>{t("camD")}</div>
            </div>
          </div>
        </div>
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

        {/* Footer CTA + contacto completo */}
        <div className="lp-foot">
          <div className="lp-foot__contact">
            <div className="lp-foot__name">
              <strong>Eduardo Valdez Vial</strong> · <span>Founder &amp; CEO</span>
            </div>
            <div>📞 {CONTACT.phone}</div>
            <div>📷 {CONTACT.ig}</div>
            <div>✉️ {CONTACT.email}</div>
            <div>📍 {CONTACT.location}</div>
          </div>
          <button className="lp__cta" onClick={onEnter}>
            {t("enterCta")} →
          </button>
        </div>
      </div>
    </div>
  );
}
