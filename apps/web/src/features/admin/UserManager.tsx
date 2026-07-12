import { useState, type FormEvent } from "react";
import {
  allAccounts,
  createAccount,
  isFactoryAccount,
  PLANS,
  removeRegisteredAccount,
  type ClientAccount,
  type Role,
} from "../auth/accounts.js";

// Panel de administración de usuarios (solo admin). Permite crear clientes (y
// otros admins) y eliminar los creados. Demo: persiste en localStorage vía
// accounts.ts. En Fase 1 esto pega contra el backend real de auth.

const ROLE_LABEL: Record<Role, string> = { admin: "Administrador", client: "Cliente" };

export function UserManager() {
  const [accounts, setAccounts] = useState<ClientAccount[]>(() => allAccounts());

  function refresh() {
    setAccounts(allAccounts());
  }

  function handleRemove(username: string) {
    removeRegisteredAccount(username);
    refresh();
  }

  return (
    <div className="devmgr">
      <header className="devmgr__head">
        <h1 className="devmgr__title">USUARIOS</h1>
      </header>

      <div className="devmgr__cols">
        <UserForm onCreated={refresh} />

        <section className="devlist">
          <h2 className="devlist__title">Usuarios ({accounts.length})</h2>
          <ul className="devlist__items">
            {accounts.map((a) => {
              const factory = isFactoryAccount(a.username);
              return (
                <li key={a.username} className="devlist__item">
                  <div className="devlist__item-main">
                    <span className="devlist__item-name">{a.profile.businessName}</span>
                    <span className="devlist__badge">{ROLE_LABEL[a.role]}</span>
                  </div>
                  <span className="devlist__item-line">
                    Usuario: {a.username} · Plan: {a.profile.plan}
                  </span>
                  <span className="devlist__item-line">
                    {a.profile.contactName} · {a.profile.phone} · {a.devices.length} equipo(s)
                  </span>
                  {!factory && (
                    <button className="devlist__remove" onClick={() => handleRemove(a.username)} aria-label="Eliminar">
                      ✕
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function UserForm({ onCreated }: { onCreated: () => void }) {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [plan, setPlan] = useState(PLANS[0]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canSubmit = businessName.trim() && username.trim() && password.trim();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const result = createAccount({ businessName, contactName, phone, username, password, role, plan });
    if (result.error) {
      setError(result.error);
      setOk(null);
      return;
    }
    setError(null);
    setOk(`Usuario "${result.account!.username}" creado.`);
    setBusinessName("");
    setContactName("");
    setPhone("");
    setUsername("");
    setPassword("");
    onCreated();
  }

  return (
    <form className="devform" onSubmit={handleSubmit}>
      <h2 className="devform__title">Crear usuario</h2>

      <label className="devform__field">
        <span className="devform__label">Razón social / negocio</span>
        <input className="devform__input" placeholder="MR Rental Bali" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      </label>

      <div className="devform__row">
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Nombre de contacto</span>
          <input className="devform__input" placeholder="Made Rai" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </label>
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Teléfono</span>
          <input className="devform__input" placeholder="+62 812-3456-7890" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      </div>

      <div className="devform__row">
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Usuario</span>
          <input className="devform__input" placeholder="mrrental" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Contraseña</span>
          <input className="devform__input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      </div>

      <div className="devform__row">
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Rol</span>
          <select className="devform__input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="client">Cliente</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        <label className="devform__field devform__field--grow">
          <span className="devform__label">Plan</span>
          <select className="devform__input" value={plan} onChange={(e) => setPlan(e.target.value)}>
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="devmgr__warn">{error}</p>}
      {ok && <p className="devform__preview-label">{ok}</p>}

      <button className="devform__submit" type="submit" disabled={!canSubmit}>
        Crear usuario
      </button>
    </form>
  );
}
