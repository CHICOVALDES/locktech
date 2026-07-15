// Autenticación DEMO (solo frontend). En Fase 1 esto se reemplaza por login/registro
// real contra el backend (`POST /auth/register` y `POST /auth/login`): el servidor
// valida, hashea la contraseña, emite un JWT y el tenant se deriva SIEMPRE del token.
// NO usar esto en producción — las contraseñas se guardan en texto plano en
// localStorage a propósito para poder probar la demo sin backend.

export type Role = "admin" | "client";

export interface DeviceRef {
  vehicleId: string;
  label: string;
}

export interface ClientProfile {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  plan: string;
}

export interface ClientAccount {
  username: string;
  password: string;
  role: Role;
  profile: ClientProfile;
  /** Dispositivos que ve este cliente. El admin ve toda la flota sin importar este campo. */
  devices: DeviceRef[];
}

const REGISTERED_KEY = "bmt.accounts";

// Cuentas de fábrica (siempre disponibles).
export const DEMO_ACCOUNTS: ClientAccount[] = [
  {
    // La Parada Tanah Lot — restaurante del usuario. Monitoreo con cámara en vivo,
    // time-lapse del día y análisis IA (personas / materiales / actividad).
    username: "laparada",
    password: "parada123",
    role: "client",
    profile: {
      id: "la-parada",
      businessName: "La Parada · Tanah Lot",
      contactName: "Eduardo Valdez Vial",
      phone: "+62 812 3675 4965",
      plan: "Monitoreo AI",
    },
    devices: [],
  },
  {
    username: "mrrental",
    password: "bali123",
    role: "client",
    profile: {
      id: "mr-rental",
      businessName: "MR Rental Bali",
      contactName: "Made Rai",
      phone: "+62 812-3456-7890",
      plan: "Antirrobo Pro",
    },
    devices: [
      { vehicleId: "RM-XMAX-180", label: "Yamaha XMAX 180" },
      { vehicleId: "CV-NMAX-365", label: "Yamaha NMAX 365" },
      { vehicleId: "VB-AEROX-155", label: "Yamaha Aerox 155" },
      { vehicleId: "VB-PCX-160", label: "Honda PCX 160" },
    ],
  },
  {
    username: "valdes",
    password: "bali123",
    role: "client",
    profile: {
      id: "custom-valdes",
      businessName: "Custom by Valdés",
      contactName: "Rally Valdés",
      phone: "+62 813-9988-7766",
      plan: "Antirrobo Pro",
    },
    devices: [
      { vehicleId: "CV-NMAX-365", label: "Yamaha NMAX 365" },
      { vehicleId: "VB-AEROX-155", label: "Yamaha Aerox 155" },
      { vehicleId: "VB-PCX-160", label: "Honda PCX 160" },
    ],
  },
  {
    username: "admin",
    password: "admin",
    role: "admin",
    profile: {
      id: "platform",
      businessName: "Bali Moto Track",
      contactName: "Operador de plataforma",
      phone: "—",
      plan: "Platform Admin",
    },
    devices: [],
  },
];

// Cuentas creadas por el registro (persisten en localStorage).
export function loadRegisteredAccounts(): ClientAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_KEY);
    return raw ? (JSON.parse(raw) as ClientAccount[]) : [];
  } catch {
    return [];
  }
}

// Ediciones del admin sobre cualquier cuenta (incluidas las de fábrica): se
// guardan como "overrides" en localStorage y se aplican encima de la cuenta base.
const OVERRIDES_KEY = "bmt.account.overrides";

export interface AccountPatch {
  businessName?: string;
  contactName?: string;
  phone?: string;
  plan?: string;
  password?: string;
  role?: Role;
}

function loadOverrides(): Record<string, AccountPatch> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AccountPatch>) : {};
  } catch {
    return {};
  }
}

