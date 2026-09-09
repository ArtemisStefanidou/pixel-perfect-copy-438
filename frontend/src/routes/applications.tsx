import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth-context";
import { fetchMyApplications, statusTone, type ApplicationRow } from "@/lib/api-client";

export const Route = createFileRoute("/applications")({
  component: ApplicationsPage,
  head: () => ({
    meta: [
      { title: "My applications — SkillsBox" },
      { name: "description", content: "Track the status of every internship and job you applied to on SkillsBox." },
      { property: "og:title", content: "My applications — SkillsBox" },
      { property: "og:description", content: "Track the status of every internship and job you applied to." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ApplicationsPage() {
  const { user, loading } = useAuth();
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setBusy(false);
      return;
    }
    let alive = true;
    fetchMyApplications(user.id)
      .then((d) => alive && setApps(d))
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [user, loading]);

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold">My applications</h1>
        <p className="mt-2 text-muted-foreground">Track the status of every listing you've applied to.</p>

        <div className="mt-8 space-y-3">
          {busy && <p className="text-muted-foreground">Loading…</p>}

          {!busy && !user && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <p className="text-muted-foreground">Sign in to see your applications.</p>
              <Link to="/login" className="mt-3 inline-block font-semibold text-primary">
                Sign in →
              </Link>
            </div>
          )}

          {!busy && user && apps.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <p className="text-muted-foreground">You haven't applied to any listings yet.</p>
              <Link to="/listings" className="mt-3 inline-block font-semibold text-primary">
                Browse listings →
              </Link>
            </div>
          )}

          {apps.map((a) => (
            <Link
              key={a.id}
              to="/listings/$id"
              params={{ id: a.listing_id }}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary"
            >
              <div>
                <p className="font-bold">{a.listings?.title ?? "Listing"}</p>
                <p className="text-sm text-muted-foreground">
                  {a.listings?.companies?.name ?? ""} • applied {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusTone(a.status)}`}>
                {a.status}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
