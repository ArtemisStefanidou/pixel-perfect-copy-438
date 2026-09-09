import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth, type Profile, type Company } from "@/lib/auth-context";
import { MODULES, useEarnedBadges } from "@/lib/mock-data";
import {
  fetchListings,
  fetchMyListings,
  fetchMyApplications,
  fetchApplicationsForOwner,
  statusTone,
  fetchCompanies,
  setCompanyStatus,
  updateMyInstitution,
  fetchPlatformStats,
  fetchInstitutionStats,
  grantRole,
  type ListingRow,
  type ApplicationRow,
  type CompanyRow,
  type PlatformStats,
  type InstitutionStats,
} from "@/lib/api-client";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — SkillsBox" }] }),
});

function Dashboard() {
  const { user, profile, company, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user || !profile) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl px-6 py-20 text-muted-foreground">Loading…</div>
      </PageShell>
    );
  }

  if (role === "sme") return <SmeDashboard userId={user.id} profile={profile} company={company} />;
  if (role === "platform_admin")
    return <PlatformAdminDashboard name={profile.full_name || "Admin"} />;
  if (role === "hei_admin") return <HeiAdminDashboard userId={user.id} profile={profile} />;
  return <StudentDashboard userId={user.id} profile={profile} />;
}

/* -------- Student -------- */
function StudentDashboard({ userId, profile }: { userId: string; profile: Profile }) {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [busy, setBusy] = useState(true);
  const badges = useEarnedBadges();
  const earnedIds = new Set(badges.map((b) => b.moduleId));

  useEffect(() => {
    let alive = true;
    Promise.all([fetchListings(), fetchMyApplications(userId)])
      .then(([l, a]) => {
        if (!alive) return;
        setListings(l);
        setApplications(a);
      })
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [userId]);

  const recommended = rankBySkillMatch(listings, profile.skills).slice(0, 4);
  const pending = applications.filter(
    (a) => a.status === "submitted" || a.status === "reviewed",
  ).length;

  const readiness = [
    { t: "Full name", done: !!profile.full_name },
    { t: "Headline", done: !!profile.headline },
    { t: "About / bio", done: !!profile.bio },
    { t: "Skills", done: profile.skills.length > 0 },
    { t: "Location", done: !!profile.city && !!profile.country },
    { t: "Institution", done: !!profile.institution },
  ];
  const completion = Math.round((readiness.filter((r) => r.done).length / readiness.length) * 100);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Header
          eyebrow="Welcome back"
          title={profile.full_name || "Student"}
          cta={{ to: "/cv-builder", label: "Continue CV Builder →" }}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Kpi
            label="Profile completion"
            value={`${completion}%`}
            hint="Keep your profile up to date"
            progress={completion}
          />
          <Kpi
            label="Active applications"
            value={`${applications.length}`}
            hint={pending ? `${pending} pending review` : "No pending reviews"}
          />
          <Kpi
            label="Recommended for you"
            value={busy ? "…" : `${recommended.length}`}
            hint="Matched by skills"
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Recommended internships</h2>
              <Link to="/listings" className="text-sm font-semibold text-primary">
                View all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {busy && <p className="text-sm text-muted-foreground">Loading…</p>}
              {!busy && recommended.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">
                  No active listings yet — check back soon.
                </p>
              )}
              {recommended.map((l) => (
                <Link
                  key={l.id}
                  to="/listings/$id"
                  params={{ id: l.id }}
                  className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid size-10 place-items-center rounded-lg border border-border bg-background text-sm font-bold">
                      {(l.companies?.name ?? "?").slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <h3 className="mt-4 text-sm font-bold group-hover:text-primary">{l.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {l.companies?.name ?? "Company"} • {l.city}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">Profile readiness</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your profile to unlock better matches.
            </p>
            <div className="mt-6 space-y-3">
              {readiness.map((s) => (
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

        {/* Badges */}
        <div className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Your skill badges</h2>
              <p className="text-sm text-muted-foreground">
                {badges.length} of {MODULES.length} earned — complete a module to unlock a
                certificate.
              </p>
            </div>
            <Link to="/learn" className="text-sm font-semibold text-primary">
              Open Academy →
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MODULES.map((m) => {
              const earned = earnedIds.has(m.id);
              return (
                <Link
                  key={m.id}
                  to="/learn/$id"
                  params={{ id: m.id }}
                  className={`group rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    earned ? "border-success/40 bg-success/5" : "border-border bg-surface"
                  }`}
                >
                  <div
                    className="mx-auto grid size-12 place-items-center rounded-full text-xl"
                    style={{
                      background: earned ? m.badgeColor : `${m.badgeColor}1A`,
                      color: earned ? "#fff" : m.badgeColor,
                    }}
                  >
                    {m.emoji}
                  </div>
                  <p className="mt-3 text-xs font-bold">{m.badgeName}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {earned ? "Earned" : "Locked"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function rankBySkillMatch(listings: ListingRow[], skills: string[]) {
  const active = listings.filter((l) => l.status === "active");
  const skillSet = new Set(skills.map((s) => s.toLowerCase()));
  if (skillSet.size === 0) return active;
  return [...active].sort((a, b) => {
    const scoreA = a.required_skills.filter((s) => skillSet.has(s.toLowerCase())).length;
    const scoreB = b.required_skills.filter((s) => skillSet.has(s.toLowerCase())).length;
    return scoreB - scoreA;
  });
}

/* -------- SME -------- */
function SmeDashboard({
  userId,
  profile,
  company,
}: {
  userId: string;
  profile: Profile;
  company: Company | null;
}) {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchMyListings(userId), fetchApplicationsForOwner(userId)])
      .then(([l, a]) => {
        if (!alive) return;
        setListings(l);
        setApplications(a);
      })
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [userId]);

  const activeListings = listings.filter((l) => l.status === "active");
  const shortlisted = applications.filter(
    (a) => a.status === "interview" || a.status === "accepted",
  ).length;
  const newThisWeek = applications.filter(
    (a) => Date.now() - new Date(a.created_at).getTime() < 7 * 86400000,
  ).length;

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Header
          eyebrow="Company workspace"
          title={company?.name || profile.full_name}
          cta={{ to: "/sme/new-listing", label: "+ Post new listing" }}
        />

        {company && company.status !== "approved" && (
          <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
            {company.status === "pending"
              ? "Your company is awaiting platform admin approval. You'll be able to publish listings once approved."
              : "Your company application was not approved. Contact the platform admin for details."}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Kpi
            label="Active listings"
            value={`${activeListings.length}`}
            hint={`${listings.length} total`}
          />
          <Kpi
            label="Applicants"
            value={`${applications.length}`}
            hint={`${newThisWeek} new this week`}
          />
          <Kpi label="Shortlisted" value={`${shortlisted}`} hint="Interview or accepted" />
          <Kpi
            label="Mentor status"
            value={company?.is_mentor ? "Active" : "Not set"}
            hint="Set by platform admin"
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Your listings</h2>
              <Link to="/listings" className="text-sm font-semibold text-primary">
                Manage →
              </Link>
            </div>
            {busy && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!busy && listings.length === 0 && (
              <p className="text-sm text-muted-foreground">You haven't posted any listings yet.</p>
            )}
            <div className="divide-y divide-border">
              {listings.slice(0, 5).map((l) => {
                const count = applications.filter((a) => a.listing_id === l.id).length;
                return (
                  <div key={l.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-bold">{l.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.city} • {l.listing_type} • {l.work_mode}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">
                        {count} applicants
                      </span>
                      <Link
                        to="/listings/$id"
                        params={{ id: l.id }}
                        className="font-semibold text-primary"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">Recent applicants</h2>
            <p className="mt-1 text-sm text-muted-foreground">Across all your listings.</p>
            <ul className="mt-5 space-y-4">
              {applications.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{a.profiles?.full_name ?? "Student"}</p>
                    <p className="text-xs font-medium text-primary/80">{a.listings?.title ?? ""}</p>
                    <p className="text-xs text-muted-foreground">{a.profiles?.institution ?? ""}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusTone(a.status)}`}
                  >
                    {a.status}
                  </span>
                </li>
              ))}
              {!busy && applications.length === 0 && (
                <p className="text-sm text-muted-foreground">No applicants yet.</p>
              )}
            </ul>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

/* -------- HEI Admin -------- */
function HeiAdminDashboard({ userId, profile }: { userId: string; profile: Profile }) {
  const [institution, setInstitution] = useState(profile.institution ?? "");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile.institution) return;
    let alive = true;
    setBusy(true);
    fetchInstitutionStats(profile.institution)
      .then((s) => alive && setStats(s))
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [profile.institution]);

  async function saveInstitution(e: React.FormEvent) {
    e.preventDefault();
    if (!institution.trim()) return;
    setSaving(true);
    try {
      await updateMyInstitution(userId, institution.trim());
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  if (!profile.institution) {
    return (
      <PageShell>
        <section className="mx-auto max-w-xl px-6 py-24">
          <h1 className="font-display text-3xl font-bold">Set your institution</h1>
          <p className="mt-3 text-muted-foreground">
            Reports are scoped to the institution you manage. Enter its exact name — it must match
            the value students use when they register.
          </p>
          <form onSubmit={saveInstitution} className="mt-8 flex gap-3">
            <input
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. University of Tirana"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={saving}
              className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </section>
      </PageShell>
    );
  }

  const breakdown = stats?.statusBreakdown;

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Header
          eyebrow="University admin"
          title={profile.institution}
          cta={{ to: "/listings", label: "Browse listings →" }}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Kpi
            label="Students"
            value={busy ? "…" : `${stats?.studentCount ?? 0}`}
            hint="Registered with this institution"
          />
          <Kpi
            label="Applications submitted"
            value={busy ? "…" : `${stats?.applicationCount ?? 0}`}
            hint="By your students"
          />
          <Kpi
            label="Accepted"
            value={busy ? "…" : `${breakdown?.accepted ?? 0}`}
            hint="Successful placements"
          />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold">Application status breakdown</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Across all applications from your students.
          </p>
          <ul className="mt-5 space-y-3">
            {(["submitted", "reviewed", "interview", "accepted", "rejected"] as const).map((k) => {
              const v = breakdown?.[k] ?? 0;
              const total = stats?.applicationCount || 1;
              const pct = Math.round((v / total) * 100);
              return (
                <li key={k}>
                  <div className="flex items-center justify-between text-xs font-semibold capitalize">
                    <span>{k}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}

/* -------- Platform Admin -------- */
function PlatformAdminDashboard({ name }: { name: string }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    const [s, c] = await Promise.all([fetchPlatformStats(), fetchCompanies()]);
    setStats(s);
    setCompanies(c);
    setBusy(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function act(id: string, status: "approved" | "rejected") {
    setActingId(id);
    try {
      await setCompanyStatus(id, status);
      await load();
    } finally {
      setActingId(null);
    }
  }

  const pending = companies.filter((c) => c.status === "pending");

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Header
          eyebrow="Platform admin"
          title={name}
          cta={{ to: "/listings", label: "Browse platform →" }}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Kpi
            label="Total users"
            value={busy ? "…" : `${stats?.totalUsers ?? 0}`}
            hint={`${stats?.totalStudents ?? 0} students`}
          />
          <Kpi
            label="Companies"
            value={busy ? "…" : `${stats?.totalCompanies ?? 0}`}
            hint={`${stats?.pendingCompanies ?? 0} pending approval`}
          />
          <Kpi
            label="Listings"
            value={busy ? "…" : `${stats?.totalListings ?? 0}`}
            hint={`${stats?.activeListings ?? 0} active`}
          />
          <Kpi
            label="Applications"
            value={busy ? "…" : `${stats?.totalApplications ?? 0}`}
            hint="Platform-wide"
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold">Pending company approvals</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review new SME accounts before their listings go live.
            </p>
            <div className="mt-5 divide-y divide-border">
              {!busy && pending.length === 0 && (
                <p className="py-6 text-sm text-muted-foreground">
                  No pending companies right now.
                </p>
              )}
              {pending.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-bold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[c.city, c.country].filter(Boolean).join(", ")}{" "}
                      {c.sector ? `• ${c.sector}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={actingId === c.id}
                      onClick={() => act(c.id, "rejected")}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      disabled={actingId === c.id}
                      onClick={() => act(c.id, "approved")}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-60"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <RoleGrantCard />
        </div>
      </section>
    </PageShell>
  );
}

function RoleGrantCard() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"hei_admin" | "platform_admin">("hei_admin");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const p = await grantRole(email, role);
      setMessage({
        kind: "ok",
        text: `Granted ${role.replace("_", " ")} to ${p.full_name || email}.`,
      });
      setEmail("");
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Could not grant role.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold">Assign a role</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Grant university admin or platform admin access to an existing account.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <input
          type="email"
          required
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "hei_admin" | "platform_admin")}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="hei_admin">HEI admin</option>
          <option value="platform_admin">Platform admin</option>
        </select>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-60"
        >
          {saving ? "Granting…" : "Grant role"}
        </button>
        {message && (
          <p
            className={`text-xs font-medium ${message.kind === "ok" ? "text-success" : "text-destructive"}`}
          >
            {message.text}
          </p>
        )}
      </form>
    </aside>
  );
}

/* -------- Shared -------- */
function Header({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string;
  title: string;
  cta: { to: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
      </div>
      <Link
        to={cta.to}
        className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-soft"
      >
        {cta.label}
      </Link>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  progress,
}: {
  label: string;
  value: string;
  hint: string;
  progress?: number;
}) {
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
