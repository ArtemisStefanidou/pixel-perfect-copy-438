import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth-context";
import { addListing, COUNTRIES, SECTORS, type ListingType } from "@/lib/mock-data";

export const Route = createFileRoute("/sme/new-listing")({
  component: NewListingPage,
  head: () => ({ meta: [{ title: "Post a new listing — SkillsBox" }] }),
});

function NewListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [emoji, setEmoji] = useState("💼");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [type, setType] = useState<ListingType>("Internship");
  const [remote, setRemote] = useState<"Remote" | "On-site" | "Hybrid">("Hybrid");
  const [duration, setDuration] = useState("3 Months");
  const [sector, setSector] = useState(SECTORS[0]);
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [requirements, setRequirements] = useState("");

  useEffect(() => {
    if (user && user.role !== "sme" && user.role !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === "sme" && !company) setCompany(user.name);
  }, [user, company]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const created = addListing({
      title: title.trim(),
      company: company.trim() || "Your Company",
      emoji: emoji || "💼",
      city: city.trim() || "Remote",
      country,
      type,
      remote,
      duration,
      sector,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      description: description.trim(),
      requirements: requirements
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      postedBy: user?.email,
    });
    navigate({ to: "/listings/$id", params: { id: created.id } });
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
          <div className="grid gap-4 sm:grid-cols-[80px_1fr]">
            <Field label="Icon">
              <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} className={inputCls + " text-center text-2xl"} />
            </Field>
            <Field label="Role title" required>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Junior Backend Developer" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company" required>
              <input required value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
            </Field>
            <Field label="City" required>
              <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder="e.g. Tirana" />
            </Field>
            <Field label="Country">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Sector">
              <select value={sector} onChange={(e) => setSector(e.target.value)} className={inputCls}>
                {SECTORS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value as ListingType)} className={inputCls}>
                <option>Internship</option>
                <option>Full-time</option>
                <option>Part-time</option>
              </select>
            </Field>
            <Field label="Work mode">
              <select value={remote} onChange={(e) => setRemote(e.target.value as typeof remote)} className={inputCls}>
                <option>Remote</option>
                <option>On-site</option>
                <option>Hybrid</option>
              </select>
            </Field>
            <Field label="Duration">
              <input value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} placeholder="e.g. 6 Months" />
            </Field>
            <Field label="Skills (comma separated)">
              <input value={skills} onChange={(e) => setSkills(e.target.value)} className={inputCls} placeholder="React, TypeScript, SQL" />
            </Field>
          </div>

          <Field label="Role description" required>
            <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="What will the intern work on? Tools, mentorship, outcomes…" />
          </Field>

          <Field label="What you're looking for (one per line)" required>
            <textarea required rows={5} value={requirements} onChange={(e) => setRequirements(e.target.value)} className={inputCls} placeholder={`Portfolio with 2+ projects\nEnglish B2 or higher\nErasmus+ eligible`} />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/dashboard" className="rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-secondary">
              Cancel
            </Link>
            <button type="submit" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-soft">
              Publish listing
            </button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {children}
    </label>
  );
}
