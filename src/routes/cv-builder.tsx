import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/cv-builder")({
  component: CvBuilder,
  head: () => ({ meta: [{ title: "Europass CV Builder — SkillsBox" }] }),
});

interface CvData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  about: string;
  education: { institution: string; degree: string; field: string; years: string }[];
  experience: { company: string; role: string; description: string; years: string }[];
  skills: string[];
  languages: { language: string; level: string }[];
  certifications: { title: string; issuer: string; year: string }[];
}

const STEPS = ["Personal", "Education", "Experience", "Skills", "Languages", "Certifications"] as const;

const DEFAULT_CV: CvData = {
  firstName: "Arben",
  lastName: "Hoxha",
  email: "arben@example.com",
  phone: "+355 69 000 0000",
  city: "Tirana",
  country: "Albania",
  about: "Computer Science student with a passion for human-centered design and open-source.",
  education: [{ institution: "University of Tirana", degree: "BSc", field: "Computer Science", years: "2022 – 2026" }],
  experience: [{ company: "Altos Tech", role: "Frontend Intern", description: "Built React components for a fintech dashboard.", years: "2024" }],
  skills: ["React", "TypeScript", "Figma", "Communication"],
  languages: [
    { language: "Albanian", level: "C2" },
    { language: "English", level: "C1" },
  ],
  certifications: [{ title: "Google UX Design", issuer: "Coursera", year: "2024" }],
};

