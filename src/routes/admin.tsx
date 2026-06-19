import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Building2, CreditCard, BarChart3, Shield, Ban, UserCog, Check, X } from "lucide-react";
import { PageHeader, Tabs, StatCard, Button, Badge, Modal, Input, Field } from "@/components/ui-kit";
import { adminUsers, centers, pendingPayments, analytics, type Center } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FitX" }, { name: "description", content: "FitX admin console." }] }),
  component: AdminPage,
});

type Tab = "analytics" | "users" | "gyms" | "payments";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("analytics");
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Console"
        subtitle={<span className="inline-flex items-center gap-2"><Shield className="size-4 neon-text-green" /> Restricted to staff</span>} />
      <Tabs<Tab>
        tabs={[
          { id: "analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
          { id: "users",     label: "Users",     icon: <Users className="size-4" /> },
          { id: "gyms",      label: "Gyms",      icon: <Building2 className="size-4" /> },
          { id: "payments",  label: "Payments",  icon: <CreditCard className="size-4" /> },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "analytics" && <AnalyticsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "gyms" && <GymsTab />}
      {tab === "payments" && <PaymentsTab />}
    </div>
  );
}

function AnalyticsTab() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total users" value={analytics.totalUsers.toLocaleString()} accent="blue" icon={<Users className="size-4" />} />
      <StatCard label="Active users" value={analytics.activeUsers.toLocaleString()} accent="green" />
      <StatCard label="Workouts" value={analytics.workouts.toLocaleString()} accent="purple" />
      <StatCard label="Revenue" value={`৳${(analytics.revenue / 100000).toFixed(1)}L`} accent="amber" />
    </section>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(adminUsers);
  const toggleBan = (id: string) =>
    setUsers((u) => u.map((x) => x.id === id ? { ...x, status: x.status === "banned" ? "active" : "banned" } : x));
  const toggleRole = (id: string) =>
    setUsers((u) => u.map((x) => x.id === id ? { ...x, role: x.role === "admin" ? "user" : "admin" } : x));

  return (
    <section className="glass overflow-hidden animate-fade-up">
      <div className="grid grid-cols-[minmax(0,1fr)_8rem_6rem_auto] gap-3 border-b border-white/5 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span>User</span><span>Role</span><span>Status</span><span className="text-right">Actions</span>
      </div>
      <ul>
        {users.map((u) => (
          <li key={u.id} className="grid grid-cols-[minmax(0,1fr)_8rem_6rem_auto] items-center gap-3 px-5 py-3 hover:bg-white/5">
            <div className="min-w-0">
              <div className="truncate font-medium">{u.name}</div>
              <div className="truncate text-xs text-muted-foreground">{u.email}</div>
            </div>
            <Badge tone={u.role === "admin" ? "green" : "blue"}>{u.role}</Badge>
            <Badge tone={u.status === "active" ? "green" : "red"}>{u.status}</Badge>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => toggleRole(u.id)}><UserCog className="size-4" /> Role</Button>
              <Button variant="destructive" onClick={() => toggleBan(u.id)}><Ban className="size-4" /> {u.status === "banned" ? "Unban" : "Ban"}</Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GymsTab() {
  const [list, setList] = useState<Center[]>(centers);
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-4 animate-fade-up">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>+ Add center</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} className="glass p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.area}, {c.city}</div>
              </div>
              <Badge tone="green">৳{c.fee}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary">Edit</Button>
              <Button variant="destructive" onClick={() => setList((l) => l.filter((x) => x.id !== c.id))}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add new center">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setOpen(false); }}>
          <Field label="Name"><Input placeholder="FitX New Branch" /></Field>
          <Field label="City"><Input placeholder="Dhaka" /></Field>
          <Field label="Area"><Input placeholder="Gulshan 1" /></Field>
          <Field label="Fee (BDT)"><Input type="number" placeholder="3000" /></Field>
          <Button className="w-full">Create center</Button>
        </form>
      </Modal>
    </section>
  );
}

function PaymentsTab() {
  const [list, setList] = useState(pendingPayments);
  const decide = (id: string, _ok: boolean) => setList((l) => l.filter((p) => p.id !== id));

  return (
    <section className="glass overflow-hidden animate-fade-up">
      <div className="grid grid-cols-[minmax(0,1fr)_7rem_8rem_6rem_auto] gap-3 border-b border-white/5 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span>User · Plan</span><span>Method</span><span>Txn ID</span><span>Amount</span><span className="text-right">Decision</span>
      </div>
      {list.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No pending payments 🎉</div>}
      <ul>
        {list.map((p) => (
          <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_7rem_8rem_6rem_auto] items-center gap-3 px-5 py-3 hover:bg-white/5">
            <div className="min-w-0">
              <div className="truncate font-medium">{p.user}</div>
              <div className="text-xs text-muted-foreground">{p.plan}</div>
            </div>
            <Badge tone="blue">{p.method}</Badge>
            <span className="font-mono text-xs">{p.txn}</span>
            <span className="font-semibold">৳{p.amount.toLocaleString()}</span>
            <div className="flex justify-end gap-2">
              <Button onClick={() => decide(p.id, true)}><Check className="size-4" /> Approve</Button>
              <Button variant="destructive" onClick={() => decide(p.id, false)}><X className="size-4" /> Reject</Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
