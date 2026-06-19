import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, Target } from "lucide-react";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui-kit";
import { bmiInfo } from "@/lib/mock-data";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — FitX" }, { name: "description", content: "Create your FitX account." }] }),
  component: Signup,
});

function Signup() {
  const [height, setHeight] = useState(178);
  const [weight, setWeight] = useState(73);
  const bmi = bmiInfo(height, weight);

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="glass w-full max-w-xl p-7 animate-fade-up">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <Dumbbell className="size-5 text-background" />
          </div>
          <span className="font-display text-xl font-bold">FitX</span>
        </Link>

        <h1 className="text-2xl font-bold">Build your athlete profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">It takes 30 seconds. Your AI coach starts the moment you finish.</p>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <Field label="Full name"><Input placeholder="Your name" defaultValue="Arjun Rahman" /></Field>
          <Field label="Email"><Input type="email" placeholder="you@email.com" /></Field>
          <Field label="Password" hint="At least 8 characters"><Input type="password" /></Field>
          <Field label="Confirm"><Input type="password" /></Field>
          <Field label="Height (cm)">
            <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </Field>
          <Field label="Weight (kg)">
            <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          </Field>

          <div className="sm:col-span-2 glass p-4" style={{ borderColor: `color-mix(in oklab, ${bmi.color} 40%, transparent)` }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">BMI Preview</div>
                <div className="mt-1 text-3xl font-bold" style={{ color: bmi.color }}>{bmi.value || "—"}</div>
                <div className="text-sm font-medium" style={{ color: bmi.color }}>{bmi.status}</div>
              </div>
              <div className="text-right max-w-[60%]">
                <div className="flex items-center justify-end gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  <Target className="size-3.5" /> Suggested goal
                </div>
                <div className="mt-1 text-sm font-semibold">{bmi.goal}</div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Link to="/home"><Button className="w-full">Create account & start training</Button></Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already on FitX? <Link to="/login" className="font-semibold text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
