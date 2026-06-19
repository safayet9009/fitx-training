import { createFileRoute } from "@tanstack/react-router";
import { Flame, Zap, Dumbbell, Activity, Award, Settings, Bell, LogOut } from "lucide-react";
import { PageHeader, StatCard, Progress, Badge, Button } from "@/components/ui-kit";
import { currentUser, badges, bmiInfo } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — FitX" }, { name: "description", content: "Your FitX athlete profile." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const pct = (currentUser.xp / currentUser.xpToNext) * 100;
  const bmi = bmiInfo(currentUser.height, currentUser.weight);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your athlete card." />

      {/* Header card */}
      <section className="glass p-6 animate-fade-up">
        <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          <div className="grid size-20 place-items-center rounded-3xl font-display text-2xl font-bold text-background animate-badge-glow"
               style={{ background: "var(--gradient-primary)" }}>
            {currentUser.avatar}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold">{currentUser.name}</h2>
            <div className="text-sm text-muted-foreground">{currentUser.email}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="green"><Zap className="size-3.5" /> Lv {currentUser.level}</Badge>
              <Badge tone="amber"><Flame className="size-3.5" /> {currentUser.streak}-day streak</Badge>
              <Badge>{currentUser.goal}</Badge>
            </div>
          </div>
          <div className="w-full sm:w-56">
            <div className="text-xs text-muted-foreground mb-2">{currentUser.xp}/{currentUser.xpToNext} XP</div>
            <Progress value={pct} />
          </div>
        </div>
      </section>

      {/* Health */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="glass p-5 animate-fade-up">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">BMI</div>
          <div className="mt-1 text-3xl font-bold" style={{ color: bmi.color }}>{bmi.value}</div>
          <div className="text-sm" style={{ color: bmi.color }}>{bmi.status}</div>
        </div>
        <div className="glass p-5 animate-fade-up">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Height</div>
          <div className="mt-1 text-3xl font-bold">{currentUser.height} <span className="text-base text-muted-foreground">cm</span></div>
        </div>
        <div className="glass p-5 animate-fade-up">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Weight</div>
          <div className="mt-1 text-3xl font-bold">{currentUser.weight} <span className="text-base text-muted-foreground">kg</span></div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total workouts" value="218" accent="blue" icon={<Dumbbell className="size-4" />} />
        <StatCard label="Running distance" value="312 km" accent="purple" icon={<Activity className="size-4" />} />
        <StatCard label="Calories burned" value="84.2k" accent="red" icon={<Flame className="size-4" />} />
      </section>

      {/* Badges */}
      <section>
        <h2 className="mb-3 text-lg font-semibold flex items-center gap-2"><Award className="size-4 neon-text-green" /> Badges</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {badges.map((b) => (
            <div key={b.id}
                 className={`glass p-4 text-center animate-fade-up ${b.unlocked ? "animate-badge-glow" : "opacity-50 grayscale"}`}>
              <div className="text-3xl">{b.icon}</div>
              <div className="mt-2 text-sm font-semibold">{b.name}</div>
              <div className="text-[11px] text-muted-foreground">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription */}
      <section className="glass p-6 animate-fade-up flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Subscription</div>
          <div className="mt-1 font-semibold">{currentUser.subscription.plan}</div>
          <div className="text-xs text-muted-foreground">Renews {currentUser.subscription.renews}</div>
        </div>
        <Badge tone="green">{currentUser.subscription.status}</Badge>
      </section>

      {/* Settings */}
      <section className="glass p-6 animate-fade-up">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Settings className="size-4" /> Settings</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button variant="secondary"><Bell className="size-4" /> Notifications</Button>
          <Button variant="secondary"><Settings className="size-4" /> Edit profile</Button>
          <Button variant="secondary" className="sm:col-span-2"><LogOut className="size-4" /> Sign out</Button>
        </div>
      </section>
    </div>
  );
}
