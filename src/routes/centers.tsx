import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { PageHeader, Button, Input, Badge, Modal } from "@/components/ui-kit";
import { gymService, type GymCenter } from "@/services/gymService";
import { useUser } from "@/lib/user-context";

export const Route = createFileRoute("/centers")({
  head: () => ({ meta: [{ title: "Centers — FitX" }] }),
  component: CentersPage,
});

function CentersPage() {
  const router = useRouter();
  const { profile } = useUser();
  const [q, setQ] = useState("");
  const [active, setActive] = useState<GymCenter | null>(null);
  const [centers, setCenters] = useState<GymCenter[]>([]);
  const [joining, setJoining] = useState(false);

  useEffect(() => { gymService.listCenters().then(setCenters); }, []);

  const grouped = useMemo(() => {
    const out: Record<string, GymCenter[]> = {};
    for (const c of centers) {
      if (q && !`${c.name} ${c.address}`.toLowerCase().includes(q.toLowerCase())) continue;
      (out[c.city] ??= []).push(c);
    }
    return out;
  }, [q, centers]);

  const cities = Object.keys(grouped);

  async function join() {
    if (!active || !profile) return;
    setJoining(true);
    try {
      await gymService.register(profile.id, active.id);
      setActive(null);
      router.navigate({ to: "/register-gym" });
    } finally { setJoining(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Centers" subtitle={`${centers.length} branches across Bangladesh.`} />

      <div className="glass relative h-64 overflow-hidden p-0 animate-fade-up">
        <div className="absolute inset-0 opacity-60"
             style={{
               backgroundImage:
                 "linear-gradient(color-mix(in oklab,var(--neon-blue) 20%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab,var(--neon-blue) 20%, transparent) 1px, transparent 1px)",
               backgroundSize: "32px 32px",
             }} />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <MapPin className="mx-auto size-8 neon-text-blue" />
            <div className="mt-2 text-sm text-muted-foreground">Interactive map · {centers.length} branches</div>
          </div>
        </div>
        {centers.slice(0, 8).map((c, i) => (
          <div key={c.id} className="absolute size-3 rounded-full animate-badge-glow"
               style={{ background: "var(--neon-green)", left: `${10 + (i * 11) % 80}%`, top: `${20 + (i * 23) % 60}%` }} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or area…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {cities.map((city) => {
        const list = grouped[city] ?? [];
        if (!list.length) return null;
        return (
          <section key={city}>
            <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
              <MapPin className="size-4 neon-text-blue" /> {city}
              <Badge>{list.length} branches</Badge>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <div key={c.id} className="glass glass-hover p-5 animate-fade-up">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{c.name}</h3>
                      <div className="text-xs text-muted-foreground">{c.address}</div>
                    </div>
                    <Badge tone="green">৳{c.monthly_fee}/mo</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.facilities.map((f) => <Badge key={f}>{f}</Badge>)}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => setActive(c)}>Join</Button>
                    <Button variant="secondary" onClick={() => setActive(c)}>Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name ?? ""}>
        {active && (
          <div className="space-y-3 text-sm">
            <div className="text-muted-foreground">{active.address}, {active.city}</div>
            {active.phone && <div className="text-muted-foreground">📞 {active.phone}</div>}
            <div className="flex items-center gap-2"><Badge tone="green">৳{active.monthly_fee}/month</Badge></div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Facilities</div>
              <div className="flex flex-wrap gap-1.5">{active.facilities.map((f) => <Badge key={f}>{f}</Badge>)}</div>
            </div>
            <Button className="w-full" disabled={joining} onClick={join}>
              {joining ? "Submitting…" : "Submit join request"}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
