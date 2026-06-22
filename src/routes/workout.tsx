import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Dumbbell, MapPin, Home as HomeIcon, Play, Pause, Save, Timer, RotateCcw, Check } from "lucide-react";
import { PageHeader, Tabs, Button, Input, Field, Badge } from "@/components/ui-kit";
import { gymExercises, homeExercises } from "@/lib/mock-data";
import { useUser } from "@/lib/user-context";
import { workoutService } from "@/services/workoutService";

export const Route = createFileRoute("/workout")({
  head: () => ({ meta: [{ title: "Workout — FitX" }] }),
  component: Workout,
});

type Tab = "gym" | "run" | "home";

function Workout() {
  const [tab, setTab] = useState<Tab>("gym");
  return (
    <div className="space-y-6">
      <PageHeader title="Workout" subtitle="Choose your training mode for today." />
      <Tabs<Tab>
        tabs={[
          { id: "gym",  label: "Gym",  icon: <Dumbbell className="size-4" /> },
          { id: "run",  label: "Running", icon: <MapPin className="size-4" /> },
          { id: "home", label: "Home", icon: <HomeIcon className="size-4" /> },
        ]}
        value={tab} onChange={setTab}
      />
      {tab === "gym" && <GymTab />}
      {tab === "run" && <RunTab />}
      {tab === "home" && <HomeTab />}
    </div>
  );
}

function ExerciseImage({ label }: { label: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0">
      <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
        <div className="text-center"><Dumbbell className="mx-auto size-8 opacity-40" /><div className="mt-2">Tutorial · {label}</div></div>
      </div>
    </div>
  );
}

function GymTab() {
  const { profile, refreshProfile } = useUser();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!profile) return;
    setBusy(true); setErr(null);
    try {
      const names = gymExercises.map((e) => e.name).join(", ");
      await workoutService.log({
        user_id: profile.id, workout_type: "gym",
        exercise_name: `Gym session — ${names}`,
        duration_min: 60, calories: 420,
      });
      await refreshProfile();
      setSaved(true);
    } catch (e: any) { setErr(e.message ?? "Failed to save"); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {gymExercises.map((ex) => (
        <div key={ex.id} className="glass glass-hover p-5 animate-fade-up">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{ex.name}</h3>
              <Badge tone="blue">{ex.muscle}</Badge>
            </div>
            <Badge>{ex.sets} sets</Badge>
          </div>
          <div className="mt-4"><ExerciseImage label={ex.name} /></div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Field label="Sets"><Input type="number" defaultValue={ex.sets} /></Field>
            <Field label="Reps"><Input type="number" defaultValue={ex.reps} /></Field>
            <Field label="Weight (kg)"><Input type="number" defaultValue={ex.weight} /></Field>
          </div>
        </div>
      ))}
      <div className="lg:col-span-2 flex justify-end gap-3 items-center">
        {err && <span className="text-sm text-red-400">{err}</span>}
        {saved && <Badge tone="green"><Check className="size-3.5" /> +40 XP added</Badge>}
        <Button onClick={save} disabled={busy || saved}>
          <Save className="size-4" /> {saved ? "Saved" : busy ? "Saving…" : "Save workout"}
        </Button>
      </div>
    </div>
  );
}

function RunTab() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<number | null>(null);
  const { profile, refreshProfile } = useUser();
  const [km, setKm] = useState(5);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (running) ref.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running]);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  async function save() {
    if (!profile) return;
    setBusy(true);
    try {
      await workoutService.log({
        user_id: profile.id, workout_type: "running",
        exercise_name: `Run ${km} km`,
        duration_min: Math.max(1, Math.round(seconds / 60)),
        calories: Math.round(km * 65),
        distance_km: km,
      });
      await refreshProfile();
      setRunning(false); setSaved(true);
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="glass p-6 lg:col-span-2 animate-fade-up">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Live session</div>
        <div className="mt-2 font-display text-6xl font-bold neon-text-blue tabular-nums">{fmt(seconds)}</div>
        <div className="mt-1 text-sm text-muted-foreground">Tap start to track your run</div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => setRunning((r) => !r)}>
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button variant="secondary" onClick={() => { setRunning(false); setSeconds(0); }}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>
      </div>
      <div className="glass p-6 space-y-4 animate-fade-up">
        <Field label="Distance (km)"><Input type="number" value={km} step="0.1" onChange={(e) => setKm(Number(e.target.value) || 0)} /></Field>
        <Field label="Time (minutes)"><Input type="number" value={Math.max(1, Math.round(seconds/60))} readOnly /></Field>
        {saved && <Badge tone="green"><Check className="size-3.5" /> +30 XP added</Badge>}
        <Button className="w-full" disabled={busy || saved} onClick={save}>
          <Save className="size-4" /> {saved ? "Saved" : busy ? "Saving…" : "Save run"}
        </Button>
      </div>
    </div>
  );
}

function HomeTab() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const { profile, refreshProfile } = useUser();
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeIdx === null || remaining <= 0) return;
    const t = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => window.clearInterval(t);
  }, [activeIdx, remaining]);

  async function complete(name: string, dur: number, key: string) {
    if (!profile) return;
    await workoutService.log({
      user_id: profile.id, workout_type: "home",
      exercise_name: name, duration_min: Math.max(1, Math.round(dur / 60)),
      calories: Math.round(dur * 0.15),
    });
    await refreshProfile();
    setDone((d) => ({ ...d, [key]: true }));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {homeExercises.map((ex, i) => {
        const key = `home-${ex.id}`;
        const isDone = !!done[key];
        return (
          <div key={ex.id} className="glass glass-hover p-5 animate-fade-up">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold">{ex.name}</h3>
                <div className="mt-1 text-xs text-muted-foreground">{ex.rounds} rounds · {ex.duration}s work / {ex.rest}s rest</div>
              </div>
              <Badge tone="amber"><Timer className="size-3.5" /> {activeIdx === i ? remaining : ex.duration}s</Badge>
            </div>
            <div className="mt-4"><ExerciseImage label={ex.name} /></div>
            <div className="mt-4 flex gap-2 items-center">
              <Button onClick={() => { setActiveIdx(i); setRemaining(ex.duration); }}>
                <Play className="size-4" /> Start
              </Button>
              <Button variant="secondary" disabled={isDone}
                onClick={() => { setActiveIdx(null); setRemaining(0); complete(ex.name, ex.duration * ex.rounds, key); }}>
                {isDone ? <><Check className="size-4" /> Done +20 XP</> : "Complete"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
