import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { MODULES, awardBadge, useEarnedBadges, type LearningModule } from "@/lib/mock-data";

export const Route = createFileRoute("/learn/$id")({
  component: ModulePage,
  loader: ({ params }) => {
    const m = MODULES.find((x) => x.id === params.id);
    if (!m) throw notFound();
    return { module: m };
  },
});

function ModulePage() {
  const { module: m } = Route.useLoaderData() as { module: LearningModule };
  const earned = useEarnedBadges();
  const previousBadge = earned.find((b) => b.moduleId === m.id);

  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    let s = 0;
    m.quiz.forEach((q, i) => { if (answers[i] === q.answer) s++; });
    return s;
  }, [answers, m.quiz]);
  const passed = submitted && score >= Math.ceil(m.quiz.length * 0.7);

  function toggle(idx: number) {
    setCompleted((c) => ({ ...c, [idx]: !c[idx] }));
  }

  function submit() {
    setSubmitted(true);
    if (score >= Math.ceil(m.quiz.length * 0.7)) {
      awardBadge(m.id, score);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/learn" className="text-sm text-muted-foreground hover:text-primary">← All modules</Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-6 rounded-3xl border border-border bg-surface p-8">
          <div className="flex items-start gap-4">
            <div
              className="grid size-16 place-items-center rounded-2xl text-3xl"
              style={{ background: `${m.badgeColor}1A`, color: m.badgeColor }}
            >
              {m.emoji}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{m.title}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">{m.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold">
                <span className="rounded bg-secondary px-2 py-1">{m.estMinutes} min</span>
                <span className="rounded bg-secondary px-2 py-1">Badge: {m.badgeName}</span>
              </div>
            </div>
          </div>
          {previousBadge && (
            <span className="rounded-full bg-success/10 px-4 py-2 text-xs font-bold uppercase text-success">
              ✓ Badge earned — score {previousBadge.score}/{m.quiz.length}
            </span>
          )}
        </div>

        <h2 className="mt-10 font-display text-xl font-bold">Lessons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {m.lessons.map((l, i) => (
            <article key={i} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">
                  {l.kind === "ppt" ? "Slides" : "Video"}
                </span>
                <span className="text-xs text-muted-foreground">{l.duration}</span>
              </div>
              <h3 className="mt-3 text-sm font-bold">{l.title}</h3>
              {l.kind === "video" ? (
                <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
                  <iframe
                    src={l.url}
                    title={l.title}
                    className="size-full"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex aspect-video items-center justify-center rounded-xl border border-dashed border-border bg-background text-sm font-semibold text-primary"
                >
                  Open slide deck ↗
                </a>
              )}
              <button
                onClick={() => toggle(i)}
                className={`mt-3 w-full rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  completed[i]
                    ? "border-success bg-success/10 text-success"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                {completed[i] ? "✓ Marked complete" : "Mark as complete"}
              </button>
            </article>
          ))}
        </div>

        <h2 className="mt-12 font-display text-xl font-bold">Quiz — earn your badge</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pass with {Math.ceil(m.quiz.length * 0.7)}/{m.quiz.length} correct answers.
        </p>

        <div className="mt-5 space-y-5 rounded-2xl border border-border bg-surface p-6">
          {m.quiz.map((q, qi) => (
            <div key={qi}>
              <p className="font-semibold">{qi + 1}. {q.q}</p>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt, oi) => {
                  const chosen = answers[qi] === oi;
                  const correct = submitted && q.answer === oi;
                  const wrongChosen = submitted && chosen && q.answer !== oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                        correct
                          ? "border-success bg-success/10 text-success"
                          : wrongChosen
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : chosen
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={submit}
              disabled={Object.keys(answers).length < m.quiz.length}
              className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-soft disabled:opacity-50"
            >
              Submit answers
            </button>
          ) : passed ? (
            <Certificate module={m} score={score} />
          ) : (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
              You scored <b>{score}/{m.quiz.length}</b>. Review the lessons and try again.
              <button
                onClick={() => { setSubmitted(false); setAnswers({}); }}
                className="ml-3 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                Retry quiz
              </button>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function Certificate({ module: m, score }: { module: LearningModule; score: number }) {
  function print() { window.print(); }
  return (
    <div className="mt-2 rounded-2xl border-2 p-6 text-center" style={{ borderColor: m.badgeColor, background: `${m.badgeColor}0D` }}>
      <div className="mx-auto grid size-16 place-items-center rounded-full text-3xl" style={{ background: m.badgeColor, color: "#fff" }}>
        🏆
      </div>
      <h3 className="mt-3 font-display text-2xl font-bold">Badge unlocked: {m.badgeName}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        You scored {score}/{m.quiz.length}. A certificate has been added to your profile.
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <button onClick={print} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft">
          Download certificate (PDF)
        </button>
        <Link to="/learn" className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-secondary">
          Back to modules
        </Link>
      </div>
    </div>
  );
}
