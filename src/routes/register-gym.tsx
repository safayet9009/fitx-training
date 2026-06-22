import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { PageHeader, Button, Badge } from "@/components/ui-kit";
import { useUser } from "@/lib/user-context";
import { gymService } from "@/services/gymService";

export const Route = createFileRoute("/register-gym")({
  head: () => ({ meta: [{ title: "Register — FitX" }] }),
  component: RegisterGym,
});

function RegisterGym() {
  const { profile } = useUser();
  const [regs, setRegs] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    gymService.myRegistrations(profile.id).then(setRegs);
  }, [profile?.id]);

  return (
    <div className="space-y-6">
      <PageHeader title="My gym registrations" subtitle="Track your gym membership requests." />

      {regs.length === 0 ? (
        <div className="glass p-8 text-center space-y-3">
          <div className="text-muted-foreground">You haven't submitted any registrations yet.</div>
          <Link to="/centers"><Button>Browse gym centers</Button></Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {regs.map((r) => (
            <div key={r.id} className="glass p-5 flex items-center justify-between gap-4 animate-fade-up">
              <div>
                <div className="font-semibold">{r.gym_centers?.name ?? "Center"}</div>
                <div className="text-xs text-muted-foreground">{r.gym_centers?.city} · Submitted {new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-3">
                {r.status === "pending" && <><Clock className="size-5 neon-text-blue" /><Badge tone="blue">Pending</Badge></>}
                {r.status === "approved" && <><CheckCircle2 className="size-5 neon-text-green" /><Badge tone="green">Approved — Pro</Badge></>}
                {r.status === "rejected" && <><XCircle className="size-5" /><Badge tone="red">Rejected</Badge></>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
