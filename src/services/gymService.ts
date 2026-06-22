import { supabase } from "@/integrations/supabase/client";

export type GymCenter = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string | null;
  monthly_fee: number;
  facilities: string[];
};

export type GymRegistration = {
  id: string;
  user_id: string;
  center_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  processed_at: string | null;
};

export const gymService = {
  async listCenters(): Promise<GymCenter[]> {
    const { data, error } = await supabase.from("gym_centers").select("*").order("city").order("name");
    if (error) throw error;
    return (data ?? []) as GymCenter[];
  },
  async createCenter(c: Omit<GymCenter, "id">) {
    const { error } = await supabase.from("gym_centers").insert(c);
    if (error) throw error;
  },
  async deleteCenter(id: string) {
    const { error } = await supabase.from("gym_centers").delete().eq("id", id);
    if (error) throw error;
  },
  async register(user_id: string, center_id: string) {
    const { error } = await supabase.from("gym_registrations").insert({ user_id, center_id });
    if (error) throw error;
  },
  async listRegistrations(): Promise<(GymRegistration & { profiles?: { name: string; email: string } | null; gym_centers?: { name: string } | null })[]> {
    const { data, error } = await supabase
      .from("gym_registrations")
      .select("*, profiles(name,email), gym_centers(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as any;
  },
  async myRegistrations(user_id: string) {
    const { data, error } = await supabase
      .from("gym_registrations")
      .select("*, gym_centers(name,city)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async decide(id: string, status: "approved" | "rejected") {
    const { error } = await supabase.from("gym_registrations").update({ status }).eq("id", id);
    if (error) throw error;
  },
};
