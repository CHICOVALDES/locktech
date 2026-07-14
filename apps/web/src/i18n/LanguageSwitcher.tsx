import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_META } from "./translations.js";
import { useI18n } from "./I18nProvider.js";

/** Selector de idioma 🌐 para la barra superior. Cada cliente elige el suyo. */
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = LOCALE_META[locale];

  return (
    <div className="lang" ref={ref}>
      <button
        className="lang__btn"
        onClick={() => setOpen((o) => !o)}
        title="Idioma / Language"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lang__globe">🌐</span>
        <span className="lang__flag">{current.flag}</span>
        <span className="lang__code">{locale.toUpperCase()}</span>
      </button>
      {open && (
        <ul className="lang__menu" role="listbox">
          {LOCALES.map((code) => {
            const meta = LOCALE_META[code];
            return (
              <li key={code}>
                <button
                  className={`lang__item ${code === locale ? "lang__item--active" : ""}`}
                  role="option"
                  aria-selected={code === locale}
                  onClick={() => {
                    setLocale(code);
                    setOpen(false);
                  }}
                >
                  <span className="lang__flag">{meta.flag}</span>
                  <span className="lang__item-label">{meta.label}</span>
                  <span className="lang__item-code">{code.toUpperCase()}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
