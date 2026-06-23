import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Phone, Clock, Star, Users, ExternalLink, Wallet } from "lucide-react";
import { PageHeader, Button, Input, Badge, Modal } from "@/components/ui-kit";
import { CenterMap } from "@/components/center-map";
import { gymService, type GymCenter } from "@/services/gymService";
import { getCenterMeta } from "@/lib/center-meta";

export const Route = createFileRoute("/centers")({
  head: () => ({ meta: [{ title: "Centers — FitX" }] }),
  component: CentersPage,
});

function CentersPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState<GymCenter | null>(null);
  const [centers, setCenters] = useState<GymCenter[]>([]);

  useEffect(() => { gymService.listCenters().then(setCenters); }, []);

  const filtered = useMemo(
    () => centers.filter((c) => !q || `${c.name} ${c.address} ${c.city}`.toLowerCase().includes(q.toLowerCase())),
    [q, centers],
  );

  const grouped = useMemo(() => {
    const out: Record<string, GymCenter[]> = {};
    for (const c of filtered) (out[c.city] ??= []).push(c);
    return out;
  }, [filtered]);

  function goJoin(id: string) {
    router.navigate({ to: "/register-gym", search: { center: id } as any });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Centers" subtitle={`${centers.length} branches across Bangladesh.`} />

      <CenterMap centers={filtered} onSelect={setActive} height={380} />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, area, city…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {Object.keys(grouped).map((city) => {
        const list = grouped[city];
        return (
          <section key={city}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <MapPin className="size-4 neon-text-blue" /> {city}
              <Badge>{list.length} branches</Badge>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => {
                const m = getCenterMeta(c.name);
                return (
                  <div key={c.id} className="glass glass-hover p-5 animate-fade-up">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{c.name}</h3>
                        <div className="text-xs text-muted-foreground">{c.address}</div>
                      </div>
                      <Badge tone="green">৳{c.monthly_fee}/mo</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge tone="amber"><Star className="size-3" /> {m.rating}</Badge>
                      <Badge tone="blue"><Users className="size-3" /> {m.trainers} trainers</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.facilities.slice(0, 4).map((f) => <Badge key={f}>{f}</Badge>)}
                      {c.facilities.length > 4 && <Badge>+{c.facilities.length - 4}</Badge>}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => goJoin(c.id)}>Join</Button>
                      <Button variant="secondary" onClick={() => setActive(c)}>Details</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {active && (
        <CenterDetailsModal
          center={active}
          onClose={() => setActive(null)}
          onJoin={(id) => { setActive(null); goJoin(id); }}
        />
      )}
    </div>
  );
}

function CenterDetailsModal({
  center, onClose, onJoin,
}: { center: GymCenter; onClose: () => void; onJoin: (id: string) => void }) {
  const m = getCenterMeta(center.name);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${center.name} ${center.address} ${center.city}`,
  )}`;
  return (
    <Modal open onClose={onClose} title={center.name} size="xl">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {m.gallery.map((g, i) => (
            <div key={i} className="aspect-video rounded-xl" style={{ background: g }} />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={<MapPin className="size-4" />} label="Address" value={`${center.address}, ${center.city}`} />
          <InfoRow icon={<Phone className="size-4" />} label="Phone" value={center.phone ?? "+880 1700-000000"} />
          <InfoRow icon={<Clock className="size-4" />} label="Hours" value={m.hours} />
          <InfoRow icon={<Users className="size-4" />} label="Trainers" value={`${m.trainers} certified`} />
          <InfoRow icon={<Star className="size-4" />} label="Rating" value={`${m.rating} / 5`} />
          <InfoRow icon={<Wallet className="size-4" />} label="Monthly fee" value={`৳${center.monthly_fee.toLocaleString()}`} />
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">About</div>
          <p className="mt-1 text-sm text-foreground/90">{m.description}</p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Facilities</div>
          <div className="flex flex-wrap gap-1.5">
            {center.facilities.map((f) => <Badge key={f}>{f}</Badge>)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Branch payment numbers</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PayRow label="bKash" number={m.bkash} color="#E2136E" />
            <PayRow label="Nagad" number={m.nagad} color="#F58220" />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary"><ExternalLink className="size-4" /> View on Google Maps</Button>
          </a>
          <Button onClick={() => onJoin(center.id)}>Join this branch</Button>
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function PayRow({ label, number, color }: { label: string; number: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-black/30 p-3">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-lg font-bold text-white" style={{ background: color }}>
          {label[0]}
        </div>
        <div>
          <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
          <div className="font-mono text-sm font-semibold">{number}</div>
        </div>
      </div>
    </div>
  );
}
