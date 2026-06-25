import { supabase } from "@/integrations/supabase/client";

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
  height_cm: number;
  weight_kg: number;
};

export const authService = {
  async signUp({ email, password, name, height_cm, weight_kg }: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/home` : undefined,
        data: { name, height_cm, weight_kg },
      },
    });
    if (error) throw error;
    // If email confirmation is disabled, a session is returned and the trigger
    // has already created the profile. Otherwise sign-in still works because we
    // configured auto_confirm_email = true.
    if (!data.session) {
      const { error: sErr } = await supabase.auth.signInWithPassword({ email, password });
      if (sErr) throw sErr;
    }
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async requestPasswordReset(email: string) {
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async resendVerification(email: string) {
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/home` : undefined;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
  },
};