function applyOverride(acc: ClientAccount, patch?: AccountPatch): ClientAccount {
  if (!patch) return acc;
  return {
    ...acc,
    password: patch.password ?? acc.password,
    role: patch.role ?? acc.role,
    profile: {
      ...acc.profile,
      businessName: patch.businessName ?? acc.profile.businessName,
      contactName: patch.contactName ?? acc.profile.contactName,
      phone: patch.phone ?? acc.profile.phone,
      plan: patch.plan ?? acc.profile.plan,
    },
  };
}

export function allAccounts(): ClientAccount[] {
  const overrides = loadOverrides();
  return [...DEMO_ACCOUNTS, ...loadRegisteredAccounts()].map((a) => applyOverride(a, overrides[a.username]));
}

// Edita una cuenta (cualquiera, incl. de fábrica). Guarda un override local.
export function updateAccount(username: string, patch: AccountPatch): { error?: string } {
  const u = username.trim().toLowerCase();
  if (!findAccount(u)) return { error: "La cuenta no existe." };
  if (patch.password !== undefined && patch.password.trim() === "") {
    return { error: "La contraseña no puede quedar vacía." };
  }
  const overrides = loadOverrides();
  overrides[u] = { ...overrides[u], ...patch };
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  return {};
}

export function findAccount(username: string): ClientAccount | null {
  const u = username.trim().toLowerCase();
  return allAccounts().find((a) => a.username === u) ?? null;
}

// Clientes (rentals) disponibles para asignarles dispositivos desde el admin.
export function clientAccounts(): ClientAccount[] {
  return allAccounts().filter((a) => a.role === "client");
}

export function authenticate(username: string, password: string): ClientAccount | null {
  const acc = findAccount(username);
  return acc && acc.password === password ? acc : null;
}

// Planes disponibles para asignarle a un cliente.
export const PLANS = ["Antirrobo Pro", "Básico", "Flota"];

export interface RegisterInput {
  businessName: string;
  contactName: string;
  phone: string;
  username: string;
  password: string;
}

// Crea una cuenta. El admin puede fijar rol y plan; el auto-registro del login
// usa los valores por defecto (cliente / Antirrobo Pro).
export function createAccount(
  input: RegisterInput & { role?: Role; plan?: string },
): { account?: ClientAccount; error?: string } {
  const username = input.username.trim().toLowerCase();
  if (!input.businessName.trim() || !username || !input.password) {
    return { error: "Completá razón social, usuario y contraseña." };
  }
  if (username.length < 3) {
    return { error: "El usuario debe tener al menos 3 caracteres." };
  }
  if (findAccount(username)) {
    return { error: "Ese usuario ya existe. Probá con otro." };
  }

  const account: ClientAccount = {
    username,
    password: input.password,
    role: input.role ?? "client",
    profile: {
      id: `client-${username}`,
      businessName: input.businessName.trim(),
      contactName: input.contactName.trim() || "—",
      phone: input.phone.trim() || "—",
      plan: input.plan ?? "Antirrobo Pro",
    },
    devices: [], // el cliente todavía no tiene dispositivos asignados
  };

  const registered = loadRegisteredAccounts();
  registered.push(account);
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered));
  return { account };
}

// Auto-registro desde la pantalla de login (siempre crea un cliente).
export function registerAccount(input: RegisterInput): { account?: ClientAccount; error?: string } {
  return createAccount(input);
}

// Elimina una cuenta creada por registro. Las cuentas de fábrica (DEMO_ACCOUNTS)
// no se pueden borrar.
export function removeRegisteredAccount(username: string): { error?: string } {
  if (DEMO_ACCOUNTS.some((a) => a.username === username)) {
    return { error: "No se puede eliminar una cuenta de fábrica." };
  }
  const registered = loadRegisteredAccounts().filter((a) => a.username !== username);
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered));
  return {};
}

// True si la cuenta es de fábrica (no editable/eliminable).
export function isFactoryAccount(username: string): boolean {
  return DEMO_ACCOUNTS.some((a) => a.username === username);
}
