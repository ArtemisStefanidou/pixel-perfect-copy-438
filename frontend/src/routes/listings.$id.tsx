import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth-context";
import {
  applyToListing,
  fetchApplicationForListing,
  fetchListing,
  statusTone,
  type ApplicationRow,
  type ListingRow,
} from "@/lib/api-client";

export const Route = createFileRoute("/listings/$id")({
  component: ListingDetail,
  head: () => ({
    meta: [
      { title: "Opportunity — SkillsBox" },
      { name: "description", content: "Role details and application for a SkillsBox opportunity." },
      { property: "og:title", content: "Opportunity — SkillsBox" },
      { property: "og:description", content: "Role details and application for a SkillsBox opportunity." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ListingDetail() {
  const { id } = Route.useParams();
  const { user, role, loading } = useAuth();
  const [listing, setListing] = useState<ListingRow | null>(null);
  const [application, setApplication] = useState<ApplicationRow | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    let alive = true;
    setBusy(true);
    (async () => {
      try {
        const l = await fetchListing(id);
        if (!alive) return;
        setListing(l);
        if (user && role === "student") {
          const a = await fetchApplicationForListing(id, user.id);
          if (alive) setApplication(a);
        }
      } catch (e) {
        if (alive) setError((e as Error).message);
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, user, role, loading]);

  async function apply() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await applyToListing(id, user.id, note.trim());
      setApplication(await fetchApplicationForListing(id, user.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (busy) {
    return (
      <PageShell>
        <div className="mx-auto max-w-5xl px-6 py-32 text-muted-foreground">Loading…</div>
      </PageShell>
    );
  }

  if (!listing) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="font-display text-3xl font-bold">Listing not found</h1>
          <Link to="/listings" className="mt-4 inline-block text-primary">
            ← Back to listings
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/listings" className="text-sm text-muted-foreground hover:text-primary">
          ← All listings
        </Link>

        <div className="mt-6 rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="grid size-16 place-items-center rounded-2xl border border-border bg-background text-lg font-bold">
                {(listing.companies?.name ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">{listing.title}</h1>
                <p className="mt-1 text-muted-foreground">
                  {listing.companies?.name ?? "Company"} • {[listing.city, listing.country].filter(Boolean).join(", ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag>{listing.listing_type}</Tag>
                  <Tag>{listing.work_mode}</Tag>
                  {listing.duration && <Tag>{listing.duration}</Tag>}
                  {listing.sector && <Tag>{listing.sector}</Tag>}
                  {listing.deadline && <Tag>Deadline {listing.deadline}</Tag>}
                </div>
              </div>
            </div>

            <div className="min-w-[220px]">
              {!user && (
                <Link
                  to="/login"
                  className="block rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Sign in to apply
                </Link>
              )}
              {user && role === "student" && (
                application ? (
                  <div className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${statusTone(application.status)}`}>
                    Application {application.status}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Short cover note (optional)"
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={apply}
                      disabled={submitting || listing.status !== "active"}
                      className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary-soft disabled:opacity-60"
                    >
                      {listing.status !== "active" ? "Closed" : submitting ? "Submitting…" : "Apply now"}
                    </button>
                  </div>
                )
              )}
              {user && role !== "student" && (
                <p className="rounded-xl border border-border bg-background px-4 py-3 text-center text-xs text-muted-foreground">
                  Only student accounts can apply.
                </p>
              )}
            </div>
          </div>

          {error && <p className="mt-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}

          <hr className="my-8 border-border" />

          <h2 className="font-display text-xl font-bold">About the role</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{listing.description}</p>

          {listing.required_skills.length > 0 && (
            <>
              <h2 className="mt-8 font-display text-xl font-bold">Required skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.required_skills.map((s) => (
                  <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold">{children}</span>;
}
