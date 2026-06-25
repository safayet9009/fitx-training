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
  async register(input: {
    user_id: string;
    center_id: string;
    plan?: string;
    payment_method?: string;
    sender_number?: string;
    transaction_id?: string;
    amount?: number;
  }) {
    const { error } = await supabase.from("gym_registrations").insert(input as any);
    if (error) throw error;
  },
  async listRegistrations() {
    const { data, error } = await supabase
      .from("gym_registrations")
      .select("*, gym_centers(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as any[];
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    if (userIds.length === 0) return rows;
    const { data: profs } = await supabase.from("profiles").select("id,name,email").in("id", userIds);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    return rows.map((r) => ({ ...r, profiles: map.get(r.user_id) ?? null }));
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
