import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Zap, Dumbbell, Activity, Award, Settings, LogOut, ShieldCheck, Mail, Phone, Crown, Building2, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader, StatCard, Progress, Badge, Button } from "@/components/ui-kit";
import { useUser } from "@/lib/user-context";
import { workoutService } from "@/services/workoutService";
import { authService } from "@/services/authService";
import { gymService } from "@/services/gymService";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — FitX" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const router = useRouter();
  const { profile, session, level, xpInLevel, xpToNext, bmi, badges, signOut } = useUser();
  const pct = (xpInLevel / xpToNext) * 100;
  const [stats, setStats] = useState({ total: 0, runKm: 0 });
  const [gymMember, setGymMember] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const emailVerified = !!session?.user?.email_confirmed_at || !!(session?.user as any)?.confirmed_at;
  const phoneVerified = !!profile?.phone_verified;
  const isPro = profile?.subscription_type === "pro";

  useEffect(() => {
    if (!profile?.id) return;
    workoutService.listForUser(profile.id, "all", 500).then((ws) => {
      setStats({
        total: ws.length,
        runKm: Math.round(ws.filter((w) => w.workout_type === "running").reduce((s, w) => s + (w.distance_km ?? 0), 0) * 10) / 10,
      });
    });
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    gymService.myRegistrations(profile.id).then((r) => {
      setGymMember(r.some((x: any) => x.status === "approved"));
    });
  }, [profile?.id]);

  const initials = (profile?.name || profile?.email || "U").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  async function onSignOut() {
    await signOut();
    router.navigate({ to: "/login" });
  }

  async function onResendEmail() {
    if (!profile?.email) return;
    setResending(true); setResendMsg(null);
    try {
      await authService.resendVerification(profile.email);
      setResendMsg("Verification email sent. Check your inbox.");
    } catch (e: any) {
      setResendMsg(e.message ?? "Could not resend verification email.");
    } finally { setResending(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your athlete card." />

      <section className="glass p-6 animate-fade-up">
        <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          <div className="grid size-20 place-items-center rounded-3xl font-display text-2xl font-bold text-background animate-badge-glow"
               style={{ background: "var(--gradient-primary)" }}>{initials}</div>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold">{profile?.name || "Athlete"}</h2>
            <div className="text-sm text-muted-foreground">{profile?.email}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="green"><Zap className="size-3.5" /> Lv {level}</Badge>
              <Badge tone="amber"><Flame className="size-3.5" /> {profile?.streak ?? 0}-day streak</Badge>
              <Badge>{profile?.subscription_type ?? "free"}</Badge>
              {emailVerified && <Badge tone="green"><ShieldCheck className="size-3.5" /> Email verified</Badge>}
              {phoneVerified && <Badge tone="green"><ShieldCheck className="size-3.5" /> Phone verified</Badge>}
            </div>
          </div>
          <div className="w-full sm:w-56">
            <div className="text-xs text-muted-foreground mb-2">{xpInLevel}/{xpToNext} XP · {profile?.xp ?? 0} total</div>
            <Progress value={pct} />
          </div>
        </div>
      </section>

      <section className="glass p-6 animate-fade-up">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="size-4 neon-text-green" /> Verification Center
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <VerifyRow
            icon={<Mail className="size-4" />}
            title="Email"
            value={profile?.email ?? "—"}
            ok={emailVerified}
            action={
              emailVerified ? null : (
                <Button onClick={onResendEmail} disabled={resending}>
                  {resending ? "Sending…" : "Resend email"}
                </Button>
              )
            }
            note={resendMsg && !emailVerified ? resendMsg : undefined}
          />
          <VerifyRow
            icon={<Phone className="size-4" />}
            title="Phone"
            value={profile?.phone || "Not added"}
            ok={phoneVerified}
            action={
              <Link to="/verify-phone">
                <Button variant={phoneVerified ? "secondary" : "primary"}>
                  {phoneVerified ? "Update" : profile?.phone ? "Verify" : "Add phone"}
                </Button>
              </Link>
            }
          />
          <VerifyRow
            icon={<Crown className="size-4" />}
            title="Subscription"
            value={(profile?.subscription_type ?? "free").toUpperCase()}
            ok={isPro}
            action={
              !isPro && (
                <Link to="/subscription"><Button>Upgrade</Button></Link>
              )
            }
          />
          <VerifyRow
            icon={<Building2 className="size-4" />}
            title="Gym membership"
            value={gymMember ? "Active member" : "Not a member"}
            ok={gymMember}
            action={
              !gymMember && (
                <Link to="/register-gym"><Button>Register</Button></Link>
              )
            }
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="glass p-5 animate-fade-up">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">BMI</div>
          <div className="mt-1 text-3xl font-bold" style={{ color: bmi.color }}>{bmi.value || "—"}</div>
          <div className="text-sm" style={{ color: bmi.color }}>{bmi.status}</div>
        </div>
        <div className="glass p-5 animate-fade-up">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Height</div>
          <div className="mt-1 text-3xl font-bold">{profile?.height_cm ?? "—"} <span className="text-base text-muted-foreground">cm</span></div>
        </div>
        <div className="glass p-5 animate-fade-up">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Weight</div>
          <div className="mt-1 text-3xl font-bold">{profile?.weight_kg ?? "—"} <span className="text-base text-muted-foreground">kg</span></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total workouts" value={stats.total} accent="blue" icon={<Dumbbell className="size-4" />} />
        <StatCard label="Running distance" value={`${stats.runKm} km`} accent="purple" icon={<Activity className="size-4" />} />
        <StatCard label="Total XP" value={profile?.xp ?? 0} accent="green" icon={<Flame className="size-4" />} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold flex items-center gap-2"><Award className="size-4 neon-text-green" /> Badges</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {badges.map((b) => (
            <div key={b.code} className={`glass p-4 text-center animate-fade-up ${b.unlocked ? "animate-badge-glow" : "opacity-50 grayscale"}`}>
              <div className="text-3xl">{b.icon}</div>
              <div className="mt-2 text-sm font-semibold">{b.name}</div>
              <div className="text-[11px] text-muted-foreground">{b.description}</div>
            </div>
          ))}
          {badges.length === 0 && <div className="col-span-full text-sm text-muted-foreground">Complete workouts to start unlocking badges.</div>}
        </div>
      </section>

      <section className="glass p-6 animate-fade-up">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Settings className="size-4" /> Account</h3>
        <div className="mt-4 grid gap-2">
          <Button variant="destructive" onClick={onSignOut}><LogOut className="size-4" /> Sign out</Button>
        </div>
      </section>
    </div>
  );
}

function VerifyRow({ icon, title, value, ok, action, note }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  ok: boolean;
  action?: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-7 place-items-center rounded-lg bg-white/10">{icon}</span>
            {title}
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">{value}</div>
          {note && <div className="mt-1 text-[11px] text-muted-foreground">{note}</div>}
        </div>
        <div className="flex flex-col items-end gap-2">
          {ok ? (
            <Badge tone="green"><CheckCircle2 className="size-3.5" /> Verified</Badge>
          ) : (
            <Badge tone="red"><XCircle className="size-3.5" /> Not verified</Badge>
          )}
          {action}
        </div>
      </div>
    </div>
  );
}
