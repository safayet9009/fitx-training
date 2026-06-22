import { supabase } from "@/integrations/supabase/client";

export const adminService = {
  async listUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,email,xp,level,streak,subscription_type,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async analytics() {
    const [users, workouts, subs] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("workouts").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);
    return {
      totalUsers: users.count ?? 0,
      workouts: workouts.count ?? 0,
      activeSubs: subs.count ?? 0,
    };
  },
};
