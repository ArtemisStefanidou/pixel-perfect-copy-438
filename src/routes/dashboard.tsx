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
      const t = setTimeout(() => {
        if (!localStorage.getItem("skillsbox.session")) navigate({ to: "/login" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  if (!user) return <PageShell><div className="mx-auto max-w-7xl px-6 py-20 text-muted-foreground">Loading…</div></PageShell>;

  if (user.role === "sme") return <SmeDashboard name={user.name} />;
  if (user.role === "admin") return <AdminDashboard name={user.name} />;
  return <StudentDashboard name={user.name} />;
}

/* -------- Student -------- */
function StudentDashboard({ name }: { name: string }) {
  const recommended = LISTINGS.slice(0, 4);
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Header eyebrow="Welcome back" title={name} cta={{ to: "/cv-builder", label: "Continue CV Builder →" }} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Kpi label="Profile completion" value="65%" hint="3 sections to finish" progress={65} />
          <Kpi label="Active applications" value="2" hint="1 pending review" />
          <Kpi label="Recommended for you" value={`${recommended.length}`} hint="Matched by skills" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
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
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">92% match</span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold group-hover:text-primary">{l.title}</h3>
                  <p className="text-xs text-muted-foreground">{l.company} • {l.city}</p>
                </Link>
              ))}
            </div>
          </div>

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
            <Link to="/cv-builder" className="mt-6 block rounded-xl border border-border bg-background py-3 text-center text-sm font-semibold hover:bg-secondary">
              Open CV Builder
            </Link>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

/* -------- SME -------- */
function SmeDashboard({ name }: { name: string }) {
  const myListings = LISTINGS.slice(0, 3);
  const candidates = [
    { name: "Maria K.", role: "Junior UI/UX Designer", match: 94, status: "New" },
    { name: "Andrej P.", role: "Junior Frontend Developer", match: 91, status: "Shortlisted" },
    { name: "Elira H.", role: "Sustainability Analyst", match: 87, status: "Interview" },
    { name: "Luka V.", role: "Market Research Intern", match: 82, status: "New" },
  ];
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Header eyebrow="Company workspace" title={name} cta={{ to: "/listings", label: "+ Post new listing" }} />

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Kpi label="Active listings" value={`${myListings.length}`} hint="2 closing this month" />
          <Kpi label="Applicants" value="48" hint="12 new this week" />
          <Kpi label="Shortlisted" value="9" hint="3 awaiting interview" />
          <Kpi label="Avg. match score" value="86%" hint="Across all roles" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Your listings</h2>
              <Link to="/listings" className="text-sm font-semibold text-primary">Manage →</Link>
            </div>
            <div className="divide-y divide-border">
              {myListings.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-lg border border-border bg-background text-lg">{l.emoji}</div>
                    <div>
                      <p className="text-sm font-bold">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l.city} • {l.type} • {l.remote}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">{(Math.random() * 20 + 5) | 0} applicants</span>
                    <Link to="/listings/$id" params={{ id: l.id }} className="font-semibold text-primary">View</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">Top candidates</h2>
            <p className="mt-1 text-sm text-muted-foreground">AI-ranked by skill match.</p>
            <ul className="mt-5 space-y-4">
              {candidates.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{c.match}%</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

/* -------- Admin -------- */
function AdminDashboard({ name }: { name: string }) {
  const stats = [
    { label: "Total users", value: "12,487", hint: "+312 this week" },
    { label: "Verified SMEs", value: "846", hint: "27 pending approval" },
    { label: "Active listings", value: `${LISTINGS.length * 38}`, hint: "92% fill rate" },
    { label: "Platform uptime", value: "99.98%", hint: "Last 30 days" },
  ];
  const pending = [
    { name: "Adriatic Studios", country: "Albania", type: "SME verification" },
    { name: "OpenBalkan EdTech", country: "North Macedonia", type: "SME verification" },
    { name: "Civic Lab", country: "Kosovo", type: "Listing review" },
    { name: "GreenGrowth NGO", country: "Bosnia and Herzegovina", type: "Listing edit" },
  ];
  const distribution = [
    { country: "Serbia", pct: 28 },
    { country: "Albania", pct: 22 },
    { country: "North Macedonia", pct: 17 },
    { country: "Bosnia and Herzegovina", pct: 14 },
    { country: "Kosovo", pct: 11 },
    { country: "Montenegro", pct: 8 },
  ];
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Header eyebrow="Administrator" title={name} cta={{ to: "/listings", label: "Browse platform →" }} />

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {stats.map((s) => <Kpi key={s.label} {...s} />)}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold">Pending moderation</h2>
            <p className="mt-1 text-sm text-muted-foreground">Approve or reject incoming changes.</p>
            <div className="mt-5 divide-y divide-border">
              {pending.map((p) => (
                <div key={p.name} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.country} • {p.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Reject</button>
                    <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-soft">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">User distribution</h2>
            <p className="mt-1 text-sm text-muted-foreground">By country, last 30 days.</p>
            <ul className="mt-5 space-y-3">
              {distribution.map((d) => (
                <li key={d.country}>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{d.country}</span>
                    <span className="text-muted-foreground">{d.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${d.pct * 3}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

/* -------- Shared -------- */
function Header({ eyebrow, title, cta }: { eyebrow: string; title: string; cta: { to: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
      </div>
      <Link to={cta.to} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-soft">
        {cta.label}
      </Link>
    </div>
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
