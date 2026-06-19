import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Dumbbell, Activity, Trophy, Sparkles, MapPin,
  ClipboardList, CreditCard, User, Shield, Flame, Zap, Menu,
} from "lucide-react";
import { useState } from "react";
import { currentUser } from "@/lib/mock-data";

const nav = [
  { to: "/home", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/activities", label: "Activity", icon: Activity },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/ai-coach", label: "AI Coach", icon: Sparkles },
  { to: "/centers", label: "Centers", icon: MapPin },
  { to: "/register-gym", label: "Register Gym", icon: ClipboardList },
  { to: "/subscription", label: "Subscription", icon: CreditCard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;

function XPBar() {
  const pct = Math.min(100, (currentUser.xp / currentUser.xpToNext) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <Zap className="size-3.5 neon-text-green" />
          Lv {currentUser.level}
        </span>
        <span className="text-muted-foreground">{currentUser.xp}/{currentUser.xpToNext} XP</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full animate-progress"
          style={{ width: `${pct}%`, background: "var(--gradient-xp)" }}
        />
      </div>
    </div>
  );
}

function StreakPill() {
  return (
    <div className="chip" style={{ background: "color-mix(in oklab, var(--neon-amber) 18%, transparent)" }}>
      <Flame className="size-3.5" style={{ color: "var(--neon-amber)" }} />
      <span className="font-semibold">{currentUser.streak}</span>
      <span className="text-muted-foreground">day streak</span>
    </div>
  );
}

function NavItem({ to, label, Icon, active, onClick }: { to: string; label: string; Icon: any; active: boolean; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
        active
          ? "bg-white/10 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--neon-green)_40%,transparent)]"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      }`}
    >
      <Icon className={`size-4 ${active ? "neon-text-green" : ""}`} />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const isAuth = pathname === "/login" || pathname === "/signup" || pathname === "/";
  if (isAuth) return <>{children}</>;

  const SideContent = (
    <div className="flex h-full flex-col gap-6 p-4">
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
        {nav.map((n) => (
          <NavItem
            key={n.to}
            to={n.to}
            label={n.label}
            Icon={n.icon}
            active={pathname.startsWith(n.to)}
            onClick={() => setOpen(false)}
          />
        ))}
      </nav>

      <div className="mt-auto glass p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full text-sm font-bold"
               style={{ background: "var(--gradient-primary)", color: "var(--background)" }}>
            {currentUser.avatar}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{currentUser.name}</div>
            <div className="truncate text-xs text-muted-foreground">{currentUser.goal}</div>
          </div>
        </div>
        <XPBar />
        <StreakPill />
        <div className="text-[11px] text-muted-foreground">
          Next goal: <span className="text-foreground">Hit Lv 15</span> · {currentUser.xpToNext - currentUser.xp} XP to go
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-white/5 sticky top-0 h-screen">
        {SideContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden glass !rounded-none animate-fade-up">
            {SideContent}
          </aside>
        </>
      )}

      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-background/60 px-4 py-3 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden grid size-9 place-items-center rounded-lg border border-white/10"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="hidden sm:block min-w-0">
            <div className="text-xs text-muted-foreground">Welcome back</div>
            <div className="truncate font-semibold">{currentUser.name}</div>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block w-40 md:w-56">
              <XPBar />
            </div>
            <StreakPill />
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
