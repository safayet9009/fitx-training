import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Button, Field, Input } from "@/components/ui-kit";
import { authService } from "@/services/authService";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FitX" }, { name: "description", content: "Sign back into FitX." }] }),
  component: Login,
});

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      await authService.signIn(email, password);
      router.navigate({ to: "/home" });
    } catch (e: any) {
      setErr(e.message ?? "Sign in failed");
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
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick up your streak where you left off.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </Field>
          <Field label="Password">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          {err && <div className="text-sm text-red-400">{err}</div>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to FitX? <Link to="/signup" className="font-semibold text-foreground hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
