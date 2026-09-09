import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import heroImg from "@/assets/hero-students.jpg";
import { LISTINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SkillsBox — Bridge education and career in the Western Balkans" },
      {
        name: "description",
        content:
          "Erasmus+ powered platform connecting students and SMEs across Albania, Bosnia, Kosovo, Montenegro, North Macedonia and Serbia.",
      },
    ],
  }),
});

function Index() {
  const featured = LISTINGS.slice(0, 3);

  return (
    <PageShell>
      {/* Hero */}
      <section className="px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Now live in the Western Balkans
              </div>
              <h1 className="font-display text-5xl font-bold leading-[1.05] text-foreground lg:text-7xl">
                Bridge the gap between <span className="text-primary">Education</span> and Career.
              </h1>
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
                The Erasmus+ powered platform connecting students from Tirana to Sarajevo with
                internships and SME opportunities across the region.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="rounded-xl bg-foreground px-8 py-4 font-semibold text-background transition-transform hover:-translate-y-0.5"
                >
                  I am a Student
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl border border-border bg-surface px-8 py-4 font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  I am a Company
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImg}
                alt="University students collaborating around a laptop in a bright co-working space"
                width={1280}
                height={1024}
                className="aspect-[1.2] w-full rounded-3xl object-cover shadow-2xl ring-1 ring-black/5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CV Builder preview */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-bold">Built-in Europass CV Builder</h2>
            <p className="mt-4 text-muted-foreground">
              Generate professional resumes recognized across the European Union in minutes.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-background p-6">
                {[
                  { n: 1, t: "Personal Info", d: "Contact and identity", active: true },
                  { n: 2, t: "Work Experience", d: "Roles and achievements" },
                  { n: 3, t: "Skills & Languages", d: "Digital and soft skills" },
                ].map((s) => (
                  <div
                    key={s.n}
                    className={`flex items-center gap-4 pl-4 ${s.active ? "border-l-2 border-primary" : "opacity-50"}`}
                  >
                    <div
                      className={`grid size-8 place-items-center rounded-full text-xs font-bold ${
                        s.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {s.n}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{s.t}</p>
                      <p className="text-xs text-muted-foreground">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
                  <h3 className="mb-6 text-lg font-bold">Personal Details</h3>
                  <div className="space-y-4">
                    <Field label="Full Name" value="Arben Hoxha" />
                    <Field label="Nationality" value="Albanian" />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-slate-800 p-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                      Europass Preview
                    </span>
                    <div className="flex gap-1">
                      <div className="size-2 rounded-full bg-white/20" />
                      <div className="size-2 rounded-full bg-white/20" />
                    </div>
                  </div>
                  <div className="mt-4 h-64 w-full overflow-hidden bg-white p-6 shadow-inner">
                    <div className="mb-2 h-4 w-1/3 bg-slate-200" />
                    <div className="mb-1 h-2 w-full bg-slate-100" />
                    <div className="mb-4 h-2 w-5/6 bg-slate-100" />
                    <div className="mb-4 h-8 w-8 rounded bg-primary/20" />
                    <div className="h-2 w-1/2 bg-slate-100" />
                  </div>
                </div>
              </div>
              <div className="mt-6 text-right">
                <Link
                  to="/cv-builder"
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Open the CV Builder →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Explore Internships</h2>
              <p className="mt-2 text-muted-foreground">
                Available positions across the Western Balkans 6.
              </p>
            </div>
            <Link
              to="/listings"
              className="hidden rounded-lg bg-secondary px-4 py-2 text-sm font-semibold sm:inline-flex"
            >
              View all listings →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        readOnly
        defaultValue={value}
        className="mt-1 w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function ListingCard({ l }: { l: import("@/lib/mock-data").Listing }) {
  return (
    <Link
      to="/listings/$id"
      params={{ id: l.id }}
      className="group relative rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="grid size-12 place-items-center rounded-xl border border-border bg-background text-xl">
          {l.emoji}
        </div>
        {l.closingSoon ? (
          <span className="rounded-full bg-warning/10 px-3 py-1 text-[10px] font-bold uppercase text-warning">
            Closing Soon
          </span>
        ) : (
          <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold uppercase text-success">
            Active
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold group-hover:text-primary">{l.title}</h3>
      <p className="text-sm font-medium text-muted-foreground">
        {l.company} • {l.city}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">
          {l.remote}
        </span>
        <span className="rounded bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">
          {l.duration}
        </span>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="text-xs font-medium text-muted-foreground">
          Posted {l.postedDaysAgo} {l.postedDaysAgo === 1 ? "day" : "days"} ago
        </span>
        <span className="text-sm font-bold text-primary">View →</span>
      </div>
    </Link>
  );
}
