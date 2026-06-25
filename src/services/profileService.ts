import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  email: string;
  name: string;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  xp: number;
  level: number;
  streak: number;
  last_active_date: string | null;
  subscription_type: string;
  phone: string | null;
  phone_verified: boolean;
  phone_verified_at: string | null;
};

export const profileService = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Profile | null) ?? null;
  },
  async update(id: string, patch: Partial<Profile>) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) throw error;
  },
  async setPhone(id: string, phone: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ phone, phone_verified: false, phone_verified_at: null })
      .eq("id", id);
    if (error) throw error;
  },
  async markPhoneVerified(id: string, phone: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ phone, phone_verified: true, phone_verified_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
  async listAllForAdmin() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,email,phone,phone_verified,subscription_type,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return false;
    return !!data;
  },
  async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from("user_badges")
      .select("badge_id, unlocked_at, badges(code,name,icon,description,requirement_type,requirement_value)")
      .eq("user_id", userId);
    if (error) throw error;
    return data ?? [];
  },
  async getAllBadges() {
    const { data, error } = await supabase.from("badges").select("*").order("requirement_value");
    if (error) throw error;
    return data ?? [];
  },
};
