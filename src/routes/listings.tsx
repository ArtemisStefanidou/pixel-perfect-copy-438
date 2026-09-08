import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth-context";
import { COUNTRIES, SECTORS, WORK_MODES, fetchListings, type ListingRow } from "@/lib/listings-db";

export const Route = createFileRoute("/listings")({
  component: ListingsPage,
  head: () => ({
    meta: [
      { title: "Internships & Listings — SkillsBox" },
      { name: "description", content: "Browse internships and SME opportunities across the Western Balkans." },
      { property: "og:title", content: "Internships & Listings — SkillsBox" },
      { property: "og:description", content: "Browse internships and SME opportunities across the Western Balkans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ListingsPage() {
  const { user, loading } = useAuth();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [sector, setSector] = useState("");
  const [mode, setMode] = useState("");
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setBusy(false);
      return;
    }
    let alive = true;
    setBusy(true);
    fetchListings()
      .then((d) => alive && setRows(d))
      .catch((e) => alive && setError(e.message ?? "Could not load listings"))
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [user, loading]);

  const results = useMemo(
    () =>
      rows.filter((l) => {
        const hay = `${l.title} ${l.companies?.name ?? ""} ${l.required_skills.join(" ")}`.toLowerCase();
        if (q && !hay.includes(q.toLowerCase())) return false;
        if (country && l.country !== country) return false;
        if (sector && l.sector !== sector) return false;
        if (mode && l.work_mode !== mode) return false;
        return true;
      }),
    [rows, q, country, sector, mode],
  );

  if (!loading && !user) {
    return (
      <PageShell>
        <section className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="font-display text-3xl font-bold">Sign in to browse opportunities</h1>
          <p className="mt-3 text-muted-foreground">
            Listings from verified companies are visible to registered members.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold">
              Sign in
            </Link>
            <Link to="/register" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Create account
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Explore Internships</h1>
            <p className="mt-2 text-muted-foreground">
              {busy ? "Loading opportunities…" : `${results.length} positions across the Western Balkans 6`}
            </p>
          </div>
          <input
            type="search"
            placeholder="Search role, company, skill..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 md:w-80"
          />
        </div>

        {error && <p className="mt-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6 rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24 lg:self-start">
            <FilterGroup label="Country" value={country} onChange={setCountry} options={COUNTRIES} />
            <FilterGroup label="Sector" value={sector} onChange={setSector} options={SECTORS} />
            <FilterGroup label="Work mode" value={mode} onChange={setMode} options={WORK_MODES} />
            <button
              onClick={() => {
                setCountry("");
                setSector("");
                setMode("");
                setQ("");
              }}
              className="w-full rounded-lg border border-border bg-background py-2 text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              Clear filters
            </button>
          </aside>

          <div className="grid gap-6 md:grid-cols-2">
            {results.map((l) => (
              <Card key={l.id} l={l} />
            ))}
            {!busy && results.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted-foreground">
                No listings match your filters yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="space-y-1">
        <button
          onClick={() => onChange("")}
          className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
            value === "" ? "bg-primary/10 font-semibold text-primary" : "hover:bg-secondary"
          }`}
        >
          All
        </button>
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
              value === o ? "bg-primary/10 font-semibold text-primary" : "hover:bg-secondary"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Card({ l }: { l: ListingRow }) {
  const days = Math.max(0, Math.round((Date.now() - new Date(l.created_at).getTime()) / 86400000));
  return (
    <Link
      to="/listings/$id"
      params={{ id: l.id }}
      className="group rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="grid size-12 place-items-center rounded-xl border border-border bg-background text-sm font-bold">
          {(l.companies?.name ?? "?").slice(0, 2).toUpperCase()}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
            l.status === "active" ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
          }`}
        >
          {l.status}
        </span>
      </div>
      <h3 className="text-lg font-bold group-hover:text-primary">{l.title}</h3>
      <p className="text-sm font-medium text-muted-foreground">
        {l.companies?.name ?? "Company"} • {[l.city, l.country].filter(Boolean).join(", ")}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold">{l.work_mode}</span>
        {l.duration && <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold">{l.duration}</span>}
        {l.sector && <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold">{l.sector}</span>}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="text-xs font-medium text-muted-foreground">Posted {days}d ago</span>
        <span className="text-sm font-bold text-primary">View →</span>
      </div>
    </Link>
  );
}
