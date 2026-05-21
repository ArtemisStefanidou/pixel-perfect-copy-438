export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded bg-primary" aria-hidden />
          <span className="font-display font-bold">SkillsBox</span>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SkillsBox. Funded by the Erasmus+ Programme of the European Union.
        </div>
        <div className="flex gap-6 text-sm font-medium">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}
