import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { LISTINGS, COUNTRIES, SECTORS, type Listing } from "@/lib/mock-data";

export const Route = createFileRoute("/listings")({
  component: ListingsPage,
  head: () => ({
    meta: [
      { title: "Internships & Listings — SkillsBox" },
      { name: "description", content: "Browse internships and SME opportunities across the Western Balkans." },
    ],
  }),
});

function ListingsPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [remote, setRemote] = useState<string>("");

  const results = useMemo(() => {
    return LISTINGS.filter((l) => {
      if (q && !`${l.title} ${l.company} ${l.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (country && l.country !== country) return false;
      if (sector && l.sector !== sector) return false;
      if (remote && l.remote !== remote) return false;
      return true;
    });
  }, [q, country, sector, remote]);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Explore Internships</h1>
            <p className="mt-2 text-muted-foreground">{results.length} positions across the Western Balkans 6</p>
          </div>
          <input
            type="search"
            placeholder="Search role, company, skill..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 md:w-80"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Filters */}
          <aside className="space-y-6 rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24 lg:self-start">
            <FilterGroup label="Country" value={country} onChange={setCountry} options={COUNTRIES} />
            <FilterGroup label="Sector" value={sector} onChange={setSector} options={SECTORS} />
            <FilterGroup label="Work mode" value={remote} onChange={setRemote} options={["Remote", "On-site", "Hybrid"]} />
            <button
              onClick={() => { setCountry(""); setSector(""); setRemote(""); setQ(""); }}
              className="w-full rounded-lg border border-border bg-background py-2 text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              Clear filters
            </button>
          </aside>

          {/* Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((l) => (
              <Card key={l.id} l={l} />
            ))}
            {results.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted-foreground">
                No listings match your filters.
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function FilterGroup({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
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

function Card({ l }: { l: Listing }) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: l.id }}
      className="group rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="grid size-12 place-items-center rounded-xl border border-border bg-background text-xl">{l.emoji}</div>
        {l.closingSoon ? (
          <span className="rounded-full bg-warning/10 px-3 py-1 text-[10px] font-bold uppercase text-warning">Closing Soon</span>
        ) : (
          <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold uppercase text-success">Active</span>
        )}
      </div>
      <h3 className="text-lg font-bold group-hover:text-primary">{l.title}</h3>
      <p className="text-sm font-medium text-muted-foreground">{l.company} • {l.city}, {l.country}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold">{l.remote}</span>
        <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold">{l.duration}</span>
        <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold">{l.sector}</span>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="text-xs font-medium text-muted-foreground">Posted {l.postedDaysAgo}d ago</span>
        <span className="text-sm font-bold text-primary">View →</span>
      </div>
    </Link>
  );
}
