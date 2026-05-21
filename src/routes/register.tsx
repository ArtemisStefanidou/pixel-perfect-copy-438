import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth, type Role } from "@/lib/auth-context";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Create account — SkillsBox" }] }),
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await register({ name, email, password, role });
    navigate({ to: "/dashboard" });
  }

  return (
    <PageShell>
      <section className="mx-auto flex max-w-xl flex-col px-6 py-20">
        <h1 className="font-display text-3xl font-bold">Join SkillsBox</h1>
        <p className="mt-2 text-muted-foreground">Start in under a minute. Choose your role to continue.</p>

        <form onSubmit={onSubmit} className="mt-10 space-y-6 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">I am a</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["student", "company"] as Role[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-xl border px-4 py-4 text-left transition-all ${
                    role === r
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <p className="font-semibold capitalize">{r === "student" ? "Student" : "Company / SME"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r === "student" ? "Find internships and build your Europass CV." : "Post listings and review applicants."}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Field label={role === "company" ? "Company name" : "Full name"} value={name} onChange={setName} required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary-soft disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
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
