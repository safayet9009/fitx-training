import { supabase } from "@/integrations/supabase/client";

export type LeaderEntry = { id: string; name: string; xp: number; level: number; rank: number };

export const leaderboardService = {
  async global(limit = 50): Promise<LeaderEntry[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,xp,level")
      .order("xp", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r, i) => ({ ...r, rank: i + 1 })) as LeaderEntry[];
  },

  async weekly(limit = 50): Promise<LeaderEntry[]> {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data, error } = await supabase
      .from("workouts")
      .select("user_id, xp_earned, profiles!inner(id,name,level)")
      .gte("created_at", since.toISOString());
    if (error) throw error;
    const agg = new Map<string, { id: string; name: string; level: number; xp: number }>();
    for (const row of (data ?? []) as any[]) {
      const p = row.profiles;
      if (!p) continue;
      const cur = agg.get(p.id) ?? { id: p.id, name: p.name, level: p.level, xp: 0 };
      cur.xp += row.xp_earned ?? 0;
      agg.set(p.id, cur);
    }
    return [...agg.values()]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  },
};
