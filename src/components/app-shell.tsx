import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Dumbbell, Activity, Trophy, Sparkles, MapPin,
  ClipboardList, CreditCard, User, Shield, Flame, Zap, Menu, ArrowLeft,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { Footer } from "@/components/footer";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

const nav = [
  { to: "/home", label: "Dashboard", icon: LayoutDashboard, admin: false },
  { to: "/workout", label: "Workout", icon: Dumbbell, admin: false },
  { to: "/activities", label: "Activity", icon: Activity, admin: false },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, admin: false },
  { to: "/ai-coach", label: "AI Coach", icon: Sparkles, admin: false },
  { to: "/centers", label: "Centers", icon: MapPin, admin: false },
  { to: "/register-gym", label: "Register Gym", icon: ClipboardList, admin: false },
  { to: "/subscription", label: "Subscription", icon: CreditCard, admin: false },
  { to: "/profile", label: "Profile", icon: User, admin: false },
  { to: "/admin", label: "Admin", icon: Shield, admin: true },
] as const;

function XPBar() {
  const { level, xpInLevel, xpToNext } = useUser();
  const pct = Math.min(100, (xpInLevel / xpToNext) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <Zap className="size-3.5 neon-text-green" /> Lv {level}
        </span>
        <span className="text-muted-foreground">{xpInLevel}/{xpToNext} XP</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full animate-progress" style={{ width: `${pct}%`, background: "var(--gradient-xp)" }} />
      </div>
    </div>
  );
}

function StreakPill() {
  const { profile } = useUser();
  return (
    <Link to="/profile" className="chip transition-transform hover:scale-105 active:scale-95"
          style={{ background: "color-mix(in oklab, var(--neon-amber) 18%, transparent)" }}>
      <Flame className="size-3.5" style={{ color: "var(--neon-amber)" }} />
      <span className="font-semibold">{profile?.streak ?? 0}</span>
      <span className="text-muted-foreground">day streak</span>
    </Link>
  );
}

function NavItem({ to, label, Icon, active, onClick }: { to: string; label: string; Icon: any; active: boolean; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
        active ? "bg-white/10 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--neon-green)_40%,transparent)]"
               : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      }`}>
      <Icon className={`size-4 ${active ? "neon-text-green" : ""}`} />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { profile, session, loading, isAdmin, xpToNext, xpInLevel } = useUser();

  const isPublic = PUBLIC_PATHS.has(pathname);

  // Auth gate
  useEffect(() => {
    if (loading) return;
    if (!session && !isPublic) {
      router.navigate({ to: "/login" });
    } else if (session && (pathname === "/login" || pathname === "/signup")) {
      router.navigate({ to: "/home" });
    } else if (pathname === "/admin" && session && !isAdmin) {
      router.navigate({ to: "/home" });
    }
  }, [session, loading, isPublic, pathname, isAdmin, router]);

  if (isPublic) return <>{children}</>;

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="glass p-6 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const visibleNav = nav.filter((n) => !n.admin || isAdmin);
  const initials = (profile?.name || profile?.email || "U").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  const SideContent = (
    <div className="flex h-full flex-col gap-6 p-4 overflow-y-auto">
      <Link to="/home" className="flex items-center gap-2 px-2">
        <div className="grid size-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
          <Dumbbell className="size-5 text-background" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-lg font-bold">FitX</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Fitness OS</div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {visibleNav.map((n) => (
          <NavItem key={n.to} to={n.to} label={n.label} Icon={n.icon}
                   active={pathname.startsWith(n.to)} onClick={() => setOpen(false)} />
        ))}
      </nav>

      <div className="mt-auto glass p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full text-sm font-bold"
               style={{ background: "var(--gradient-primary)", color: "var(--background)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{profile?.name || "Athlete"}</div>
            <div className="truncate text-xs text-muted-foreground capitalize">{profile?.subscription_type ?? "free"} plan</div>
          </div>
        </div>
        <XPBar />
        <StreakPill />
        <div className="text-[11px] text-muted-foreground">
          {Math.max(0, xpToNext - xpInLevel)} XP to next level
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:block w-72 shrink-0 border-r border-white/5 sticky top-0 h-screen">
        {SideContent}
      </aside>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:hidden glass !rounded-none animate-fade-up overflow-y-auto">
            {SideContent}
          </aside>
        </>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-background/60 px-4 py-3 backdrop-blur-xl lg:px-8">
          {pathname !== "/home" && (
            <button onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
                else router.navigate({ to: "/home" });
              }}
              className="grid size-9 place-items-center rounded-lg border border-white/10 transition-all hover:bg-white/5 hover:scale-105 active:scale-95"
              aria-label="Go back">
              <ArrowLeft className="size-4" />
            </button>
          )}
          <button onClick={() => setOpen(true)}
            className="lg:hidden grid size-9 place-items-center rounded-lg border border-white/10 transition-all hover:bg-white/5"
            aria-label="Open menu">
            <Menu className="size-4" />
          </button>
          <div className="hidden sm:block min-w-0">
            <div className="text-xs text-muted-foreground">Welcome back</div>
            <div className="truncate font-semibold">{profile?.name || profile?.email}</div>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link to="/profile" className="hidden sm:block w-40 md:w-56 transition-opacity hover:opacity-80"><XPBar /></Link>
            <StreakPill />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
