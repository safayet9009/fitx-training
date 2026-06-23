import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dumbbell, MapPin, Home as HomeIcon, Play, Pause, Save, Timer, RotateCcw, Check,
  Search, PlayCircle, Square, Flame, Trophy,
} from "lucide-react";
import { PageHeader, Tabs, Button, Input, Field, Badge, Progress } from "@/components/ui-kit";
import { VideoModal } from "@/components/video-modal";
import {
  gymExercises, homeExercises, muscleGroups,
  type GymExercise, type HomeExercise, type Difficulty,
} from "@/lib/exercise-library";
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
      <PageHeader title="Workout" subtitle="Train smart with video-guided sessions." />
      <Tabs<Tab>
        tabs={[
          { id: "gym", label: "Gym", icon: <Dumbbell className="size-4" /> },
          { id: "run", label: "Running", icon: <MapPin className="size-4" /> },
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

function diffTone(d: Difficulty): "green" | "amber" | "red" {
  return d === "Beginner" ? "green" : d === "Intermediate" ? "amber" : "red";
}

function VideoThumb({ youtubeId, onPlay }: { youtubeId: string; onPlay: () => void }) {
  return (
    <button
      onClick={onPlay}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40"
    >
      <img
        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
        alt=""
        className="absolute inset-0 size-full object-cover opacity-80 transition group-hover:opacity-100 group-hover:scale-[1.02]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="rounded-full bg-black/60 p-3 backdrop-blur-sm transition group-hover:scale-110">
          <PlayCircle className="size-8 neon-text-green" />
        </span>
      </div>
    </button>
  );
}

/* -------------------- GYM TAB -------------------- */

function GymTab() {
  const { profile, refreshProfile } = useUser();
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<(typeof muscleGroups)[number]>("All");
  const [video, setVideo] = useState<GymExercise | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState<string | null>(null);

  const list = useMemo(() => {
    return gymExercises.filter((e) => {
      if (muscle !== "All" && e.muscle !== muscle) return false;
      if (q && !`${e.name} ${e.muscle}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, muscle]);

  async function log(ex: GymExercise) {
    if (!profile) return;
    setSavingId(ex.id); setErr(null);
    try {
      const calories = ex.caloriesPerSet * ex.sets;
      await workoutService.log({
        user_id: profile.id, workout_type: "gym",
        exercise_name: ex.name, duration_min: Math.max(10, ex.sets * 5), calories,
      });
      await refreshProfile();
      setSavedIds((s) => ({ ...s, [ex.id]: true }));
    } catch (e: any) {
      setErr(e.message ?? "Failed to save");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {muscleGroups.map((m) => (
            <button
              key={m}
              onClick={() => setMuscle(m)}
              className={`chip transition ${
                muscle === m
                  ? "ring-2 ring-[color:var(--neon-green)] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {err && <div className="text-sm text-red-400">{err}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((ex) => {
          const saved = savedIds[ex.id];
          const xp = 40;
          return (
            <div key={ex.id} className="glass glass-hover p-5 animate-fade-up">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">{ex.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone="blue">{ex.muscle}</Badge>
                    <Badge tone={diffTone(ex.difficulty)}>{ex.difficulty}</Badge>
                    <Badge tone="amber"><Flame className="size-3" /> {ex.caloriesPerSet * ex.sets} kcal</Badge>
                  </div>
                </div>
                <Badge tone="green"><Trophy className="size-3" /> +{xp} XP</Badge>
              </div>

              <div className="mt-4">
                <VideoThumb youtubeId={ex.youtubeId} onPlay={() => setVideo(ex)} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <Field label="Sets"><Input type="number" defaultValue={ex.sets} /></Field>
                <Field label="Reps"><Input type="number" defaultValue={ex.reps} /></Field>
                <Field label="Weight (kg)"><Input type="number" defaultValue={ex.weight} /></Field>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Button variant="secondary" onClick={() => setVideo(ex)}>
                  <PlayCircle className="size-4" /> Watch demo
                </Button>
                <Button onClick={() => log(ex)} disabled={!!savingId || saved}>
                  {saved ? (<><Check className="size-4" /> Logged</>)
                    : savingId === ex.id ? "Saving…"
                    : (<><Save className="size-4" /> Log set</>)}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <VideoModal
        open={!!video}
        onClose={() => setVideo(null)}
        youtubeId={video?.youtubeId ?? ""}
        title={video?.videoTitle ?? ""}
        info={video ? [{
          Muscle: video.muscle, Difficulty: video.difficulty,
          Reps: `${video.sets}×${video.reps}`, Calories: video.caloriesPerSet * video.sets,
        } as any] : []}
      />
    </div>
  );
}

/* -------------------- RUN TAB -------------------- */

function RunTab() {
  const { profile, refreshProfile } = useUser();
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "paused" | "stopped">("idle");
  const [km, setKm] = useState(5);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    if (phase === "running") {
      startRef.current = Date.now();
      tickRef.current = window.setInterval(() => {
        const elapsed = baseRef.current + Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000);
        setSeconds(elapsed);
      }, 250);
    }
    return () => {
      if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    };
  }, [phase]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  function onStart() {
    if (phase === "running") return;
    baseRef.current = seconds;
    setPhase("running"); setSaved(false);
  }
  function onPause() {
    if (phase !== "running") return;
    baseRef.current = seconds;
    setPhase("paused");
  }
  function onStop() {
    baseRef.current = seconds;
    setPhase("stopped");
  }
  function onReset() {
    baseRef.current = 0; setSeconds(0); setSaved(false); setPhase("idle");
  }

  const minutes = Math.max(1, Math.round(seconds / 60));
  const calories = Math.round(km * 65);
  const xp = 30;

  async function save() {
    if (!profile) return;
    setBusy(true);
    try {
      await workoutService.log({
        user_id: profile.id, workout_type: "running",
        exercise_name: `Run ${km} km`, duration_min: minutes, calories, distance_km: km,
      });
      await refreshProfile();
      setSaved(true); setPhase("stopped");
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="glass p-6 lg:col-span-2 animate-fade-up">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Live session</div>
          <Badge tone={phase === "running" ? "green" : phase === "paused" ? "amber" : "blue"}>{phase}</Badge>
        </div>
        <div className="mt-2 font-display text-6xl font-bold neon-text-blue tabular-nums">{fmt(seconds)}</div>
        <div className="mt-1 text-sm text-muted-foreground">{km} km · ~{calories} kcal · +{xp} XP</div>

        <div className="mt-6 flex flex-wrap gap-3">
          {phase !== "running" && (
            <Button onClick={onStart}>
              <Play className="size-4" /> {phase === "paused" ? "Resume" : "Start"}
            </Button>
          )}
          {phase === "running" && (
            <Button variant="secondary" onClick={onPause}>
              <Pause className="size-4" /> Pause
            </Button>
          )}
          <Button variant="secondary" onClick={onStop} disabled={phase === "idle"}>
            <Square className="size-4" /> Stop
          </Button>
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>
      </div>

      <div className="glass p-6 space-y-4 animate-fade-up">
        <Field label="Distance (km)">
          <Input type="number" value={km} step="0.1" onChange={(e) => setKm(Number(e.target.value) || 0)} />
        </Field>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] uppercase text-muted-foreground">Mins</div>
            <div className="text-lg font-bold">{minutes}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] uppercase text-muted-foreground">Kcal</div>
            <div className="text-lg font-bold">{calories}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] uppercase text-muted-foreground">XP</div>
            <div className="text-lg font-bold neon-text-green">+{xp}</div>
          </div>
        </div>
        {saved && <Badge tone="green"><Check className="size-3.5" /> Saved · +30 XP</Badge>}
        <Button className="w-full" disabled={busy || saved || seconds < 10} onClick={save}>
          <Save className="size-4" /> {saved ? "Saved" : busy ? "Saving…" : "Save run"}
        </Button>
      </div>
    </div>
  );
}

/* -------------------- HOME TAB -------------------- */

function HomeTab() {
  const { profile, refreshProfile } = useUser();
  const [video, setVideo] = useState<HomeExercise | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!activeId || remaining <= 0) return;
    const t = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => window.clearInterval(t);
  }, [activeId, remaining]);

  const completed = Object.values(done).filter(Boolean).length;
  const pct = Math.round((completed / homeExercises.length) * 100);

  async function complete(ex: HomeExercise) {
    if (!profile) return;
    const dur = ex.duration * ex.rounds;
    await workoutService.log({
      user_id: profile.id, workout_type: "home",
      exercise_name: ex.name, duration_min: Math.max(1, Math.round(dur / 60)),
      calories: ex.caloriesPerRound * ex.rounds,
    });
    await refreshProfile();
    setDone((d) => ({ ...d, [ex.id]: true }));
    setActiveId(null); setRemaining(0);
  }

  return (
    <div className="space-y-5">
      <div className="glass p-5 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Today's home circuit</div>
            <div className="text-xs text-muted-foreground">{completed} / {homeExercises.length} complete</div>
          </div>
          <Badge tone={pct === 100 ? "green" : "blue"}>{pct}%</Badge>
        </div>
        <div className="mt-3"><Progress value={pct} accent={pct === 100 ? "green" : "blue"} /></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {homeExercises.map((ex) => {
          const isDone = !!done[ex.id];
          const isActive = activeId === ex.id;
          return (
            <div key={ex.id} className="glass glass-hover p-5 animate-fade-up">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">{ex.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone="blue">{ex.muscle}</Badge>
                    <Badge tone={diffTone(ex.difficulty)}>{ex.difficulty}</Badge>
                    <Badge tone="amber"><Timer className="size-3" /> {ex.rounds}×{ex.duration}s</Badge>
                  </div>
                </div>
                {isDone && <Badge tone="green"><Check className="size-3" /> Done</Badge>}
              </div>

              <div className="mt-4"><VideoThumb youtubeId={ex.youtubeId} onPlay={() => setVideo(ex)} /></div>

              {isActive && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="text-xs uppercase text-muted-foreground">Time remaining</div>
                  <div className="font-display text-3xl font-bold neon-text-amber tabular-nums">{remaining}s</div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setVideo(ex)}>
                  <PlayCircle className="size-4" /> Watch demo
                </Button>
                {!isActive ? (
                  <Button onClick={() => { setActiveId(ex.id); setRemaining(ex.duration); }} disabled={isDone}>
                    <Play className="size-4" /> Start
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => { setActiveId(null); setRemaining(0); }}>
                    <Pause className="size-4" /> Stop
                  </Button>
                )}
                <Button onClick={() => complete(ex)} disabled={isDone}>
                  <Check className="size-4" /> {isDone ? "Logged" : "Complete +20 XP"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <VideoModal
        open={!!video}
        onClose={() => setVideo(null)}
        youtubeId={video?.youtubeId ?? ""}
        title={video?.videoTitle ?? ""}
        info={video ? [{
          Muscle: video.muscle, Difficulty: video.difficulty,
          Rounds: `${video.rounds}×${video.duration}s`,
          Calories: video.caloriesPerRound * video.rounds,
        } as any] : []}
      />
    </div>
  );
}
