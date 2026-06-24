import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import { Button, Field, Input } from "@/components/ui-kit";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — FitX" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Supabase auth-helpers parses the recovery token from the URL hash on mount.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");
    setBusy(true);
    try {
      await authService.updatePassword(pw);
      setOk(true);
      setTimeout(() => router.navigate({ to: "/home" }), 1200);
    } catch (e: any) {
      setErr(e.message ?? "Could not update password");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="glass w-full max-w-md p-7 animate-fade-up">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <Dumbbell className="size-5 text-background" />
          </div>
          <span className="font-display text-xl font-bold">FitX</span>
        </Link>
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ready ? "Choose a strong password to finish recovery." : "Waiting for recovery link…"}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label="New password">
            <Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label="Confirm password">
            <Input type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" />
          </Field>
          {err && <div className="text-sm text-red-400">{err}</div>}
          {ok && <div className="text-sm text-emerald-400">Password updated — redirecting…</div>}
          <Button type="submit" className="w-full" disabled={busy || !ready || ok}>
            {busy ? "Updating…" : "Update password"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-semibold text-foreground hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
