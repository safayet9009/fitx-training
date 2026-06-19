import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Zap, Dumbbell, Activity, Sparkles, Trophy, Target, Play } from "lucide-react";
import { PageHeader, StatCard, Progress, Badge, Button } from "@/components/ui-kit";
import { currentUser, dailySummary, activities } from "@/lib/mock-data";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Dashboard — FitX" }, { name: "description", content: "Your FitX dashboard." }] }),
  component: Home,
});

function Home() {
  const pct = (currentUser.xp / currentUser.xpToNext) * 100;
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hey ${currentUser.name.split(" ")[0]} 👋`}
        subtitle="Here's your training game plan for today."
        action={
          <Link to="/workout"><Button><Play className="size-4" /> Start workout</Button></Link>
        }
      />

      {/* Hero status */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass glass-hover lg:col-span-2 p-6 animate-fade-up">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="chip"><Zap className="size-3.5 neon-text-green" /> Level {currentUser.level}</div>
              <h2 className="mt-3 text-2xl font-bold">{currentUser.xp.toLocaleString()} XP</h2>
              <p className="text-sm text-muted-foreground">{currentUser.xpToNext - currentUser.xp} XP to Level {currentUser.level + 1}</p>
            </div>
            <Badge tone="green">+{dailySummary.xpEarnedToday} XP today</Badge>
          </div>
          <div className="mt-5"><Progress value={pct} /></div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link to="/workout" className="glass glass-hover flex items-center gap-3 p-4">
              <div className="grid size-10 place-items-center rounded-xl" style={{ background: "color-mix(in oklab, var(--neon-green) 18%, transparent)", color: "var(--neon-green)" }}>
                <Dumbbell className="size-5" />
              </div>
              <div><div className="text-sm font-semibold">Start Workout</div><div className="text-xs text-muted-foreground">Gym · Run · Home</div></div>
            </Link>
            <Link to="/activities" className="glass glass-hover flex items-center gap-3 p-4">
              <div className="grid size-10 place-items-center rounded-xl" style={{ background: "color-mix(in oklab, var(--neon-blue) 18%, transparent)", color: "var(--neon-blue)" }}>
                <Activity className="size-5" />
              </div>
              <div><div className="text-sm font-semibold">View Activity</div><div className="text-xs text-muted-foreground">Your feed</div></div>
            </Link>
            <Link to="/ai-coach" className="glass glass-hover flex items-center gap-3 p-4">
              <div className="grid size-10 place-items-center rounded-xl" style={{ background: "color-mix(in oklab, var(--neon-purple) 22%, transparent)", color: "var(--neon-purple)" }}>
                <Sparkles className="size-5" />
              </div>
              <div><div className="text-sm font-semibold">AI Coach</div><div className="text-xs text-muted-foreground">Today's plan</div></div>
            </Link>
          </div>
        </div>

        <div className="glass glass-hover p-6 animate-fade-up" style={{ background: "color-mix(in oklab, var(--neon-amber) 14%, transparent)" }}>
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl animate-badge-glow" style={{ background: "var(--gradient-streak)", color: "var(--background)" }}>
              <Flame className="size-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Current streak</div>
              <div className="text-3xl font-bold">{currentUser.streak} days</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Keep the fire alive — train today to extend your streak.</p>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <Target className="size-3.5 neon-text-green" />
            <span>Next goal: 30-day streak badge</span>
          </div>
        </div>
      </section>

      {/* Daily summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Calories burned" value={dailySummary.caloriesBurned} hint="Today" accent="red" icon={<Flame className="size-4" />} />
        <StatCard label="Workouts completed" value={dailySummary.workoutsCompleted} hint="Today" accent="blue" icon={<Dumbbell className="size-4" />} />
        <StatCard label="XP earned" value={`+${dailySummary.xpEarnedToday}`} hint="Today" accent="green" icon={<Trophy className="size-4" />} />
      </section>

      {/* Recent activity */}
      <section className="glass p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent activity</h3>
          <Link to="/activities" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        <ul className="divide-y divide-white/5">
          {activities.slice(0, 4).map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0 flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/5">
                  {a.type === "gym" ? "🏋️" : a.type === "run" ? "🏃" : "🏠"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.date} · {a.duration}</div>
                </div>
              </div>
              <Badge tone="green">+{a.xp} XP</Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
