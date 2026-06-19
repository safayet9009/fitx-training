import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { PageHeader, Button, Field, Input, Select, Badge } from "@/components/ui-kit";

export const Route = createFileRoute("/register-gym")({
  head: () => ({ meta: [{ title: "Register — FitX" }, { name: "description", content: "Register for a FitX gym membership." }] }),
  component: RegisterGym,
});

type Status = "pending" | "approved" | "rejected";

function RegisterGym() {
  const [status, setStatus] = useState<Status>("pending");

  return (
    <div className="space-y-6">
      <PageHeader title="Register at a Gym" subtitle="Submit your details to join a FitX center." />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <form className="glass p-6 grid gap-4 sm:grid-cols-2 animate-fade-up" onSubmit={(e) => { e.preventDefault(); setStatus("pending"); }}>
          <Field label="Full name"><Input placeholder="Your full name" /></Field>
          <Field label="Phone"><Input placeholder="+880 1XXX XXXXXX" /></Field>
          <Field label="Age"><Input type="number" placeholder="24" /></Field>
          <Field label="Gender">
            <Select defaultValue=""><option value="" disabled>Select…</option><option>Male</option><option>Female</option><option>Other</option></Select>
          </Field>
          <Field label="Fitness goal">
            <Select defaultValue="">
              <option value="" disabled>Choose a goal…</option>
              <option>Lose weight</option>
              <option>Build muscle</option>
              <option>Improve endurance</option>
              <option>General fitness</option>
            </Select>
          </Field>
          <Field label="Plan">
            <Select defaultValue="">
              <option value="" disabled>Select plan…</option>
              <option>Basic — ৳1,800/mo</option>
              <option>Pro — ৳2,800/mo</option>
              <option>Elite — ৳3,600/mo</option>
            </Select>
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setStatus("rejected")}>Simulate reject</Button>
            <Button type="submit">Submit registration</Button>
          </div>
        </form>

        <aside className="glass p-6 animate-fade-up h-fit">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Application status</div>
          <div className="mt-4 flex items-center gap-3">
            {status === "pending" && (<><Clock className="size-6 neon-text-blue" /><div><div className="font-semibold">Pending review</div><div className="text-xs text-muted-foreground">Usually within 24 hours</div></div></>)}
            {status === "approved" && (<><CheckCircle2 className="size-6 neon-text-green" /><div><div className="font-semibold">Approved 🎉</div><div className="text-xs text-muted-foreground">Welcome to FitX</div></div></>)}
            {status === "rejected" && (<><XCircle className="size-6 neon-text-red" /><div><div className="font-semibold">Rejected</div><div className="text-xs text-muted-foreground">Re-submit with valid info</div></div></>)}
          </div>
          <div className="mt-4 flex gap-2">
            <Badge tone={status === "pending" ? "blue" : status === "approved" ? "green" : "red"}>{status}</Badge>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <Button variant="secondary" onClick={() => setStatus("pending")}>Set pending</Button>
            <Button onClick={() => setStatus("approved")}>Mark approved</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
