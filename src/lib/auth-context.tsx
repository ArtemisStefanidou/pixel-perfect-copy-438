import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "sme" | "admin";

export interface SessionUser {
  email: string;
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<SessionUser>;
  register: (data: { email: string; password: string; name: string; role: Role }) => Promise<SessionUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "skillsbox.session";

const USERS: Record<string, { password: string; name: string; role: Role }> = {
  "arben@example.com":  { password: "12345678", name: "Arben",  role: "student" },
  "sme@example.com":    { password: "12345678", name: "SME",    role: "sme" },
  "admin@example.com":  { password: "12345678", name: "Admin",  role: "admin" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (u: SessionUser | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const value: AuthContextValue = {
    user,
    async login(email, password) {
      const account = USERS[email.toLowerCase()];
      if (!account || account.password !== password) {
        throw new Error("Invalid email or password");
      }
      const u: SessionUser = { email, name: account.name, role: account.role };
      persist(u);
      return u;
    },
    async register({ email, name, role }) {
      const u: SessionUser = { email, name, role };
      persist(u);
      return u;
    },
    logout() {
      persist(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
