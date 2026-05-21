import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { LISTINGS, type Listing } from "@/lib/mock-data";

export const Route = createFileRoute("/applications")({
  component: ApplicationsPage,
  head: () => ({ meta: [{ title: "My applications — SkillsBox" }] }),
});

interface AppRecord {
  listingId: string;
  date: string;
  status: "pending" | "accepted" | "rejected";
}

function ApplicationsPage() {
  const [apps, setApps] = useState<AppRecord[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("skillsbox.applications");
      if (raw) setApps(JSON.parse(raw));
    } catch {/* ignore */}
  }, []);

  const enriched = apps
    .map((a) => ({ app: a, listing: LISTINGS.find((l) => l.id === a.listingId) }))
    .filter((x): x is { app: AppRecord; listing: Listing } => !!x.listing);

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold">My applications</h1>
        <p className="mt-2 text-muted-foreground">Track the status of every listing you've applied to.</p>

        <div className="mt-8 space-y-3">
          {enriched.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <p className="text-muted-foreground">You haven't applied to any listings yet.</p>
              <Link to="/listings" className="mt-3 inline-block font-semibold text-primary">Browse listings →</Link>
            </div>
          )}

          {enriched.map(({ app, listing }) => (
            <Link
              key={listing.id}
              to="/listings/$id"
              params={{ id: listing.id }}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary"
            >
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-xl border border-border bg-background text-xl">{listing.emoji}</div>
                <div>
                  <p className="font-bold">{listing.title}</p>
                  <p className="text-sm text-muted-foreground">{listing.company} • {listing.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{new Date(app.date).toLocaleDateString()}</span>
                <StatusBadge status={app.status} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function StatusBadge({ status }: { status: AppRecord["status"] }) {
  const map = {
    pending: "bg-warning/10 text-warning",
    accepted: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${map[status]}`}>
      {status}
    </span>
  );
}
