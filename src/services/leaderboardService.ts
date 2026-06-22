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
    const { data: ws, error } = await supabase
      .from("workouts")
      .select("user_id,xp_earned")
      .gte("created_at", since.toISOString());
    if (error) throw error;
    const agg = new Map<string, number>();
    for (const row of ws ?? []) agg.set(row.user_id, (agg.get(row.user_id) ?? 0) + (row.xp_earned ?? 0));
    const ids = [...agg.keys()];
    if (ids.length === 0) return [];
    const { data: profs, error: pErr } = await supabase
      .from("profiles").select("id,name,level").in("id", ids);
    if (pErr) throw pErr;
    return (profs ?? [])
      .map((p) => ({ id: p.id, name: p.name, level: p.level, xp: agg.get(p.id) ?? 0 }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  },
};