function CvBuilder() {
  const [cv, setCv] = useState<CvData>(DEFAULT_CV);
  const [step, setStep] = useState(0);

  const progress = useMemo(() => {
    let filled = 0;
    if (cv.firstName && cv.lastName && cv.email) filled++;
    if (cv.education.length) filled++;
    if (cv.experience.length) filled++;
    if (cv.skills.length) filled++;
    if (cv.languages.length) filled++;
    if (cv.certifications.length) filled++;
    return Math.round((filled / STEPS.length) * 100);
  }, [cv]);

  function update<K extends keyof CvData>(key: K, value: CvData[K]) {
    setCv((c) => ({ ...c, [key]: value }));
  }

  function downloadPdf() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${cv.firstName} ${cv.lastName} — Europass CV</title>
<style>body{font-family:Arial,sans-serif;max-width:780px;margin:40px auto;padding:0 32px;color:#0F172A}h1{font-size:28px;margin:0 0 4px;color:#1E40AF}h2{font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#1E40AF;border-bottom:2px solid #1E40AF;padding-bottom:4px;margin-top:28px}.muted{color:#64748B;font-size:13px}.row{margin:8px 0;font-size:13.5px;line-height:1.5}.tag{display:inline-block;background:#EFF6FF;color:#1E40AF;padding:2px 8px;border-radius:6px;font-size:12px;margin:2px 4px 2px 0}</style>
</head><body>
<h1>${escape(cv.firstName)} ${escape(cv.lastName)}</h1>
<div class="muted">${escape(cv.email)} • ${escape(cv.phone)} • ${escape(cv.city)}, ${escape(cv.country)}</div>
<p class="row">${escape(cv.about)}</p>
<h2>Education</h2>${cv.education.map((e) => `<div class="row"><strong>${escape(e.degree)} in ${escape(e.field)}</strong><br>${escape(e.institution)} <span class="muted">— ${escape(e.years)}</span></div>`).join("")}
<h2>Work Experience</h2>${cv.experience.map((e) => `<div class="row"><strong>${escape(e.role)}</strong> · ${escape(e.company)} <span class="muted">(${escape(e.years)})</span><br>${escape(e.description)}</div>`).join("")}
<h2>Skills</h2><div class="row">${cv.skills.map((s) => `<span class="tag">${escape(s)}</span>`).join("")}</div>
<h2>Languages</h2><div class="row">${cv.languages.map((l) => `<span class="tag">${escape(l.language)} — ${escape(l.level)}</span>`).join("")}</div>
<h2>Certifications</h2>${cv.certifications.map((c) => `<div class="row"><strong>${escape(c.title)}</strong> — ${escape(c.issuer)} <span class="muted">(${escape(c.year)})</span></div>`).join("")}
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 250);
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Europass CV Builder</h1>
            <p className="mt-1 text-muted-foreground">Build an EU-compliant resume and export it as PDF.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Profile</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button
              onClick={downloadPdf}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-soft"
            >
              Download Europass PDF
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          {/* Stepper */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-2 rounded-2xl border border-border bg-surface p-4 shadow-sm">
              {STEPS.map((s, i) => {
                const active = i === step;
                return (
                  <button
                    key={s}
                    onClick={() => setStep(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                      active ? "bg-primary/10 font-semibold text-primary" : "hover:bg-secondary"
                    }`}
                  >
                    <span
                      className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
                        active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {s}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Editor */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
              {step === 0 && (
                <Section title="Personal Information">
                  <Grid>
                    <Input label="First name" value={cv.firstName} onChange={(v) => update("firstName", v)} />
                    <Input label="Last name" value={cv.lastName} onChange={(v) => update("lastName", v)} />
                    <Input label="Email" type="email" value={cv.email} onChange={(v) => update("email", v)} />
                    <Input label="Phone" value={cv.phone} onChange={(v) => update("phone", v)} />
                    <Input label="City" value={cv.city} onChange={(v) => update("city", v)} />
                    <Input label="Country" value={cv.country} onChange={(v) => update("country", v)} />
                  </Grid>
                  <Textarea label="About" value={cv.about} onChange={(v) => update("about", v)} />
                </Section>
              )}
              {step === 1 && (
                <Section title="Education">
                  {cv.education.map((e, idx) => (
                    <Grid key={idx}>
                      <Input label="Institution" value={e.institution} onChange={(v) => {
                        const next = [...cv.education]; next[idx] = { ...e, institution: v }; update("education", next);
                      }} />
                      <Input label="Degree" value={e.degree} onChange={(v) => {
                        const next = [...cv.education]; next[idx] = { ...e, degree: v }; update("education", next);
                      }} />
                      <Input label="Field" value={e.field} onChange={(v) => {
                        const next = [...cv.education]; next[idx] = { ...e, field: v }; update("education", next);
                      }} />
                      <Input label="Years" value={e.years} onChange={(v) => {
                        const next = [...cv.education]; next[idx] = { ...e, years: v }; update("education", next);
                      }} />
                    </Grid>
                  ))}
                  <AddButton onClick={() => update("education", [...cv.education, { institution: "", degree: "", field: "", years: "" }])}>
                    + Add education
                  </AddButton>
                </Section>
              )}
              {step === 2 && (
                <Section title="Work Experience">
                  {cv.experience.map((e, idx) => (
                    <div key={idx} className="space-y-4">
                      <Grid>
                        <Input label="Company" value={e.company} onChange={(v) => { const n = [...cv.experience]; n[idx] = { ...e, company: v }; update("experience", n); }} />
                        <Input label="Role" value={e.role} onChange={(v) => { const n = [...cv.experience]; n[idx] = { ...e, role: v }; update("experience", n); }} />
                        <Input label="Years" value={e.years} onChange={(v) => { const n = [...cv.experience]; n[idx] = { ...e, years: v }; update("experience", n); }} />
                      </Grid>
                      <Textarea label="Description" value={e.description} onChange={(v) => { const n = [...cv.experience]; n[idx] = { ...e, description: v }; update("experience", n); }} />
                    </div>
                  ))}
                  <AddButton onClick={() => update("experience", [...cv.experience, { company: "", role: "", description: "", years: "" }])}>
                    + Add experience
                  </AddButton>
                </Section>
              )}
              {step === 3 && (
                <Section title="Skills">
                  <ChipEditor
                    items={cv.skills}
                    onChange={(arr) => update("skills", arr)}
                    placeholder="Add a skill and press Enter"
                  />
                </Section>
              )}
              {step === 4 && (
                <Section title="Languages">
                  {cv.languages.map((l, idx) => (
                    <Grid key={idx}>
                      <Input label="Language" value={l.language} onChange={(v) => { const n = [...cv.languages]; n[idx] = { ...l, language: v }; update("languages", n); }} />
                      <Input label="CEFR Level (A1–C2)" value={l.level} onChange={(v) => { const n = [...cv.languages]; n[idx] = { ...l, level: v }; update("languages", n); }} />
                    </Grid>
                  ))}
                  <AddButton onClick={() => update("languages", [...cv.languages, { language: "", level: "" }])}>
                    + Add language
                  </AddButton>
                </Section>
              )}
              {step === 5 && (
                <Section title="Certifications">
                  {cv.certifications.map((c, idx) => (
                    <Grid key={idx}>
                      <Input label="Title" value={c.title} onChange={(v) => { const n = [...cv.certifications]; n[idx] = { ...c, title: v }; update("certifications", n); }} />
                      <Input label="Issuer" value={c.issuer} onChange={(v) => { const n = [...cv.certifications]; n[idx] = { ...c, issuer: v }; update("certifications", n); }} />
                      <Input label="Year" value={c.year} onChange={(v) => { const n = [...cv.certifications]; n[idx] = { ...c, year: v }; update("certifications", n); }} />
                    </Grid>
                  ))}
                  <AddButton onClick={() => update("certifications", [...cv.certifications, { title: "", issuer: "", year: "" }])}>
                    + Add certification
                  </AddButton>
                </Section>
              )}

              <div className="mt-8 flex justify-between border-t border-border pt-6">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
                  disabled={step === STEPS.length - 1}
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-border bg-slate-800 p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Europass Preview</span>
                <div className="flex gap-1">
                  <div className="size-2 rounded-full bg-white/20" />
                  <div className="size-2 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="mt-4 max-h-[70vh] overflow-auto bg-white p-6 text-slate-900 shadow-inner">
                <h2 className="font-display text-2xl font-bold text-primary">
                  {cv.firstName} {cv.lastName}
                </h2>
                <p className="text-xs text-slate-500">{cv.email} • {cv.phone} • {cv.city}, {cv.country}</p>
                <p className="mt-3 text-sm leading-relaxed">{cv.about}</p>

                <PreviewBlock title="Education">
                  {cv.education.map((e, i) => (
                    <div key={i} className="mb-2 text-sm">
                      <p className="font-semibold">{e.degree} in {e.field}</p>
                      <p className="text-xs text-slate-500">{e.institution} — {e.years}</p>
                    </div>
                  ))}
                </PreviewBlock>
                <PreviewBlock title="Experience">
                  {cv.experience.map((e, i) => (
                    <div key={i} className="mb-2 text-sm">
                      <p className="font-semibold">{e.role} · {e.company}</p>
                      <p className="text-xs text-slate-500">{e.years}</p>
                      <p className="text-xs">{e.description}</p>
                    </div>
                  ))}
                </PreviewBlock>
                <PreviewBlock title="Skills">
                  <div className="flex flex-wrap gap-1">
                    {cv.skills.map((s) => (
                      <span key={s} className="rounded bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{s}</span>
                    ))}
                  </div>
                </PreviewBlock>
                <PreviewBlock title="Languages">
                  <div className="flex flex-wrap gap-1">
                    {cv.languages.map((l) => (
                      <span key={l.language} className="rounded bg-slate-100 px-2 py-0.5 text-[11px]">{l.language} — {l.level}</span>
                    ))}
                  </div>
                </PreviewBlock>
                <PreviewBlock title="Certifications">
                  {cv.certifications.map((c, i) => (
                    <p key={i} className="text-sm"><strong>{c.title}</strong> — {c.issuer} <span className="text-xs text-slate-500">({c.year})</span></p>
                  ))}
                </PreviewBlock>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-dashed border-border bg-background py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
    >
      {children}
    </button>
  );
}

function ChipEditor({ items, onChange, placeholder }: { items: string[]; onChange: (a: string[]) => void; placeholder: string }) {
  const [v, setV] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <span key={s} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            {s}
            <button onClick={() => onChange(items.filter((i) => i !== s))} className="opacity-60 hover:opacity-100">×</button>
          </span>
        ))}
      </div>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) {
            e.preventDefault();
            onChange([...items, v.trim()]);
            setV("");
          }
        }}
        placeholder={placeholder}
        className="mt-3 w-full rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="border-b-2 border-primary pb-1 text-[10px] font-bold uppercase tracking-widest text-primary">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
