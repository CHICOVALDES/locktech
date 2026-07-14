import { useState, type FormEvent } from "react";
import type { RegisterInput } from "./accounts.js";
import { useI18n } from "../../i18n/I18nProvider.js";
import { LanguageSwitcher } from "../../i18n/LanguageSwitcher.js";
import { BtLogo } from "../../components/BtLogo.js";

interface LoginScreenProps {
  /** Devuelve un mensaje de error, o null si fue exitoso. */
  onLogin: (username: string, password: string) => string | null;
  onRegister: (input: RegisterInput) => string | null;
}

type Mode = "login" | "register";

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("login");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (mode === "login") {
      setError(onLogin(username, password));
    } else {
      setError(onRegister({ businessName, contactName, phone, username, password }));
    }
  }

  const isRegister = mode === "register";
  const canSubmit = isRegister ? businessName && username && password : username && password;

  return (
    <div className="login">
      <div className="login__topbar">
        <LanguageSwitcher />
      </div>
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__brand">
          <BtLogo height={38} />
          <span className="login__brand-name">BUILD TRACKING</span>
          <span className="login__brand-sub">Real-Time Construction Intelligence</span>
        </div>

        <div className="login__tabs">
          <button
            type="button"
            className={`login__tab ${!isRegister ? "login__tab--active" : ""}`}
            onClick={() => switchMode("login")}
          >
            {t("login.tabLogin")}
          </button>
          <button
            type="button"
            className={`login__tab ${isRegister ? "login__tab--active" : ""}`}
            onClick={() => switchMode("register")}
          >
            {t("login.tabRegister")}
          </button>
        </div>

        {isRegister && (
          <>
            <label className="login__field">
              <span className="login__label">{t("login.businessName")}</span>
              <input
                className="login__input"
                type="text"
                placeholder="Mi Rental Bali"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                autoFocus
              />
            </label>

            <label className="login__field">
              <span className="login__label">{t("login.contact")}</span>
              <input
                className="login__input"
                type="text"
                placeholder={t("login.phContact")}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </label>

            <label className="login__field">
              <span className="login__label">{t("login.phone")}</span>
              <input
                className="login__input"
                type="tel"
                placeholder="+62 812-3456-7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </>
        )}

        <label className="login__field">
          <span className="login__label">{t("login.username")}</span>
          <input
            className="login__input"
            type="text"
            autoComplete="username"
            placeholder="tu-rental"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus={!isRegister}
          />
        </label>

        <label className="login__field">
          <span className="login__label">{t("login.password")}</span>
          <div className="login__pass">
            <input
              className="login__input login__input--pass"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="login__eye"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </label>

        {error && <p className="login__error">{error}</p>}

        <button className="login__submit" type="submit" disabled={!canSubmit}>
          {isRegister ? t("login.submitRegister") : t("login.tabLogin")}
        </button>

        {isRegister ? (
          <p className="login__hint">
            {t("login.haveAccountQ")}{" "}
            <button type="button" className="login__link" onClick={() => switchMode("login")}>
              {t("login.tabLogin")}
            </button>
          </p>
        ) : (
          <p className="login__hint">
            {t("login.newRentalQ")}{" "}
            <button type="button" className="login__link" onClick={() => switchMode("register")}>
              {t("login.registerLink")}
            </button>
            <br />
            {t("login.demo")} <code>mrrental</code> / <code>bali123</code> · <code>admin</code> / <code>admin</code>
          </p>
        )}
      </form>
    </div>
  );
}
