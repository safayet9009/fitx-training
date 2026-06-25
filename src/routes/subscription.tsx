import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { PageHeader, Button, Field, Input, Badge } from "@/components/ui-kit";

function cell(v: boolean | string) {
  if (v === true) return <Check className="size-4 neon-text-green" />;
  if (v === false) return <X className="size-4 text-muted-foreground/50" />;
  return <span className="text-xs text-muted-foreground">{v}</span>;
}
import { useUser } from "@/lib/user-context";
import { subscriptionService, type PaymentMethod, type SubscriptionPlan } from "@/services/subscriptionService";

export const Route = createFileRoute("/subscription")({
  head: () => ({ meta: [{ title: "Subscription — FitX" }] }),
  component: SubscriptionPage,
});

const plans: { id: SubscriptionPlan; name: string; price: number; per: string; popular: boolean; features: string[] }[] = [
  { id: "monthly",   name: "Monthly",  price: 990,  per: "/mo",  popular: false, features: ["Unlimited workouts", "AI coach", "Streak rewards"] },
  { id: "quarterly", name: "3 Months", price: 2490, per: "/3mo", popular: true,  features: ["Everything in Monthly", "Save 16%", "Priority support"] },
  { id: "yearly",    name: "Yearly",   price: 8990, per: "/yr",  popular: false, features: ["Everything in 3 Month", "Save 24%", "Exclusive badges"] },
];

const methods: { id: PaymentMethod; name: string; c: string }[] = [
  { id: "bkash",  name: "bKash",  c: "#E2136E" },
  { id: "nagad",  name: "Nagad",  c: "#F58220" },
  { id: "rocket", name: "Rocket", c: "#8C3494" },
];

function SubscriptionPage() {
  const { profile } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("quarterly");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [txn, setTxn] = useState("");
  const [sender, setSender] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [mine, setMine] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    subscriptionService.myActive(profile.id).then(setMine);
  }, [profile?.id, done]);

  // Trial countdown (visual only)
  const [trial, setTrial] = useState({ d: 6, h: 11, m: 23, s: 47 });
  useEffect(() => {
    const t = setInterval(() => setTrial((p) => {
      let { d, h, m, s } = p;
      s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; d--; }
      if (d < 0) { d = h = m = s = 0; }
      return { d, h, m, s };
    }), 1000);
    return () => clearInterval(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !method) return;
    setBusy(true);
    try {
      await subscriptionService.submit({
        user_id: profile.id, plan: selectedPlan, payment_method: method, transaction_id: txn,
        sender_number: sender, amount: plans.find((p) => p.id === selectedPlan)!.price,
      });
      setDone(true); setTxn(""); setSender(""); setMethod(null);
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Subscription" subtitle="Unlock the full FitX experience." />

      <section className="glass p-6 animate-fade-up flex flex-wrap items-center justify-between gap-4"
               style={{ background: "color-mix(in oklab, var(--neon-amber) 14%, transparent)" }}>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Free trial ends in</div>
          <div className="mt-1 font-display text-3xl font-bold tabular-nums">
            {String(trial.d).padStart(2,"0")}d {String(trial.h).padStart(2,"0")}h {String(trial.m).padStart(2,"0")}m {String(trial.s).padStart(2,"0")}s
          </div>
        </div>
        <Badge tone="amber">{profile?.subscription_type ?? "free"}</Badge>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {plans.map((p) => {
          const selected = selectedPlan === p.id;
          return (
            <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                    className={`glass glass-hover p-6 text-left transition animate-fade-up relative ${selected ? "ring-2 ring-[color:var(--neon-green)]" : ""}`}>
              {p.popular && <Badge tone="green"><Sparkles className="size-3.5" /> Most popular</Badge>}
              <h3 className="mt-2 text-lg font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold">৳{p.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">{p.per}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="size-4 neon-text-green" /> {f}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </section>

      <section className="glass animate-fade-up overflow-x-auto p-6">
        <h3 className="text-lg font-semibold">Compare plans</h3>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Feature</th>
              <th className="py-2 pr-3 font-medium">Free Trial</th>
              <th className="py-2 pr-3 font-medium">Pro</th>
              <th className="py-2 pr-3 font-medium">Gym Member Pro</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:border-t [&_tr]:border-white/5">
            {[
              ["Unlimited workout logging", true, true, true],
              ["AI Coach recommendations", true, true, true],
              ["XP, streak & badges", true, true, true],
              ["Leaderboard ranking", true, true, true],
              ["Video exercise library", "Limited", true, true],
              ["Priority support", false, true, true],
              ["Exclusive Pro badges", false, true, true],
              ["Branch gym access", false, false, true],
              ["Personal trainer sessions", false, false, true],
            ].map(([feature, t, p, g]) => (
              <tr key={String(feature)}>
                <td className="py-2.5 pr-3 font-medium">{feature}</td>
                <td className="py-2.5 pr-3">{cell(t)}</td>
                <td className="py-2.5 pr-3">{cell(p)}</td>
                <td className="py-2.5 pr-3">{cell(g)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 text-xs text-muted-foreground">
          Current plan: <Badge tone={profile?.subscription_type === "pro" ? "green" : "amber"}>{profile?.subscription_type ?? "free"}</Badge>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="glass p-6 animate-fade-up">
          <h3 className="text-lg font-semibold">Choose payment method</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {methods.map((m) => {
              const sel = method === m.id;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)}
                        className={`glass glass-hover p-5 text-left ${sel ? "ring-2 ring-[color:var(--neon-green)]" : ""}`}>
                  <div className="grid size-10 place-items-center rounded-xl text-white font-bold" style={{ background: m.c }}>{m.name[0]}</div>
                  <div className="mt-3 font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">Mobile wallet</div>
                </button>
              );
            })}
          </div>

          {method && (
            <form className="mt-6 grid gap-3 sm:grid-cols-2 animate-fade-up" onSubmit={submit}>
              <Field label="Sender number"><Input required value={sender} onChange={(e) => setSender(e.target.value)} placeholder="01XXXXXXXXX" /></Field>
              <Field label="Transaction ID"><Input required value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="e.g. 9KX72ALQ31" /></Field>
              <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit payment for review"}</Button></div>
            </form>
          )}

          {done && <div className="mt-4 text-sm text-[color:var(--neon-green)]">Payment submitted — pending admin approval.</div>}
        </div>

        <aside className="glass p-6 animate-fade-up h-fit">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Order summary</div>
          <div className="mt-3 text-2xl font-bold">৳{plans.find((p) => p.id === selectedPlan)!.price.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">{plans.find((p) => p.id === selectedPlan)!.name} plan</div>
          <div className="mt-4 text-sm">Method: <span className="font-semibold">{method ? methods.find((m) => m.id === method)!.name : "—"}</span></div>

          {mine.length > 0 && (
            <div className="mt-5 border-t border-white/5 pt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Your submissions</div>
              <ul className="space-y-2 text-xs">
                {mine.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span>{s.plan} · {s.payment_method}</span>
                    <Badge tone={s.status === "active" ? "green" : s.status === "rejected" ? "red" : "blue"}>{s.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
