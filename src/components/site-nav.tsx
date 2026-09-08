import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, ROLE_LABEL } from "@/lib/auth-context";

export function SiteNav() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  const linkCls = "text-muted-foreground transition-colors hover:text-primary";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary" aria-hidden />
          <span className="font-display text-xl font-bold tracking-tight">SkillsBox</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link to="/listings" className={linkCls} activeProps={{ className: "text-primary" }}>
            Listings
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className={linkCls} activeProps={{ className: "text-primary" }}>
                Dashboard
              </Link>
              {role === "student" && (
                <>
                  <Link to="/cv-builder" className={linkCls} activeProps={{ className: "text-primary" }}>
                    CV Builder
                  </Link>
                  <Link to="/learn" className={linkCls} activeProps={{ className: "text-primary" }}>
                    Learn
                  </Link>
                  <Link to="/applications" className={linkCls} activeProps={{ className: "text-primary" }}>
                    Applications
                  </Link>
                </>
              )}
              {role === "sme" && (
                <Link to="/sme/new-listing" className={linkCls} activeProps={{ className: "text-primary" }}>
                  Post Listing
                </Link>
              )}
              {(role === "platform_admin" || role === "hei_admin") && (
                <Link to="/admin" className={linkCls} activeProps={{ className: "text-primary" }}>
                  Administration
                </Link>
              )}
              {role && (
                <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {ROLE_LABEL[role]}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {profile?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold">
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary-soft"
              >
                Join Platform
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
