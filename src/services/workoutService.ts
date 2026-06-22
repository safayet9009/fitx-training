import { supabase } from "@/integrations/supabase/client";

export type WorkoutType = "gym" | "running" | "home";
export type Workout = {
  id: string;
  user_id: string;
  workout_type: WorkoutType;
  exercise_name: string;
  duration_min: number;
  calories: number;
  distance_km: number | null;
  xp_earned: number;
  created_at: string;
};

export const workoutService = {
  async log(input: {
    user_id: string;
    workout_type: WorkoutType;
    exercise_name: string;
    duration_min?: number;
    calories?: number;
    distance_km?: number | null;
  }) {
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: input.user_id,
        workout_type: input.workout_type,
        exercise_name: input.exercise_name,
        duration_min: input.duration_min ?? 0,
        calories: input.calories ?? 0,
        distance_km: input.distance_km ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Workout;
  },

  async listForUser(user_id: string, type?: WorkoutType | "all", limit = 50) {
    let q = supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (type && type !== "all") q = q.eq("workout_type", type);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Workout[];
  },

  async weeklyStats(user_id: string) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data, error } = await supabase
      .from("workouts")
      .select("duration_min,calories,xp_earned")
      .eq("user_id", user_id)
      .gte("created_at", since.toISOString());
    if (error) throw error;
    const list = data ?? [];
    return {
      workouts: list.length,
      minutes: list.reduce((s, w) => s + (w.duration_min ?? 0), 0),
      calories: list.reduce((s, w) => s + (w.calories ?? 0), 0),
      xp: list.reduce((s, w) => s + (w.xp_earned ?? 0), 0),
    };
  },
};
