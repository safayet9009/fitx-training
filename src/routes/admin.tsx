import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Building2, CreditCard, BarChart3, Shield, Check, X, Trash2, Mail, Phone } from "lucide-react";
import { PageHeader, Tabs, StatCard, Button, Badge, Modal, Input, Field } from "@/components/ui-kit";
import { adminService } from "@/services/adminService";
import { gymService, type GymCenter } from "@/services/gymService";
import { subscriptionService } from "@/services/subscriptionService";
import { profileService } from "@/services/profileService";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FitX" }] }),
  component: AdminPage,
});

type Tab = "analytics" | "users" | "gyms" | "registrations" | "payments" | "verification";

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
          { id: "verification", label: "Verification", icon: <Shield className="size-4" /> },
          { id: "gyms",      label: "Gyms",      icon: <Building2 className="size-4" /> },
          { id: "registrations", label: "Registrations", icon: <Check className="size-4" /> },
          { id: "payments",  label: "Payments",  icon: <CreditCard className="size-4" /> },
        ]}
        value={tab} onChange={setTab}
      />
      {tab === "analytics" && <AnalyticsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "verification" && <VerificationTab />}
      {tab === "gyms" && <GymsTab />}
      {tab === "registrations" && <RegistrationsTab />}
      {tab === "payments" && <PaymentsTab />}
    </div>
  );
}

function VerificationTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { profileService.listAllForAdmin().then(setRows); }, []);
  const phoneVerified = rows.filter((r) => r.phone_verified).length;
  const phoneUnverified = rows.length - phoneVerified;

  return (
    <section className="space-y-4 animate-fade-up">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total accounts" value={rows.length} accent="blue" icon={<Users className="size-4" />} />
        <StatCard label="Phones verified" value={phoneVerified} accent="green" icon={<Phone className="size-4" />} />
        <StatCard label="Phones unverified" value={phoneUnverified} accent="amber" icon={<Phone className="size-4" />} />
      </div>

      <div className="glass overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_7rem_7rem_6rem] gap-3 border-b border-white/5 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span>User</span><span>Phone</span><span>Email</span><span>Phone</span><span>Plan</span>
        </div>
        <ul>
          {rows.map((u) => (
            <li key={u.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_7rem_7rem_6rem] items-center gap-3 px-5 py-3 hover:bg-white/5">
              <div className="min-w-0">
                <div className="truncate font-medium">{u.name || "—"}</div>
                <div className="truncate text-xs text-muted-foreground">{u.email}</div>
              </div>
              <span className="truncate font-mono text-xs">{u.phone || "—"}</span>
              <Badge tone="green"><Mail className="size-3" /> Verified</Badge>
              {u.phone_verified
                ? <Badge tone="green"><Check className="size-3" /> Verified</Badge>
                : <Badge tone="red"><X className="size-3" /> Pending</Badge>}
              <Badge tone={u.subscription_type === "pro" ? "green" : "blue"}>{u.subscription_type}</Badge>
            </li>
          ))}
          {rows.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted-foreground">No accounts yet.</li>}
        </ul>
      </div>
    </section>
  );
}

function AnalyticsTab() {
  const [a, setA] = useState({ totalUsers: 0, workouts: 0, activeSubs: 0 });
  useEffect(() => { adminService.analytics().then(setA); }, []);
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total users" value={a.totalUsers.toLocaleString()} accent="blue" icon={<Users className="size-4" />} />
      <StatCard label="Workouts logged" value={a.workouts.toLocaleString()} accent="purple" />
      <StatCard label="Active subscriptions" value={a.activeSubs.toLocaleString()} accent="green" />
      <StatCard label="Revenue (mock)" value={`৳${(a.activeSubs * 990).toLocaleString()}`} accent="amber" />
    </section>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { adminService.listUsers().then(setUsers); }, []);
  return (
    <section className="glass overflow-hidden animate-fade-up">
      <div className="grid grid-cols-[minmax(0,1fr)_5rem_5rem_6rem_6rem] gap-3 border-b border-white/5 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span>User</span><span>Level</span><span>Streak</span><span>XP</span><span>Plan</span>
      </div>
      <ul>
        {users.map((u) => (
          <li key={u.id} className="grid grid-cols-[minmax(0,1fr)_5rem_5rem_6rem_6rem] items-center gap-3 px-5 py-3 hover:bg-white/5">
            <div className="min-w-0">
              <div className="truncate font-medium">{u.name || "—"}</div>
              <div className="truncate text-xs text-muted-foreground">{u.email}</div>
            </div>
            <span className="text-sm">Lv {u.level}</span>
            <span className="text-sm">🔥 {u.streak}</span>
            <span className="font-semibold neon-text-green">{u.xp}</span>
            <Badge tone={u.subscription_type === "pro" ? "green" : "blue"}>{u.subscription_type}</Badge>
          </li>
        ))}
        {users.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted-foreground">No users yet.</li>}
      </ul>
    </section>
  );
}

