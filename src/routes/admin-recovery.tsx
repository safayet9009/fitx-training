import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  bootstrapAdmin,
  getAdminStatus,
  promoteToAdmin,
  sendAdminResetLink,
} from "@/lib/admin-recovery.functions";
import { ShieldCheck, AlertTriangle, RefreshCw, KeyRound, UserPlus, Mail, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin-recovery")({
  head: () => ({ meta: [{ title: "Admin Recovery — FitX" }] }),
  component: AdminRecovery,
});

const ADMIN_EMAIL = "shafayethossainai@gmail.com";

type Status = {
  exists: boolean;
  userId: string | null;
  emailConfirmed: boolean;
  hasProfile: boolean;
  isAdmin: boolean;
  roles?: string[];
};

function AdminRecovery() {
  const fetchStatus = useServerFn(getAdminStatus);
  const fnBootstrap = useServerFn(bootstrapAdmin);
  const fnPromote = useServerFn(promoteToAdmin);
  const fnReset = useServerFn(sendAdminResetLink);

  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<any>(null);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const s = await fetchStatus({ data: { email: ADMIN_EMAIL } });
      setStatus(s as Status);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function run(fn: () => Promise<any>, success: string) {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      await refresh();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  const onBootstrap = () => {
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    run(() => fnBootstrap({ data: { email: ADMIN_EMAIL, password } }),
      "Admin account is ready. Sign in with the password you just set.");
  };

  const onPromote = () =>
    run(() => fnPromote({ data: { email: ADMIN_EMAIL } }), "Account promoted to admin.");

  const onSendReset = () =>
    run(
      () => fnReset({ data: { email: ADMIN_EMAIL, redirectTo: `${window.location.origin}/reset-password` } }),
      "Password reset email sent. Check the inbox.",
    );

  return (
    <div className="min-h-screen px-4 py-10 lg:py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <ShieldCheck className="size-5 text-background" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Recovery</h1>
            <p className="text-sm text-muted-foreground">Development utility for {ADMIN_EMAIL}</p>
          </div>
        </div>

        {/* Diagnostics */}
        <section className="glass p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Admin Status</h2>
            <button onClick={refresh} className="chip" disabled={loading}>
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          {loading && <div className="text-sm text-muted-foreground">Checking…</div>}
          {status && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Stat label="Auth user exists" ok={status.exists} />
              <Stat label="Email confirmed" ok={status.emailConfirmed} />
              <Stat label="Profile row" ok={status.hasProfile} />
              <Stat label="Has admin role" ok={status.isAdmin} />
              <div className="col-span-2 text-xs text-muted-foreground break-all">
                User ID: {status.userId ?? "—"} · Roles: {status.roles?.join(", ") || "none"}
              </div>
            </div>
          )}
        </section>

        {/* Current session */}
        <section className="glass p-5 space-y-2">
          <h2 className="font-semibold">Current Session</h2>
          <div className="text-sm text-muted-foreground">
            {session ? (
              <>Signed in as <span className="text-foreground">{session.user.email}</span> · {session.user.id}</>
            ) : (
              "Not signed in"
            )}
          </div>
        </section>

        {msg && (
          <div className="glass p-4 text-sm flex gap-2" style={{ borderColor: "var(--neon-green)" }}>
            <CheckCircle2 className="size-4 neon-text-green shrink-0" /> {msg}
          </div>
        )}
        {err && (
          <div className="glass p-4 text-sm flex gap-2 text-red-300">
            <AlertTriangle className="size-4 shrink-0" /> {err}
          </div>
        )}

        {/* Actions */}
        <section className="glass p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><KeyRound className="size-4" /> Create or Reset Admin Password</h2>
          <p className="text-xs text-muted-foreground">
            Creates the admin account if missing, or resets its password and confirms the email. Assigns the admin role.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New admin password (min 8 chars)"
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm"
            />
            <button onClick={onBootstrap} disabled={busy} className="btn-primary">
              <UserPlus className="size-4" /> Apply
            </button>
          </div>
        </section>

        <section className="glass p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><ShieldCheck className="size-4" /> Promote Existing Account</h2>
          <p className="text-xs text-muted-foreground">
            If the admin account already exists but is missing the admin role, grant it here.
          </p>
          <button onClick={onPromote} disabled={busy || !status?.exists} className="btn-secondary">
            Grant admin role
          </button>
        </section>

        <section className="glass p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Mail className="size-4" /> Send Password Reset Email</h2>
          <p className="text-xs text-muted-foreground">
            Sends a Supabase recovery link to {ADMIN_EMAIL}. The link opens /reset-password.
          </p>
          <button onClick={onSendReset} disabled={busy || !status?.exists} className="btn-secondary">
            Send reset link
          </button>
        </section>

        <p className="text-xs text-muted-foreground text-center">
          This page never reveals passwords or session secrets. All privileged calls are scoped to the designated admin email.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span>{label}</span>
      <span className={ok ? "neon-text-green" : "text-red-300"}>{ok ? "Yes" : "No"}</span>
    </div>
  );
}
