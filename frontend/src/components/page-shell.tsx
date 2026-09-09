import type { ReactNode } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
