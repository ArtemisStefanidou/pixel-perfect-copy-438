import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "student" | "sme" | "hei_admin" | "platform_admin";

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  sme: "Company",
  hei_admin: "University admin",
  platform_admin: "Platform admin",
};

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  institution: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  skills: string[];
  avatar_url: string | null;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  sector: string | null;
  website: string | null;
  description: string | null;
  city: string | null;
  country: string | null;
  status: "pending" | "approved" | "rejected";
  is_mentor: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  roles: Role[];
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    role: "student" | "sme";
    institution?: string;
    companyName?: string;
    sector?: string;
  }) => Promise<{ needsEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function pickPrimaryRole(roles: Role[]): Role | null {
  const order: Role[] = ["platform_admin", "hei_admin", "sme", "student"];
  return order.find((r) => roles.includes(r)) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContext = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setCompany(null);
      setRoles([]);
      return;
    }
    const [profileRes, rolesRes, companyRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("companies").select("*").eq("owner_id", userId).maybeSingle(),
    ]);
    setProfile((profileRes.data as Profile | null) ?? null);
    setRoles(((rolesRes.data ?? []) as { role: Role }[]).map((r) => r.role));
    setCompany((companyRes.data as Company | null) ?? null);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setTimeout(() => {
        void loadContext(nextSession?.user?.id).finally(() => setLoading(false));
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadContext(data.session?.user?.id).finally(() => setLoading(false));
    });

    return () => sub.subscription.unsubscribe();
  }, [loadContext]);

  const refresh = useCallback(async () => {
    await loadContext(session?.user?.id);
  }, [loadContext, session?.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      company,
      roles,
      role: pickPrimaryRole(roles),
      loading,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signUp({ email, password, fullName, role, institution, companyName, sector }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
              role,
              institution: institution ?? null,
              company_name: companyName ?? null,
              sector: sector ?? null,
            },
          },
        });
        if (error) throw error;
        return { needsEmailConfirmation: !data.session };
      },
      async signInWithGoogle() {
        const { lovable } = await import("@/integrations/lovable/index");
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
      },
      async signOut() {
        await supabase.auth.signOut();
        setProfile(null);
        setCompany(null);
        setRoles([]);
      },
      refresh,
    }),
    [session, profile, company, roles, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
