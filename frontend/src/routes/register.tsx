import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth-context";
import { SECTORS } from "@/lib/api-client";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Create account — SkillsBox" }] }),
});

type SignupRole = "student" | "sme";

const ROLE_META: Record<SignupRole, { label: string; hint: string }> = {
  student: { label: "Student", hint: "Find internships, build your Europass CV, earn badges." },
  sme: { label: "Company / SME", hint: "Post listings and review applicants (needs approval)." },
};

function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<SignupRole>("student");
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { needsEmailConfirmation } = await signUp({
        email,
        password,
        fullName,
        role,
        institution: institution || undefined,
        companyName: companyName || undefined,
        sector: sector || undefined,
      });
      if (needsEmailConfirmation) setSent(true);
      else navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <PageShell>
        <section className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Check your inbox</h1>
          <p className="mt-3 text-muted-foreground">
            We sent a verification link to <strong>{email}</strong>. Confirm your email to activate your account.
            {role === "sme" && " Company accounts are then reviewed by a platform administrator before you can post listings."}
          </p>
          <Link to="/login" className="mt-6 inline-block font-semibold text-primary">Back to sign in</Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto flex max-w-xl flex-col px-6 py-20">
        <h1 className="font-display text-3xl font-bold">Join SkillsBox</h1>
        <p className="mt-2 text-muted-foreground">Choose your role to continue. University and platform administrator access is granted by a platform admin.</p>

        <form onSubmit={onSubmit} className="mt-10 space-y-6 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">I am a</label>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {(Object.keys(ROLE_META) as SignupRole[]).map((r) => (
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
                  <p className="font-semibold">{ROLE_META[r].label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{ROLE_META[r].hint}</p>
                </button>
              ))}
            </div>
          </div>

          <Field label="Full name" value={fullName} onChange={setFullName} required />
          {role === "student" ? (
            <Field label="Institution" value={institution} onChange={setInstitution} />
          ) : (
            <>
              <Field label="Company name" value={companyName} onChange={setCompanyName} required />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select a sector</option>
                  {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary-soft disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">Sign in</Link>
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
