import { supabase } from "@/integrations/supabase/client";

export const PIN_SESSION_KEY = "fitx_admin_pin_ok_v1";
export const PIN_SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export type AdminPinStatus = { hasPin: boolean };

export const adminSecurity = {
  isPinSessionValid(): boolean {
    if (typeof window === "undefined") return false;
    const raw = sessionStorage.getItem(PIN_SESSION_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < PIN_SESSION_TTL_MS;
  },
  markPinVerified() {
    if (typeof window !== "undefined") sessionStorage.setItem(PIN_SESSION_KEY, String(Date.now()));
  },
  clearPinSession() {
    if (typeof window !== "undefined") sessionStorage.removeItem(PIN_SESSION_KEY);
  },
  async hasPin(): Promise<boolean> {
    const { data, error } = await supabase.rpc("admin_has_pin");
    if (error) return false;
    return !!data;
  },
  async setPin(pin: string): Promise<void> {
    if (!/^\d{6}$/.test(pin)) throw new Error("PIN must be exactly 6 digits");
    const { error } = await supabase.rpc("set_admin_pin", { _pin: pin });
    if (error) throw error;
  },
  async verifyPin(pin: string): Promise<boolean> {
    if (!/^\d{6}$/.test(pin)) return false;
    const { data, error } = await supabase.rpc("verify_admin_pin", { _pin: pin });
    if (error) throw error;
    return !!data;
  },
  async log(action: string, target?: string, status: "success" | "failure" = "success", metadata?: Record<string, unknown>) {
    try {
      const browser = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null;
      await supabase.rpc("log_admin_action", {
        _action: action,
        _target: target ?? null,
        _status: status,
        _browser: browser,
        _ip: null,
        _metadata: metadata ? (metadata as any) : null,
      });
    } catch {
      // logging must never break the action
    }
  },
  async recentLogs(limit = 50) {
    const { data, error } = await supabase
      .from("admin_logs")
      .select("id, admin_id, action, target, status, browser, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },
};
