import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Heart, Droplet, Wind, Moon, Activity } from "lucide-react";
import { PageHeader, Badge } from "@/components/ui-kit";
import { useUser } from "@/lib/user-context";

export const Route = createFileRoute("/ai-coach")({
  head: () => ({ meta: [{ title: "AI Coach — FitX" }] }),
  component: AICoach,
});

function planFor(bmi: number) {
  if (!bmi) return { name: "Maintenance plan", focus: "Balanced training" };
  if (bmi > 25) return { name: "Weight loss plan", focus: "Cardio-led, calorie deficit" };
  if (bmi < 18.5) return { name: "Weight gain plan", focus: "Strength + surplus calories" };
  return { name: "Maintenance plan", focus: "Balanced strength + cardio" };
}

const daily = [
  { icon: Heart,    c: "red",   t: "20 min cardio", d: "Zone 2 — keep HR 120-140 bpm" },
  { icon: Wind,     c: "blue",  t: "Stretching",    d: "10 min full body mobility" },
  { icon: Droplet,  c: "blue",  t: "Hydration",     d: "Hit 3L of water by 9 PM" },
  { icon: Activity, c: "green", t: "Push session",  d: "Chest · Shoulders · Triceps" },
];
const week = [
  { day: "Mon", focus: "Push", color: "green" },
  { day: "Tue", focus: "Pull", color: "blue" },
  { day: "Wed", focus: "Run 5K", color: "amber" },
  { day: "Thu", focus: "Legs", color: "purple" },
  { day: "Fri", focus: "Core + Mobility", color: "blue" },
  { day: "Sat", focus: "Long Run", color: "amber" },
  { day: "Sun", focus: "Recovery", color: "green" },
] as const;
const recovery = [
  { icon: Moon, t: "Prioritize 7–8h sleep", d: "Recovery happens overnight." },
  { icon: Droplet, t: "Electrolytes after runs", d: "Replenish sodium & potassium." },
  { icon: Wind, t: "Foam roll calves", d: "Reduces next-day soreness." },
];

function AICoach() {
  const { profile, bmi, level } = useUser();
  const plan = planFor(bmi.value);

  return (
    <div className="space-y-6">
      <PageHeader title="AI Coach" subtitle="Personalized plan based on your BMI, level & streak." />

      <section className="glass p-6 grid gap-4 sm:grid-cols-4 animate-fade-up">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">BMI</div>
          <div className="mt-1 text-2xl font-bold" style={{ color: bmi.color }}>{bmi.value || "—"}</div>
          <Badge tone="green">{bmi.status}</Badge>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Level</div>
          <div className="mt-1 text-2xl font-bold neon-text-green">{level}</div>
          <div className="text-xs text-muted-foreground">{profile?.xp ?? 0} XP</div>
        </div>
        <div className="sm:col-span-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Recommended plan</div>
          <div className="mt-1 text-base font-semibold">{plan.name}</div>
          <p className="mt-1 text-sm text-muted-foreground">{plan.focus} — {bmi.goal}.</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold flex items-center gap-2"><Sparkles className="size-4 neon-text-green" /> Today's plan</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {daily.map((d) => (
            <div key={d.t} className="glass glass-hover p-4 animate-fade-up">
              <div className="grid size-10 place-items-center rounded-xl"
                   style={{ background: `color-mix(in oklab, var(--neon-${d.c}) 18%, transparent)`, color: `var(--neon-${d.c})` }}>
                <d.icon className="size-5" />
              </div>
              <div className="mt-3 font-semibold">{d.t}</div>
              <div className="text-xs text-muted-foreground">{d.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Weekly plan</h2>
        <div className="grid gap-2 sm:grid-cols-7">
          {week.map((w) => (
            <div key={w.day} className="glass p-3 text-center animate-fade-up">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{w.day}</div>
              <div className="mt-2 text-sm font-semibold" style={{ color: `var(--neon-${w.color})` }}>{w.focus}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recovery tips</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {recovery.map((r) => (
            <div key={r.t} className="glass glass-hover p-5 animate-fade-up">
              <r.icon className="size-5 neon-text-blue" />
              <div className="mt-2 font-semibold">{r.t}</div>
              <div className="text-sm text-muted-foreground">{r.d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
