import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — SkillsBox" }] }),
});

function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  }

  return (
    <PageShell>
      <section className="mx-auto flex max-w-md flex-col px-6 py-20">
        <h1 className="font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to manage your profile and applications.</p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary-soft disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            className="w-full rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Continue with Google
          </button>

          <div className="flex justify-end text-sm">
            <Link to="/register" className="font-semibold text-primary">
              Create account
            </Link>
          </div>
        </form>
      </section>
    </PageShell>
  );
}

function Field({
  label, type = "text", value, onChange, required,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
