import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between animate-fade-up">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function StatCard({
  label, value, hint, accent = "green", icon,
}: {
  label: string; value: ReactNode; hint?: string;
  accent?: "green" | "blue" | "red" | "amber" | "purple";
  icon?: ReactNode;
}) {
  const accentVar = `var(--neon-${accent})`;
  return (
    <div className="glass glass-hover p-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && (
          <div className="grid size-9 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${accentVar} 18%, transparent)`, color: accentVar }}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 text-3xl font-bold" style={{ color: accentVar, textShadow: `0 0 18px color-mix(in oklab, ${accentVar} 35%, transparent)` }}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Progress({ value, accent = "green" }: { value: number; accent?: "green" | "blue" | "amber" | "red" }) {
  const accentVar = `var(--neon-${accent})`;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full animate-progress"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: `linear-gradient(90deg, ${accentVar}, color-mix(in oklab, ${accentVar} 60%, white))` }}
      />
    </div>
  );
}

export function Badge({ tone = "default", children }: { tone?: "default" | "green" | "blue" | "red" | "amber"; children: ReactNode }) {
  const map: Record<string, string> = {
    default: "var(--foreground)",
    green: "var(--neon-green)",
    blue: "var(--neon-blue)",
    red: "var(--neon-red)",
    amber: "var(--neon-amber)",
  };
  const c = map[tone];
  return (
    <span
      className="chip"
      style={{ background: `color-mix(in oklab, ${c} 16%, transparent)`, color: c, borderColor: `color-mix(in oklab, ${c} 30%, transparent)` }}
    >
      {children}
    </span>
  );
}

export function Button({
  variant = "primary", className = "", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "destructive" }) {
  const styles: Record<string, string> = {
    primary: "text-background hover:brightness-110 shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--neon-green)_60%,transparent)]",
    secondary: "bg-white/5 hover:bg-white/10 text-foreground border border-white/10",
    ghost: "hover:bg-white/5 text-foreground",
    destructive: "text-background hover:brightness-110",
  };
  const style: React.CSSProperties =
    variant === "primary" ? { background: "var(--gradient-primary)" }
    : variant === "destructive" ? { background: "linear-gradient(135deg, var(--neon-red), var(--neon-amber))" }
    : {};
  return (
    <button
      style={style}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; icon?: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex flex-wrap rounded-2xl border border-white/10 bg-white/5 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
            value === t.id ? "bg-white/10 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--neon-green)_40%,transparent)]" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-[color:var(--neon-green)] focus:bg-white/10 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-[color:var(--neon-green)] focus:bg-white/10 ${props.className ?? ""}`}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-up">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-white/5">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
