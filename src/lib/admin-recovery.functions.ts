import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_EMAIL = "shafayethossainai@gmail.com";

const emailSchema = z.object({ email: z.string().email() });
const createSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

function assertAdminEmail(email: string) {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("Recovery is only permitted for the designated admin email.");
  }
}

/** Diagnostic: does the admin auth user / profile / role exist? */
export const getAdminStatus = createServerFn({ method: "GET" })
  .inputValidator((d) => emailSchema.parse(d))
  .handler(async ({ data }) => {
    assertAdminEmail(data.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw error;
    const user = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!user) {
      return { exists: false, userId: null, emailConfirmed: false, hasProfile: false, isAdmin: false };
    }
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, email, name").eq("id", user.id).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    return {
      exists: true,
      userId: user.id,
      emailConfirmed: !!user.email_confirmed_at,
      hasProfile: !!profile,
      isAdmin: (roles ?? []).some((r) => r.role === "admin"),
      roles: (roles ?? []).map((r) => r.role),
    };
  });

/** Create the admin account if missing, set password, confirm email, assign admin role. */
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) => createSchema.parse(d))
  .handler(async ({ data }) => {
    assertAdminEmail(data.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw listErr;
    let user = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());

    if (!user) {
      const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { name: "FitX Admin" },
      });
      if (cErr) throw cErr;
      user = created.user!;
    } else {
      // reset password + confirm email
      const { error: uErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: data.password,
        email_confirm: true,
      });
      if (uErr) throw uErr;
    }

    // Ensure profile exists (trigger usually handles this; idempotent upsert as fallback)
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: user.id, email: data.email, name: "FitX Admin" }, { onConflict: "id" });

    // Ensure admin role
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
    if (rErr) throw rErr;

    return { ok: true, userId: user.id, message: "Admin account is ready. You can now sign in." };
  });

/** Promote an existing account to admin (no password change). */
export const promoteToAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) => emailSchema.parse(d))
  .handler(async ({ data }) => {
    assertAdminEmail(data.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw error;
    const user = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!user) throw new Error("No account exists for this email. Use 'Create admin account' instead.");
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
    if (rErr) throw rErr;
    return { ok: true, userId: user.id };
  });

/** Send Supabase password reset email to the admin address. */
export const sendAdminResetLink = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().email(), redirectTo: z.string().url() }).parse(d))
  .handler(async ({ data }) => {
    assertAdminEmail(data.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
      redirectTo: data.redirectTo,
    });
    if (error) throw error;
    return { ok: true };
  });
