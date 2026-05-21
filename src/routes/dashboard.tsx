import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth-context";
import { LISTINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — SkillsBox" }] }),
});

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      // Auth check after hydration
      const t = setTimeout(() => {
        if (!localStorage.getItem("skillsbox.session")) navigate({ to: "/login" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  const recommended = LISTINGS.slice(0, 4);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
            <h1 className="font-display text-3xl font-bold">{user?.name ?? "Student"}</h1>
          </div>
          <Link
            to="/cv-builder"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-soft"
          >
            Continue CV Builder →
          </Link>
        </div>

        {/* KPI row */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Kpi label="Profile completion" value="65%" hint="3 sections to finish" progress={65} />
          <Kpi label="Active applications" value="2" hint="1 pending review" />
          <Kpi label="Recommended for you" value={`${recommended.length}`} hint="Matched by skills" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Recommended */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Recommended internships</h2>
              <Link to="/listings" className="text-sm font-semibold text-primary">View all →</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {recommended.map((l) => (
                <Link
                  key={l.id}
                  to="/listings/$id"
                  params={{ id: l.id }}
                  className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid size-10 place-items-center rounded-lg border border-border bg-background text-lg">
                      {l.emoji}
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      92% match
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold group-hover:text-primary">{l.title}</h3>
                  <p className="text-xs text-muted-foreground">{l.company} • {l.city}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Profile readiness */}
          <aside className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">Profile readiness</h2>
            <p className="mt-1 text-sm text-muted-foreground">Complete your Europass to unlock better matches.</p>
            <div className="mt-6 space-y-3">
              {[
                { t: "Personal Info", done: true },
                { t: "Education", done: true },
                { t: "Work Experience", done: false },
                { t: "Skills", done: true },
                { t: "Languages", done: false },
                { t: "Certifications", done: false },
              ].map((s) => (
                <div key={s.t} className="flex items-center justify-between text-sm">
                  <span className={s.done ? "" : "text-muted-foreground"}>{s.t}</span>
                  <span className={s.done ? "text-success font-semibold" : "text-muted-foreground"}>
                    {s.done ? "✓ Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/cv-builder"
              className="mt-6 block rounded-xl border border-border bg-background py-3 text-center text-sm font-semibold hover:bg-secondary"
            >
              Open CV Builder
            </Link>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

function Kpi({ label, value, hint, progress }: { label: string; value: string; hint: string; progress?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {progress !== undefined && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