function GymsTab() {
  const [list, setList] = useState<GymCenter[]>([]);
  const [open, setOpen] = useState(false);
  const reload = () => gymService.listCenters().then(setList);
  useEffect(() => { reload(); }, []);

  const [form, setForm] = useState({ name: "", city: "Dhaka", address: "", phone: "", monthly_fee: 2000, facilities: "Cardio, Weights" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await gymService.createCenter({
      name: form.name, city: form.city, address: form.address, phone: form.phone || null,
      monthly_fee: Number(form.monthly_fee),
      facilities: form.facilities.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setOpen(false);
    setForm({ name: "", city: "Dhaka", address: "", phone: "", monthly_fee: 2000, facilities: "Cardio, Weights" });
    reload();
  }

  async function remove(id: string) {
    await gymService.deleteCenter(id);
    reload();
  }

  return (
    <section className="space-y-4 animate-fade-up">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}>+ Add center</Button></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} className="glass p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.address}, {c.city}</div>
              </div>
              <Badge tone="green">৳{c.monthly_fee}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="destructive" onClick={() => remove(c.id)}><Trash2 className="size-4" /> Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add new center">
        <form className="space-y-3" onSubmit={create}>
          <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="City"><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="Address"><Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Fee (BDT)"><Input type="number" required value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: Number(e.target.value) })} /></Field>
          <Field label="Facilities (comma separated)"><Input value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} /></Field>
          <Button type="submit" className="w-full">Create center</Button>
        </form>
      </Modal>
    </section>
  );
}

function RegistrationsTab() {
  const [list, setList] = useState<any[]>([]);
  const reload = () => gymService.listRegistrations().then(setList);
  useEffect(() => { reload(); }, []);

  async function decide(id: string, status: "approved" | "rejected") {
    await gymService.decide(id, status); reload();
  }

  return (
    <section className="glass overflow-hidden animate-fade-up">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6rem_auto] gap-3 border-b border-white/5 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span>User</span><span>Center</span><span>Status</span><span className="text-right">Decision</span>
      </div>
      {list.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No registrations yet.</div>}
      <ul>
        {list.map((r) => (
          <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6rem_auto] items-center gap-3 px-5 py-3 hover:bg-white/5">
            <div className="min-w-0">
              <div className="truncate font-medium">{r.profiles?.name ?? "—"}</div>
              <div className="truncate text-xs text-muted-foreground">{r.profiles?.email}</div>
            </div>
            <div className="truncate text-sm">{r.gym_centers?.name}</div>
            <Badge tone={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "blue"}>{r.status}</Badge>
            <div className="flex justify-end gap-2">
              <Button onClick={() => decide(r.id, "approved")} disabled={r.status === "approved"}><Check className="size-4" /> Approve</Button>
              <Button variant="destructive" onClick={() => decide(r.id, "rejected")} disabled={r.status === "rejected"}><X className="size-4" /> Reject</Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PaymentsTab() {
  const [list, setList] = useState<any[]>([]);
  const reload = () => subscriptionService.listAll().then(setList);
  useEffect(() => { reload(); }, []);

  async function decide(id: string, status: "active" | "rejected") {
    await subscriptionService.decide(id, status); reload();
  }

  return (
    <section className="glass overflow-hidden animate-fade-up">
      <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_8rem_6rem_auto] gap-3 border-b border-white/5 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span>User · Plan</span><span>Method</span><span>Txn ID</span><span>Status</span><span>Expires</span><span className="text-right">Decision</span>
      </div>
      {list.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No payments yet.</div>}
      <ul>
        {list.map((p) => (
          <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_8rem_6rem_auto] items-center gap-3 px-5 py-3 hover:bg-white/5">
            <div className="min-w-0">
              <div className="truncate font-medium">{p.profiles?.name ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{p.plan}</div>
            </div>
            <Badge tone="blue">{p.payment_method}</Badge>
            <span className="font-mono text-xs truncate">{p.transaction_id}</span>
            <Badge tone={p.status === "active" ? "green" : p.status === "rejected" ? "red" : "blue"}>{p.status}</Badge>
            <span className="text-xs text-muted-foreground">{new Date(p.expires_at).toLocaleDateString()}</span>
            <div className="flex justify-end gap-2">
              <Button onClick={() => decide(p.id, "active")} disabled={p.status === "active"}><Check className="size-4" /> Approve</Button>
              <Button variant="destructive" onClick={() => decide(p.id, "rejected")} disabled={p.status === "rejected"}><X className="size-4" /> Reject</Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
