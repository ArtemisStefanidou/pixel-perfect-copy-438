import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { LISTINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/listings/$id")({
  component: ListingDetail,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Listing not found</h1>
        <Link to="/listings" className="mt-4 inline-block text-primary">← Back to listings</Link>
      </div>
    </PageShell>
  ),
  loader: ({ params }) => {
    const listing = LISTINGS.find((l) => l.id === params.id);
    if (!listing) throw notFound();
    return { listing };
  },
});

const APP_KEY = "skillsbox.applications";

function ListingDetail() {
  const { listing } = Route.useLoaderData();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);

  function apply() {
    try {
      const raw = localStorage.getItem(APP_KEY);
      const arr: { listingId: string; date: string; status: string }[] = raw ? JSON.parse(raw) : [];
      if (!arr.find((a) => a.listingId === listing.id)) {
        arr.push({ listingId: listing.id, date: new Date().toISOString(), status: "pending" });
        localStorage.setItem(APP_KEY, JSON.stringify(arr));
      }
      setApplied(true);
      setTimeout(() => navigate({ to: "/applications" }), 600);
    } catch {/* ignore */}
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/listings" className="text-sm text-muted-foreground hover:text-primary">← All listings</Link>

        <div className="mt-6 rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="grid size-16 place-items-center rounded-2xl border border-border bg-background text-3xl">
                {listing.emoji}
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">{listing.title}</h1>
                <p className="mt-1 text-muted-foreground">
                  {listing.company} • {listing.city}, {listing.country}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag>{listing.type}</Tag>
                  <Tag>{listing.remote}</Tag>
                  <Tag>{listing.duration}</Tag>
                  <Tag>{listing.sector}</Tag>
                </div>
              </div>
            </div>
            <button
              onClick={apply}
              disabled={applied}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary-soft disabled:bg-success disabled:shadow-success/20"
            >
              {applied ? "✓ Application submitted" : "Apply now"}
            </button>
          </div>

          <hr className="my-8 border-border" />

          <h2 className="font-display text-xl font-bold">About the role</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{listing.description}</p>

          <h2 className="mt-8 font-display text-xl font-bold">Requirements</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            {listing.requirements.map((r) => <li key={r}>{r}</li>)}
          </ul>

          <h2 className="mt-8 font-display text-xl font-bold">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.skills.map((s) => (
              <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{s}</span>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold">{children}</span>;
}
