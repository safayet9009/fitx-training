import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, Flame, Sparkles, Trophy, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitX — Gamified AI Fitness Platform" },
      { name: "description", content: "Track workouts, build streaks, climb the leaderboard. FitX is the AI fitness OS that turns training into a game." },
      { property: "og:title", content: "FitX — Gamified AI Fitness Platform" },
      { property: "og:description", content: "Track workouts, build streaks, level up." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <Dumbbell className="size-5 text-background" />
          </div>
          <span className="font-display text-xl font-bold">FitX</span>
        </div>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <Link to="/centers" className="hover:text-foreground">Centers</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:inline-flex rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link to="/signup" className="rounded-xl px-4 py-2 text-sm font-semibold text-background"
                style={{ background: "var(--gradient-primary)" }}>
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-12 pb-20 text-center">
        <span className="chip mx-auto"><Sparkles className="size-3.5 neon-text-green" /> AI Fitness OS · v1.0</span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          Train like it's a game.<br />
          <span style={{ background: "var(--gradient-xp)", WebkitBackgroundClip: "text", color: "transparent" }}>
            Level up your body.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          FitX combines Strava-grade tracking, Duolingo-style streaks, and a smart AI coach — all in one premium fitness dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-background"
                style={{ background: "var(--gradient-primary)" }}>
            Start free trial <ArrowRight className="size-4" />
          </Link>
          <Link to="/home" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold">
            Explore dashboard
          </Link>
        </div>

        <div id="features" className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Flame, c: "amber", t: "Streaks", d: "Daily streaks that keep you coming back." },
            { i: Trophy, c: "green", t: "XP & Levels", d: "Earn XP from every workout." },
            { i: Sparkles, c: "blue", t: "AI Coach", d: "Smart plans tuned to your BMI & goals." },
            { i: ShieldCheck, c: "purple", t: "Gym SaaS", d: "Find centers, subscribe, train." },
          ].map((f) => (
            <div key={f.t} className="glass glass-hover p-6 text-left">
              <div className="grid size-10 place-items-center rounded-xl"
                   style={{ background: `color-mix(in oklab, var(--neon-${f.c}) 20%, transparent)`, color: `var(--neon-${f.c})` }}>
                <f.i className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
