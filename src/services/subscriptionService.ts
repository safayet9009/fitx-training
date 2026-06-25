import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "trial" | "monthly" | "quarterly" | "yearly";
export type PaymentMethod = "bkash" | "nagad" | "rocket";

const planDays: Record<SubscriptionPlan, number> = {
  trial: 7, monthly: 30, quarterly: 90, yearly: 365,
};

export const subscriptionService = {
  async submit(input: {
    user_id: string;
    plan: SubscriptionPlan;
    payment_method: PaymentMethod;
    transaction_id: string;
    sender_number?: string;
    amount?: number;
  }) {
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + planDays[input.plan]);
    const { error } = await supabase.from("subscriptions").insert({
      user_id: input.user_id,
      plan: input.plan,
      payment_method: input.payment_method,
      transaction_id: input.transaction_id,
      sender_number: input.sender_number ?? null,
      amount: input.amount ?? null,
      expires_at: expires_at.toISOString(),
    });
    if (error) throw error;
  },
  async myActive(user_id: string) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw error;
    return data ?? [];
  },
  async listAll() {
    const { data, error } = await supabase
      .from("subscriptions").select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as any[];
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    if (userIds.length === 0) return rows;
    const { data: profs } = await supabase.from("profiles").select("id,name,email").in("id", userIds);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    return rows.map((r) => ({ ...r, profiles: map.get(r.user_id) ?? null }));
  },
  async decide(id: string, status: "active" | "rejected") {
    const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
    if (error) throw error;
  },
};
