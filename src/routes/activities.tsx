import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Dumbbell, MapPin, Home as HomeIcon, Filter } from "lucide-react";
import { PageHeader, Tabs, Badge, StatCard } from "@/components/ui-kit";
import { activities, weeklySummary, type Activity } from "@/lib/mock-data";

export const Route = createFileRoute("/activities")({
  head: () => ({ meta: [{ title: "Activity — FitX" }, { name: "description", content: "Your activity feed." }] }),
  component: ActivitiesPage,
});

type Filter = "all" | Activity["type"];

const icon = (t: Activity["type"]) => t === "gym" ? "🏋️" : t === "run" ? "🏃" : "🏠";

function ActivitiesPage() {
  const [f, setF] = useState<Filter>("all");
  const list = activities.filter((a) => f === "all" || a.type === f);

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" subtitle="Your training feed." />

      <section className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Workouts" value={weeklySummary.workouts} hint="This week" accent="blue" />
        <StatCard label="Minutes" value={weeklySummary.minutes} hint="This week" accent="purple" />
        <StatCard label="Calories" value={weeklySummary.calories} hint="This week" accent="red" icon={<Flame className="size-4" />} />
        <StatCard label="XP" value={`+${weeklySummary.xp}`} hint="This week" accent="green" />
      </section>

      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="size-4 text-muted-foreground" />
        <Tabs<Filter>
          tabs={[
            { id: "all",  label: "All" },
            { id: "gym",  label: "Gym",  icon: <Dumbbell className="size-4" /> },
            { id: "run",  label: "Run",  icon: <MapPin className="size-4" /> },
            { id: "home", label: "Home", icon: <HomeIcon className="size-4" /> },
          ]}
          value={f}
          onChange={setF}
        />
      </div>

      <ul className="grid gap-3">
        {list.map((a) => (
          <li key={a.id} className="glass glass-hover p-5 animate-fade-up">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
              <div className="grid size-12 place-items-center rounded-xl bg-white/5 text-2xl">{icon(a.type)}</div>
              <div className="min-w-0">
                <div className="truncate text-base font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.date}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>⏱ {a.duration}</span>
                  <span>· 🔥 {a.calories} kcal</span>
                </div>
              </div>
              <Badge tone="green">+{a.xp} XP</Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
