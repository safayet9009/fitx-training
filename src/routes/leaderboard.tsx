import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Crown, Medal, Zap } from "lucide-react";
import { PageHeader, Tabs, Badge } from "@/components/ui-kit";
import { leaderboard as baseLeaderboard } from "@/lib/mock-data";
import { useUser } from "@/lib/user-context";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — FitX" }, { name: "description", content: "XP rankings." }] }),
  component: LeaderboardPage,
});

type Scope = "weekly" | "global";

function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("weekly");
  const { user, level } = useUser();

  const leaderboard = useMemo(() => {
    const merged = baseLeaderboard.map((u) =>
      u.you ? { ...u, name: user.name, xp: user.xp, level } : u
    );
    merged.sort((a, b) => b.xp - a.xp);
    return merged.map((u, i) => ({ ...u, rank: i + 1 }));
  }, [user.name, user.xp, level]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const colors = ["var(--neon-amber)", "var(--neon-blue)", "var(--neon-purple)"];

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" subtitle="Climb the ranks. Earn XP. Defend your streak." />
      <Tabs<Scope>
        tabs={[{ id: "weekly", label: "Weekly" }, { id: "global", label: "Global" }]}
        value={scope}
        onChange={setScope}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {top3.map((u, i) => (
          <div key={u.id}
               className={`glass glass-hover p-5 animate-fade-up ${i === 0 ? "sm:order-2 sm:scale-105" : i === 1 ? "sm:order-1" : "sm:order-3"}`}>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl text-background animate-badge-glow"
                   style={{ background: colors[i] }}>
                {i === 0 ? <Crown className="size-6" /> : <Medal className="size-6" />}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Rank #{u.rank}</div>
                <div className="font-semibold">{u.name}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge tone="green"><Zap className="size-3.5" /> Lv {u.level}</Badge>
              <span className="font-display text-xl font-bold neon-text-green">{u.xp.toLocaleString()} XP</span>
            </div>
          </div>
        ))}
      </section>

      <section className="glass overflow-hidden">
        <div className="grid grid-cols-[3rem_minmax(0,1fr)_5rem_6rem] gap-3 border-b border-white/5 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span>#</span><span>Athlete</span><span>Level</span><span className="text-right">XP</span>
        </div>
        <ul>
          {rest.map((u) => (
            <li key={u.id}
                className={`grid grid-cols-[3rem_minmax(0,1fr)_5rem_6rem] items-center gap-3 px-5 py-3 transition ${
                  u.you ? "bg-[color:color-mix(in_oklab,var(--neon-green)_14%,transparent)]" : "hover:bg-white/5"
                }`}>
              <span className="font-mono text-sm text-muted-foreground">{u.rank}</span>
              <span className="min-w-0 truncate font-medium">
                {u.name} {u.you && <Badge tone="green">You</Badge>}
              </span>
              <span className="text-sm">Lv {u.level}</span>
              <span className="text-right font-semibold neon-text-green">{u.xp.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
