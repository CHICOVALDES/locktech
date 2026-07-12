import { useState, type FormEvent } from "react";
import type { RegisterInput } from "./accounts.js";

interface LoginScreenProps {
  /** Devuelve un mensaje de error, o null si fue exitoso. */
  onLogin: (username: string, password: string) => string | null;
  onRegister: (input: RegisterInput) => string | null;
}

type Mode = "login" | "register";

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__brand">
          <span className="login__brand-mark">◈</span>
          <span className="login__brand-name">BALI MOTO TRACK</span>
          <span className="login__brand-sub">Seguridad antirrobo · GPS en vivo</span>
        </div>

        <div className="login__tabs">
          <button
            type="button"
            className={`login__tab ${!isRegister ? "login__tab--active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Ingresar
          </button>
          <button
            type="button"
            className={`login__tab ${isRegister ? "login__tab--active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Registrarse
          </button>
        </div>

        {isRegister && (
          <>
            <label className="login__field">
              <span className="login__label">Nombre del rental / negocio</span>
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
              <span className="login__label">Contacto</span>
              <input
                className="login__input"
                type="text"
                placeholder="Tu nombre"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </label>

            <label className="login__field">
              <span className="login__label">Teléfono / WhatsApp</span>
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
          <span className="login__label">Usuario</span>
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
          <span className="login__label">Contraseña</span>
          <input
            className="login__input"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="login__error">{error}</p>}

        <button className="login__submit" type="submit" disabled={!canSubmit}>
          {isRegister ? "Crear cuenta" : "Ingresar"}
        </button>

        {isRegister ? (
          <p className="login__hint">
            ¿Ya tenés cuenta?{" "}
            <button type="button" className="login__link" onClick={() => switchMode("login")}>
              Ingresar
            </button>
          </p>
        ) : (
          <p className="login__hint">
            ¿Nuevo rental?{" "}
            <button type="button" className="login__link" onClick={() => switchMode("register")}>
              Registrate
            </button>
            <br />
            Demo: <code>mrrental</code> / <code>bali123</code> · <code>admin</code> / <code>admin</code>
          </p>
        )}
      </form>
    </div>
  );
}
