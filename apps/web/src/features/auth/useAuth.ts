import { useCallback, useState } from "react";
import { authenticate, findAccount, registerAccount, type ClientAccount, type RegisterInput } from "./accounts.js";

const STORAGE_KEY = "bmt.session";

interface StoredSession {
  username: string;
}

// Rehidrata la sesión desde localStorage al recargar la página. En Fase 1 esto
// guardará el JWT (con expiración) en vez del username, y validará el token.
function loadSession(): ClientAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { username } = JSON.parse(raw) as StoredSession;
    return findAccount(username);
  } catch {
    return null;
  }
}

function persistSession(account: ClientAccount) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: account.username } satisfies StoredSession));
}

export function useAuth() {
  const [account, setAccount] = useState<ClientAccount | null>(() => loadSession());

  // Devuelve un mensaje de error o null si el login fue exitoso.
  const login = useCallback((username: string, password: string): string | null => {
    const acc = authenticate(username, password);
    if (!acc) return "Usuario o contraseña incorrectos.";
    persistSession(acc);
    setAccount(acc);
    return null;
  }, []);

  // Crea la cuenta y deja al cliente ya logueado. Devuelve error o null.
  const register = useCallback((input: RegisterInput): string | null => {
    const { account: acc, error } = registerAccount(input);
    if (error || !acc) return error ?? "No se pudo crear la cuenta.";
    persistSession(acc);
    setAccount(acc);
    return null;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAccount(null);
  }, []);

  return { account, login, register, logout };
}
