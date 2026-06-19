import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { PageHeader, Button, Field, Input, Badge } from "@/components/ui-kit";
import { currentUser } from "@/lib/mock-data";

export const Route = createFileRoute("/subscription")({
  head: () => ({ meta: [{ title: "Subscription — FitX" }, { name: "description", content: "Upgrade your FitX plan." }] }),
  component: SubscriptionPage,
});

const plans = [
  { id: "monthly", name: "Monthly", price: 990, per: "/mo", popular: false, features: ["Unlimited workouts", "AI coach", "Streak rewards"] },
  { id: "3month", name: "3 Months", price: 2490, per: "/3mo", popular: true, features: ["Everything in Monthly", "Save 16%", "Priority support"] },
  { id: "yearly", name: "Yearly", price: 8990, per: "/yr", popular: false, features: ["Everything in 3 Month", "Save 24%", "Exclusive badges"] },
];

const methods = [
  { id: "bkash",  name: "bKash",  c: "#E2136E" },
  { id: "nagad",  name: "Nagad",  c: "#F58220" },
  { id: "rocket", name: "Rocket", c: "#8C3494" },
];

function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState("3month");
  const [method, setMethod] = useState<string | null>(null);

  // Trial countdown
  const [trial, setTrial] = useState({ d: currentUser.subscription.trialDays, h: 11, m: 23, s: 47 });
  useEffect(() => {
    const t = setInterval(() => setTrial((p) => {
      let { d, h, m, s } = p;
      s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; d--; }
      if (d < 0) { d = h = m = s = 0; }
      return { d, h, m, s };
    }), 1000);
    return () => clearInterval(t);
  }, []);

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
        <Badge tone="amber">Pro Trial</Badge>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {plans.map((p) => {
          const selected = selectedPlan === p.id;
          return (
            <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                    className={`glass glass-hover p-6 text-left transition animate-fade-up relative ${
                      selected ? "ring-2 ring-[color:var(--neon-green)]" : ""
                    }`}>
              {p.popular && (
                <Badge tone="green" >
                  <Sparkles className="size-3.5" /> Most popular
                </Badge>
              )}
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

      <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="glass p-6 animate-fade-up">
          <h3 className="text-lg font-semibold">Choose payment method</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {methods.map((m) => {
              const sel = method === m.id;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)}
                        className={`glass glass-hover p-5 text-left ${sel ? "ring-2 ring-[color:var(--neon-green)]" : ""}`}>
                  <div className="grid size-10 place-items-center rounded-xl text-white font-bold"
                       style={{ background: m.c }}>{m.name[0]}</div>
                  <div className="mt-3 font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground">Mobile wallet</div>
                </button>
              );
            })}
          </div>

          {method && (
            <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] animate-fade-up" onSubmit={(e) => e.preventDefault()}>
              <Field label="Transaction ID"><Input placeholder="e.g. 9KX72ALQ31" /></Field>
              <div className="self-end"><Button>Submit payment</Button></div>
            </form>
          )}
        </div>

        <aside className="glass p-6 animate-fade-up h-fit">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Order summary</div>
          <div className="mt-3 text-2xl font-bold">৳{plans.find((p) => p.id === selectedPlan)!.price.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">{plans.find((p) => p.id === selectedPlan)!.name} plan</div>
          <div className="mt-4 text-sm">Method: <span className="font-semibold">{method ? methods.find((m) => m.id === method)!.name : "—"}</span></div>
        </aside>
      </section>
    </div>
  );
}
