import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { MODULES, useEarnedBadges } from "@/lib/mock-data";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
  head: () => ({
    meta: [
      { title: "Learn — SkillsBox" },
      { name: "description", content: "Five skill modules with PPT, video and a quiz. Earn a badge for each." },
    ],
  }),
});

function LearnPage() {
  const earned = useEarnedBadges();
  const earnedIds = new Set(earned.map((b) => b.moduleId));

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Skills Academy</p>
            <h1 className="font-display text-3xl font-bold">Earn 5 verifiable badges</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Each module has 2 slide decks, 2 videos and a short quiz. Pass the quiz to receive a downloadable certificate.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm">
            <span className="font-semibold">{earned.length}</span>
            <span className="text-muted-foreground"> / {MODULES.length} badges earned</span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const done = earnedIds.has(m.id);
            return (
              <Link
                key={m.id}
                to="/learn/$id"
                params={{ id: m.id }}
                className="group rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="grid size-14 place-items-center rounded-2xl text-2xl"
                    style={{ background: `${m.badgeColor}1A`, color: m.badgeColor }}
                  >
                    {m.emoji}
                  </div>
                  {done ? (
                    <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold uppercase text-success">
                      ✓ Earned
                    </span>
                  ) : (
                    <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground">
                      {m.estMinutes} min
                    </span>
                  )}
                </div>
                <h2 className="mt-5 font-display text-lg font-bold group-hover:text-primary">{m.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-semibold">
                  <span className="rounded bg-secondary px-2 py-1">2 PPT</span>
                  <span className="rounded bg-secondary px-2 py-1">2 Video</span>
                  <span className="rounded bg-secondary px-2 py-1">1 Quiz</span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-xs text-muted-foreground">Badge: {m.badgeName}</span>
                  <span className="text-sm font-bold text-primary">{done ? "Review →" : "Start →"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
