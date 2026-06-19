import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Dumbbell, MapPin, Home as HomeIcon, Play, Pause, Save, Timer, RotateCcw } from "lucide-react";
import { PageHeader, Tabs, Button, Input, Field, Badge } from "@/components/ui-kit";
import { gymExercises, homeExercises } from "@/lib/mock-data";

export const Route = createFileRoute("/workout")({
  head: () => ({ meta: [{ title: "Workout — FitX" }, { name: "description", content: "Log gym, running, or home workouts." }] }),
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
        value={tab}
        onChange={setTab}
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
        <div className="text-center">
          <Dumbbell className="mx-auto size-8 opacity-40" />
          <div className="mt-2">Tutorial · {label}</div>
        </div>
      </div>
    </div>
  );
}

function GymTab() {
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
      <div className="lg:col-span-2 flex justify-end">
        <Button><Save className="size-4" /> Save workout</Button>
      </div>
    </div>
  );
}

function RunTab() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running]);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

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
        <Field label="Distance (km)"><Input type="number" placeholder="5.0" defaultValue="5.0" step="0.1" /></Field>
        <Field label="Time (minutes)"><Input type="number" placeholder="32" defaultValue={Math.max(1, Math.round(seconds/60))} /></Field>
        <Button className="w-full"><Save className="size-4" /> Save run</Button>
      </div>
    </div>
  );
}

function HomeTab() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (activeIdx === null) return;
    if (remaining <= 0) return;
    const t = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => window.clearInterval(t);
  }, [activeIdx, remaining]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {homeExercises.map((ex, i) => (
        <div key={ex.id} className="glass glass-hover p-5 animate-fade-up">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{ex.name}</h3>
              <div className="mt-1 text-xs text-muted-foreground">{ex.rounds} rounds · {ex.duration}s work / {ex.rest}s rest</div>
            </div>
            <Badge tone="amber"><Timer className="size-3.5" /> {activeIdx === i ? remaining : ex.duration}s</Badge>
          </div>
          <div className="mt-4"><ExerciseImage label={ex.name} /></div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => { setActiveIdx(i); setRemaining(ex.duration); }}>
              <Play className="size-4" /> Start
            </Button>
            <Button variant="secondary" onClick={() => { setActiveIdx(null); setRemaining(0); }}>
              Complete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
