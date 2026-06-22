import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Dumbbell, MapPin, Home as HomeIcon, Filter } from "lucide-react";
import { PageHeader, Tabs, Badge, StatCard } from "@/components/ui-kit";
import { useUser } from "@/lib/user-context";
import { workoutService, type Workout, type WorkoutType } from "@/services/workoutService";

export const Route = createFileRoute("/activities")({
  head: () => ({ meta: [{ title: "Activity — FitX" }] }),
  component: ActivitiesPage,
});

type F = "all" | WorkoutType;
const icon = (t: string) => t === "gym" ? "🏋️" : t === "running" ? "🏃" : "🏠";

function ActivitiesPage() {
  const { profile } = useUser();
  const [f, setF] = useState<F>("all");
  const [list, setList] = useState<Workout[]>([]);
  const [weekly, setWeekly] = useState({ workouts: 0, minutes: 0, calories: 0, xp: 0 });

  useEffect(() => {
    if (!profile?.id) return;
    workoutService.listForUser(profile.id, f, 100).then(setList);
    workoutService.weeklyStats(profile.id).then(setWeekly);
  }, [profile?.id, f]);

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" subtitle="Your training feed." />

      <section className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Workouts" value={weekly.workouts} hint="This week" accent="blue" />
        <StatCard label="Minutes" value={weekly.minutes} hint="This week" accent="purple" />
        <StatCard label="Calories" value={weekly.calories} hint="This week" accent="red" icon={<Flame className="size-4" />} />
        <StatCard label="XP" value={`+${weekly.xp}`} hint="This week" accent="green" />
      </section>

      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="size-4 text-muted-foreground" />
        <Tabs<F>
          tabs={[
            { id: "all",  label: "All" },
            { id: "gym",  label: "Gym",  icon: <Dumbbell className="size-4" /> },
            { id: "running", label: "Run", icon: <MapPin className="size-4" /> },
            { id: "home", label: "Home", icon: <HomeIcon className="size-4" /> },
          ]}
          value={f} onChange={setF}
        />
      </div>

      {list.length === 0 ? (
        <div className="glass p-8 text-center text-sm text-muted-foreground">No activities yet — log a workout to fill your feed.</div>
      ) : (
        <ul className="grid gap-3">
          {list.map((a) => (
            <li key={a.id} className="glass glass-hover p-5 animate-fade-up">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
                <div className="grid size-12 place-items-center rounded-xl bg-white/5 text-2xl">{icon(a.workout_type)}</div>
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">{a.exercise_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>⏱ {a.duration_min} min</span>
                    <span>· 🔥 {a.calories} kcal</span>
                    {a.distance_km && <span>· 📍 {a.distance_km} km</span>}
                  </div>
                </div>
                <Badge tone="green">+{a.xp_earned} XP</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
