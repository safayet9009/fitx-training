import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Phone, ShieldCheck, CheckCircle2 } from "lucide-react";
import { PageHeader, Button, Field, Input, Badge } from "@/components/ui-kit";
import { useUser } from "@/lib/user-context";
import { profileService } from "@/services/profileService";

export const Route = createFileRoute("/verify-phone")({
  head: () => ({ meta: [{ title: "Verify phone — FitX" }] }),
  component: VerifyPhonePage,
});

const DEMO_OTP = "123456";

function VerifyPhonePage() {
  const router = useRouter();
  const { profile, refreshProfile } = useUser();
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"enter" | "otp" | "done">("enter");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (profile?.phone) setPhone(profile.phone);
    if (profile?.phone_verified) setStage("done");
  }, [profile?.phone, profile?.phone_verified]);

  useEffect(() => {
    if (seconds <= 0) return;
    timer.current = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [seconds]);

  function startTimer() { setSeconds(45); }

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setErr(null);
    if (!/^[0-9+\-\s]{10,15}$/.test(phone.trim())) {
      setErr("Enter a valid phone number"); return;
    }
    setBusy(true);
    try {
      if (profile?.id) await profileService.setPhone(profile.id, phone.trim());
      // Demo: OTP is 123456
      setStage("otp");
      startTimer();
    } catch (e: any) { setErr(e.message ?? "Failed to send OTP"); }
    finally { setBusy(false); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (otp.trim() !== DEMO_OTP) { setErr("Invalid OTP. Try the demo code 123456."); return; }
    setBusy(true);
    try {
      if (profile?.id) await profileService.markPhoneVerified(profile.id, phone.trim());
      await refreshProfile();
      setStage("done");
    } catch (e: any) { setErr(e.message ?? "Verification failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Phone verification" subtitle="Secure your account with SMS OTP." />

      <div className="glass mx-auto max-w-md p-6 animate-fade-up">
        {stage === "enter" && (
          <form className="space-y-4" onSubmit={sendOtp}>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white/10"><Phone className="size-5" /></div>
              <div>
                <h3 className="font-semibold">Enter your phone</h3>
                <p className="text-xs text-muted-foreground">We'll send a 6-digit code via SMS.</p>
              </div>
            </div>
            <Field label="Phone number">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </Field>
            {err && <div className="text-sm text-red-400">{err}</div>}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending…" : "Send OTP"}</Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Demo mode — use code <span className="font-mono text-foreground">123456</span> on the next screen.
            </p>
          </form>
        )}

        {stage === "otp" && (
          <form className="space-y-4" onSubmit={verify}>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white/10"><ShieldCheck className="size-5" /></div>
              <div>
                <h3 className="font-semibold">Enter the 6-digit code</h3>
                <p className="text-xs text-muted-foreground">Sent to <span className="font-mono">{phone}</span></p>
              </div>
            </div>
            <Field label="OTP code">
              <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric" placeholder="••••••" className="text-center font-mono text-lg tracking-[0.6em]" />
            </Field>
            {err && <div className="text-sm text-red-400">{err}</div>}
            <Button type="submit" className="w-full" disabled={busy || otp.length !== 6}>{busy ? "Verifying…" : "Verify"}</Button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" className="text-muted-foreground hover:text-foreground"
                      onClick={() => setStage("enter")}>← Change number</button>
              <button type="button" disabled={seconds > 0 || busy}
                      onClick={() => sendOtp()}
                      className="text-foreground disabled:text-muted-foreground">
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {stage === "done" && (
          <div className="text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl animate-badge-glow"
                 style={{ background: "color-mix(in oklab, var(--neon-green) 20%, transparent)" }}>
              <CheckCircle2 className="size-9 neon-text-green" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Phone verified</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono">{profile?.phone ?? phone}</span> is now linked to your account.
            </p>
            <div className="mt-3"><Badge tone="green">Verified</Badge></div>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="secondary" onClick={() => { setStage("enter"); setOtp(""); }}>Change number</Button>
              <Button onClick={() => router.navigate({ to: "/profile" })}>Back to profile</Button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-md text-center text-xs text-muted-foreground">
        <Link to="/profile" className="hover:text-foreground">Cancel and return to profile</Link>
      </div>
    </div>
  );
}
