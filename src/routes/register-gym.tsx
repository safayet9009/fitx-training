import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Clock, XCircle, ChevronRight, ChevronLeft, Building2, User,
  CreditCard, Sparkles, Check,
} from "lucide-react";
import { PageHeader, Button, Badge, Field, Input, Select, Tabs } from "@/components/ui-kit";
import { useUser } from "@/lib/user-context";
import { gymService, type GymCenter } from "@/services/gymService";
import { getCenterMeta } from "@/lib/center-meta";

export const Route = createFileRoute("/register-gym")({
  head: () => ({ meta: [{ title: "Register — FitX" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ center: (s.center as string) ?? undefined }),
  component: RegisterGym,
});

type View = "new" | "mine";

function RegisterGym() {
  const [view, setView] = useState<View>("new");
  return (
    <div className="space-y-6">
      <PageHeader title="Gym registration" subtitle="Join a FitX branch in 5 quick steps." />
      <Tabs<View>
        tabs={[
          { id: "new", label: "New registration", icon: <Sparkles className="size-4" /> },
          { id: "mine", label: "My requests", icon: <Clock className="size-4" /> },
        ]}
        value={view}
        onChange={setView}
      />
      {view === "new" ? <WizardFlow /> : <MyRequests />}
    </div>
  );
}

const STEPS = ["Branch", "Personal", "Plan", "Payment", "Confirm"] as const;
type Plan = "monthly" | "quarterly" | "yearly";
type PayMethod = "bkash" | "nagad";

const PLAN_INFO: Record<Plan, { label: string; mult: number; per: string; badge?: string }> = {
  monthly:   { label: "Monthly",  mult: 1,   per: "/mo" },
  quarterly: { label: "3 Months", mult: 2.6, per: "/3mo", badge: "Save 13%" },
  yearly:    { label: "Yearly",   mult: 10,  per: "/yr",  badge: "Save 17%" },
};

function WizardFlow() {
  const { profile } = useUser();
  const search = Route.useSearch();
  const [step, setStep] = useState(0);
  const [centers, setCenters] = useState<GymCenter[]>([]);
  const [centerId, setCenterId] = useState<string>("");
  const [info, setInfo] = useState({ name: "", phone: "", age: "", gender: "male", goal: "Build muscle" });
  const [plan, setPlan] = useState<Plan>("monthly");
  const [method, setMethod] = useState<PayMethod>("bkash");
  const [txn, setTxn] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { gymService.listCenters().then(setCenters); }, []);
  useEffect(() => { if (search.center) setCenterId(search.center); }, [search.center]);
  useEffect(() => {
    if (profile?.name && !info.name) setInfo((i) => ({ ...i, name: profile.name ?? "" }));
  }, [profile?.name]);

  const center = useMemo(() => centers.find((c) => c.id === centerId) ?? null, [centers, centerId]);
  const meta = center ? getCenterMeta(center.name) : null;
  const price = center ? Math.round(center.monthly_fee * PLAN_INFO[plan].mult) : 0;

  const canNext = () => {
    if (step === 0) return !!centerId;
    if (step === 1) return info.name.trim() && info.phone.trim() && info.age;
    if (step === 2) return !!plan;
    if (step === 3) return !!method && txn.trim().length >= 4;
    return true;
  };

  async function submit() {
    if (!profile || !center) return;
    setSubmitting(true);
    try {
      await gymService.register({
        user_id: profile.id,
        center_id: center.id,
        plan,
        payment_method: method,
        sender_number: info.phone,
        transaction_id: txn,
        amount: price,
      });
      setDone(true);
    } finally { setSubmitting(false); }
  }

  if (done) {
    return (
      <div className="glass animate-fade-up p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl"
             style={{ background: "color-mix(in oklab, var(--neon-green) 20%, transparent)" }}>
          <CheckCircle2 className="size-9 neon-text-green" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">Registration submitted</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your request for <span className="font-semibold text-foreground">{center?.name}</span> is now{" "}
          <Badge tone="blue">Pending approval</Badge>
        </p>
        <div className="mx-auto mt-6 grid max-w-md gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm">
          <SummaryRow k="Branch" v={center?.name ?? ""} />
          <SummaryRow k="Plan" v={`${PLAN_INFO[plan].label} · ৳${price.toLocaleString()}`} />
          <SummaryRow k="Method" v={method === "bkash" ? "bKash" : "Nagad"} />
          <SummaryRow k="Transaction" v={txn} />
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/home"><Button variant="secondary">Back to dashboard</Button></Link>
          <Button onClick={() => { setDone(false); setStep(0); setTxn(""); }}>Register another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Stepper step={step} />

      <div className="glass animate-fade-up p-6">
        {step === 0 && (
          <Step title="Choose your branch" icon={<Building2 className="size-5" />}>
            <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {centers.map((c) => {
                const sel = centerId === c.id;
                return (
                  <button key={c.id} onClick={() => setCenterId(c.id)}
                    className={`rounded-xl border bg-white/5 p-4 text-left transition ${
                      sel ? "border-[color:var(--neon-green)] ring-2 ring-[color:var(--neon-green)]/40"
                          : "border-white/10 hover:bg-white/10"
                    }`}>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.city} · {c.address}</div>
                    <div className="mt-2"><Badge tone="green">৳{c.monthly_fee}/mo</Badge></div>
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title="Personal information" icon={<User className="size-5" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /></Field>
              <Field label="Phone"><Input value={info.phone} placeholder="01XXXXXXXXX" onChange={(e) => setInfo({ ...info, phone: e.target.value })} /></Field>
              <Field label="Age"><Input type="number" value={info.age} onChange={(e) => setInfo({ ...info, age: e.target.value })} /></Field>
              <Field label="Gender">
                <Select value={info.gender} onChange={(e) => setInfo({ ...info, gender: e.target.value })}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </Select>
              </Field>
              <Field label="Fitness goal">
                <Select value={info.goal} onChange={(e) => setInfo({ ...info, goal: e.target.value })}>
                  <option>Build muscle</option><option>Lose weight</option>
                  <option>Improve endurance</option><option>General fitness</option>
                </Select>
              </Field>
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step title="Pick a membership plan" icon={<Sparkles className="size-5" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(PLAN_INFO) as Plan[]).map((p) => {
                const sel = plan === p; const pi = PLAN_INFO[p];
                const amt = center ? Math.round(center.monthly_fee * pi.mult) : 0;
                return (
                  <button key={p} onClick={() => setPlan(p)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      sel ? "border-[color:var(--neon-green)] ring-2 ring-[color:var(--neon-green)]/40 bg-white/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}>
                    <div className="font-semibold">{pi.label}</div>
                    <div className="mt-2 font-display text-2xl font-bold">
                      ৳{amt.toLocaleString()}<span className="text-sm text-muted-foreground">{pi.per}</span>
                    </div>
                    {pi.badge && <div className="mt-1"><Badge tone="amber">{pi.badge}</Badge></div>}
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        {step === 3 && meta && (
          <Step title="Payment" icon={<CreditCard className="size-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["bkash", "nagad"] as PayMethod[]).map((p) => {
                const sel = method === p;
                const num = p === "bkash" ? meta.bkash : meta.nagad;
                const color = p === "bkash" ? "#E2136E" : "#F58220";
                return (
                  <button key={p} onClick={() => setMethod(p)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      sel ? "border-[color:var(--neon-green)] ring-2 ring-[color:var(--neon-green)]/40 bg-white/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg font-bold text-white" style={{ background: color }}>
                        {p[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold capitalize">{p}</div>
                        <div className="font-mono text-xs text-muted-foreground">{num}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-muted-foreground">
              Send <span className="font-semibold text-foreground">৳{price.toLocaleString()}</span> to the {method === "bkash" ? "bKash" : "Nagad"} number above, then enter the transaction ID below.
            </div>
            <div className="mt-4">
              <Field label="Transaction ID">
                <Input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="e.g. 9KX72ALQ31" />
              </Field>
            </div>
          </Step>
        )}

        {step === 4 && center && (
          <Step title="Confirm registration" icon={<Check className="size-5" />}>
            <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
              <SummaryRow k="Branch" v={`${center.name} (${center.city})`} />
              <SummaryRow k="Name" v={info.name} />
              <SummaryRow k="Phone" v={info.phone} />
              <SummaryRow k="Goal" v={info.goal} />
              <SummaryRow k="Plan" v={`${PLAN_INFO[plan].label} · ৳${price.toLocaleString()}`} />
              <SummaryRow k="Payment" v={method === "bkash" ? "bKash" : "Nagad"} />
              <SummaryRow k="Txn ID" v={txn} />
            </div>
          </Step>
        )}

        <div className="mt-6 flex justify-between gap-2">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="size-4" /> Back
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep((s) => Math.min(4, s + 1))} disabled={!canNext()}>
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit registration"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="glass flex items-center gap-2 overflow-x-auto p-3 animate-fade-up">
      {STEPS.map((s, i) => {
        const isDone = i < step, active = i === step;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
              isDone ? "bg-[color:var(--neon-green)] text-background"
              : active ? "bg-white/10 text-foreground ring-2 ring-[color:var(--neon-green)]"
              : "bg-white/5 text-muted-foreground"
            }`}>
              {isDone ? <Check className="size-4" /> : i + 1}
            </div>
            <span className={`text-sm ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
          </div>
        );
      })}
    </div>
  );
}

function Step({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><span className="neon-text-green">{icon}</span><h3 className="text-lg font-semibold">{title}</h3></div>
      {children}
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="text-sm font-semibold">{v}</span>
    </div>
  );
}

function MyRequests() {
  const { profile } = useUser();
  const [regs, setRegs] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    gymService.myRegistrations(profile.id).then(setRegs);
  }, [profile?.id]);

  if (regs.length === 0) {
    return (
      <div className="glass space-y-3 p-8 text-center">
        <div className="text-muted-foreground">You haven't submitted any registrations yet.</div>
        <Link to="/centers"><Button>Browse gym centers</Button></Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {regs.map((r) => (
        <div key={r.id} className="glass flex items-center justify-between gap-4 p-5 animate-fade-up">
          <div>
            <div className="font-semibold">{r.gym_centers?.name ?? "Center"}</div>
            <div className="text-xs text-muted-foreground">
              {r.gym_centers?.city} · Submitted {new Date(r.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {r.status === "pending" && <><Clock className="size-5 neon-text-blue" /><Badge tone="blue">Pending</Badge></>}
            {r.status === "approved" && <><CheckCircle2 className="size-5 neon-text-green" /><Badge tone="green">Approved — Pro</Badge></>}
            {r.status === "rejected" && <><XCircle className="size-5" /><Badge tone="red">Rejected</Badge></>}
          </div>
        </div>
      ))}
    </div>
  );
}
