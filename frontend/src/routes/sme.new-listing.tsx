import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth-context";
import { COUNTRIES, LISTING_TYPES, SECTORS, WORK_MODES, createListing } from "@/lib/api-client";

export const Route = createFileRoute("/sme/new-listing")({
  component: NewListingPage,
  head: () => ({
    meta: [
      { title: "Post a new listing — SkillsBox" },
      { name: "description", content: "Publish an internship or job opportunity for students in the Western Balkans." },
      { property: "og:title", content: "Post a new listing — SkillsBox" },
      { property: "og:description", content: "Publish an internship or job opportunity for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30";

function NewListingPage() {
  const { user, role, company, loading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [listingType, setListingType] = useState(LISTING_TYPES[0]);
  const [workMode, setWorkMode] = useState(WORK_MODES[2]);
  const [duration, setDuration] = useState("3 months");
  const [sector, setSector] = useState(SECTORS[0]);
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-32 text-muted-foreground">Loading…</div>
      </PageShell>
    );
  }

  if (role !== "sme") {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="font-display text-3xl font-bold">Company accounts only</h1>
          <p className="mt-3 text-muted-foreground">Only registered companies can publish opportunities.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-primary">
            ← Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  if (company?.status !== "approved") {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="font-display text-3xl font-bold">Your company is awaiting approval</h1>
          <p className="mt-3 text-muted-foreground">
            A platform administrator reviews every company before its opportunities go live. You'll be able to publish
            as soon as {company?.name ?? "your company"} is approved.
          </p>
          <Link to="/dashboard" className="mt-4 inline-block text-primary">
            ← Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !company) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createListing({
        company_id: company.id,
        owner_id: user.id,
        title: title.trim(),
        description: description.trim(),
        sector,
        listing_type: listingType,
        work_mode: workMode,
        required_skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        duration: duration.trim() || null,
        city: city.trim() || null,
        country,
        deadline: deadline || null,
      });
      navigate({ to: "/listings/$id", params: { id: created.id } });
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold">Post a new opportunity</h1>
        <p className="mt-2 text-muted-foreground">
          Describe the role and what you're looking for. Students will see it in the listings feed.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-6 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <Field label="Role title" required>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Junior Backend Developer" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder="e.g. Tirana" />
            </Field>
            <Field label="Country">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select value={listingType} onChange={(e) => setListingType(e.target.value)} className={inputCls}>
                {LISTING_TYPES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Work mode">
              <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className={inputCls}>
                {WORK_MODES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Duration">
              <input value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} placeholder="e.g. 6 months" />
            </Field>
            <Field label="Sector">
              <select value={sector} onChange={(e) => setSector(e.target.value)} className={inputCls}>
                {SECTORS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Application deadline">
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Required skills (comma separated)">
              <input value={skills} onChange={(e) => setSkills(e.target.value)} className={inputCls} placeholder="React, SQL, English" />
            </Field>
          </div>

          <Field label="Description" required>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
              placeholder="What the intern will do, what you expect, what you offer…"
            />
          </Field>

          {error && <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-soft disabled:opacity-60"
          >
            {saving ? "Publishing…" : "Publish listing"}
          </button>
        </form>
      </section>
    </PageShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {children}
    </label>
  );
}
