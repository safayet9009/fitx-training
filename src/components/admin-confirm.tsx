import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Modal, Button, Field, Input } from "@/components/ui-kit";
import { adminSecurity } from "@/lib/admin-security";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirmed: () => void | Promise<void>;
};

/** Sensitive-action confirmation: requires the admin's PIN before proceeding. */
export function AdminConfirm({ open, title, description, destructive, onCancel, onConfirmed }: Props) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const ok = await adminSecurity.verifyPin(pin);
      if (!ok) {
        await adminSecurity.log("admin.confirm.pin", title, "failure");
        throw new Error("Incorrect PIN");
      }
      await onConfirmed();
      setPin("");
      onCancel();
    } catch (e: any) {
      setErr(e.message ?? "Verification failed");
    } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
          <ShieldAlert className={`size-5 shrink-0 ${destructive ? "text-red-300" : "neon-text-amber"}`} />
          <div>{description ?? "Confirm with your 6-digit admin PIN to continue."}</div>
        </div>
        <Field label="Admin PIN">
          <Input inputMode="numeric" maxLength={6} autoFocus value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
        </Field>
        {err && <div className="text-sm text-red-300">{err}</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={busy || pin.length !== 6}>{busy ? "Verifying…" : "Confirm"}</Button>
        </div>
      </form>
    </Modal>
  );
}
