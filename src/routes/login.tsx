import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";
import { Button, Field, Input } from "@/components/ui-kit";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FitX" }, { name: "description", content: "Sign back into FitX." }] }),
  component: Login,
});

function Login() {
  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="glass w-full max-w-md p-7 animate-fade-up">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <Dumbbell className="size-5 text-background" />
          </div>
          <span className="font-display text-xl font-bold">FitX</span>
        </Link>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick up your streak where you left off.</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Field label="Email"><Input type="email" placeholder="arjun@fitx.app" defaultValue="arjun@fitx.app" /></Field>
          <Field label="Password"><Input type="password" placeholder="••••••••" defaultValue="demopass" /></Field>
          <Link to="/home" className="block"><Button className="w-full">Sign in</Button></Link>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to FitX? <Link to="/signup" className="font-semibold text-foreground hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
