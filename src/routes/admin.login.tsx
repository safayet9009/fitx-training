import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ArrowRight, KeyRound, Mail, Lock } from "lucide-react";
import { Button, Field, Input } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { profileService } from "@/services/profileService";
import { authService } from "@/services/authService";
import { adminSecurity } from "@/lib/admin-security";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Sign-in — FitX" }] }),
  component: AdminLogin,
});

type Step = "credentials" | "pin-setup" | "pin-verify" | "reset";

function AdminLogin() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // If already signed in as admin with valid pin session → straight to /admin
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      const isAdmin = await profileService.isAdmin(data.session.user.id);
      if (!isAdmin) return;
      if (adminSecurity.isPinSessionValid()) router.navigate({ to: "/admin" });
      else {
        const hasPin = await adminSecurity.hasPin();
        setStep(hasPin ? "pin-verify" : "pin-setup");
      }
    })();
  }, [router]);

  async function onCredentials(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const { data: signIn, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const uid = signIn.user!.id;
      const isAdmin = await profileService.isAdmin(uid);
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("This account is not an administrator. Use the regular sign-in page.");
      }
      const hasPin = await adminSecurity.hasPin();
      setStep(hasPin ? "pin-verify" : "pin-setup");
    } catch (e: any) {
      setErr(e.message ?? "Sign in failed");
    } finally { setBusy(false); }
  }

  async function onPinSetup(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pin !== pin2) { setErr("PINs do not match"); return; }
    if (!/^\d{6}$/.test(pin)) { setErr("PIN must be exactly 6 digits"); return; }
    setBusy(true);
    try {
      await adminSecurity.setPin(pin);
      await adminSecurity.log("admin.pin.created");
      adminSecurity.markPinVerified();
      router.navigate({ to: "/admin" });
    } catch (e: any) {
      setErr(e.message ?? "Could not set PIN");
    } finally { setBusy(false); }
  }

  async function onPinVerify(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const ok = await adminSecurity.verifyPin(pin);
      if (!ok) {
        await adminSecurity.log("admin.pin.verify", null as any, "failure");
        throw new Error("Incorrect PIN");
      }
      await adminSecurity.log("admin.login");
      adminSecurity.markPinVerified();
      router.navigate({ to: "/admin" });
    } catch (e: any) {
      setErr(e.message ?? "PIN verification failed");
    } finally { setBusy(false); }
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      await authService.requestPasswordReset(email);
      setMsg("If that email belongs to an account, a reset link has been sent.");
    } catch (e: any) {
      setErr(e.message ?? "Could not send reset email");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="glass w-full max-w-md p-7 animate-fade-up">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <Shield className="size-5 text-background" />
          </div>
          <div>
            <div className="font-display text-xl font-bold">FitX Admin</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Restricted access</div>
          </div>
        </div>

        {step === "credentials" && (
          <>
            <h1 className="text-2xl font-bold">Admin sign-in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Staff access only. Regular users sign in <Link to="/login" className="underline">here</Link>.</p>
            <form className="mt-6 space-y-4" onSubmit={onCredentials}>
              <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" /></Field>
              <Field label="Password"><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
              {err && <div className="text-sm text-red-300">{err}</div>}
              <Button type="submit" disabled={busy} className="w-full justify-center">
                {busy ? "Verifying…" : <>Continue <ArrowRight className="size-4" /></>}
              </Button>
              <button type="button" className="block w-full text-center text-xs text-muted-foreground hover:underline"
                onClick={() => { setStep("reset"); setErr(null); }}>
                Forgot password?
              </button>
            </form>
          </>
        )}

        {step === "pin-setup" && (
          <>
            <h1 className="text-2xl font-bold flex items-center gap-2"><KeyRound className="size-5" /> Set security PIN</h1>
            <p className="mt-1 text-sm text-muted-foreground">Choose a 6-digit PIN. You'll enter it after every admin sign-in.</p>
            <form className="mt-6 space-y-4" onSubmit={onPinSetup}>
              <Field label="New PIN"><Input inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" /></Field>
              <Field label="Confirm PIN"><Input inputMode="numeric" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} placeholder="••••••" /></Field>
              {err && <div className="text-sm text-red-300">{err}</div>}
              <Button type="submit" disabled={busy} className="w-full justify-center">{busy ? "Saving…" : "Save PIN & enter admin"}</Button>
            </form>
          </>
        )}

        {step === "pin-verify" && (
          <>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Lock className="size-5" /> Enter security PIN</h1>
            <p className="mt-1 text-sm text-muted-foreground">Second factor required to enter the admin console.</p>
            <form className="mt-6 space-y-4" onSubmit={onPinVerify}>
              <Field label="6-digit PIN"><Input inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" autoFocus /></Field>
              {err && <div className="text-sm text-red-300">{err}</div>}
              <Button type="submit" disabled={busy} className="w-full justify-center">{busy ? "Verifying…" : "Enter admin console"}</Button>
              <button type="button" className="block w-full text-center text-xs text-muted-foreground hover:underline"
                onClick={async () => { await supabase.auth.signOut(); adminSecurity.clearPinSession(); setStep("credentials"); setPin(""); }}>
                Sign out
              </button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="size-5" /> Reset password</h1>
            <p className="mt-1 text-sm text-muted-foreground">We'll email a recovery link to the admin address.</p>
            <form className="mt-6 space-y-4" onSubmit={onReset}>
              <Field label="Admin email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              {err && <div className="text-sm text-red-300">{err}</div>}
              {msg && <div className="text-sm neon-text-green">{msg}</div>}
              <Button type="submit" disabled={busy} className="w-full justify-center">{busy ? "Sending…" : "Send reset link"}</Button>
              <button type="button" className="block w-full text-center text-xs text-muted-foreground hover:underline"
                onClick={() => { setStep("credentials"); setErr(null); setMsg(null); }}>
                Back to sign-in
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
