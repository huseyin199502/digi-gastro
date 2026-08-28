"use client";

import { useCallback, useEffect, useState } from "react";

interface VoucherRow {
  id: number;
  code: string;
  tenant_slug: string;
  discount_type: string;
  discount_value: number;
  status: string;
  used_table: string | null;
  used_at: string | null;
  created_at: string;
}

const inputCls =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500";

export default function VoucherPanel({ tenants }: { tenants: { slug: string; name: string }[] }) {
  const [tenantSlug, setTenantSlug] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("10");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [vouchers, setVouchers] = useState<VoucherRow[]>([]);

  const load = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      const r = await fetch(`/digi-gastro-admin/voucher?tenant=${tenantSlug}`);
      const j = await r.json();
      if (j.success) setVouchers(j.vouchers ?? []);
    } catch {
      /* ignore */
    }
  }, [tenantSlug]);

  useEffect(() => {
    const to = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(to);
  }, [load]);

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let c = "";
    for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
    setCode(c);
  };

  const create = async () => {
    if (busy) return;
    if (!tenantSlug) {
      setNote({ kind: "err", text: "Tenant wählen." });
      return;
    }
    const v = Number(discountValue.replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) {
      setNote({ kind: "err", text: "Ungültiger Rabattwert." });
      return;
    }
    if (!code.trim()) {
      setNote({ kind: "err", text: "Code fehlt." });
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const r = await fetch("/digi-gastro-admin/voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "fetch" },
        body: JSON.stringify({ tenant_slug: tenantSlug, discount_type: discountType, discount_value: v, code: code.trim() }),
      });
      const j = await r.json();
      if (r.ok && j.success) {
        setNote({ kind: "ok", text: `Voucher ${code.trim().toUpperCase()} erstellt.` });
        setCode("");
        await load();
      } else {
        setNote({ kind: "err", text: j.detail || "Fehler" });
      }
    } catch {
      setNote({ kind: "err", text: "Verbindungsfehler." });
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: number, code: string) => {
    if (!window.confirm(`Voucher "${code}" wirklich löschen?`)) return;
    setBusy(true);
    try {
      const r = await fetch(`/digi-gastro-admin/voucher?id=${id}`, { method: "DELETE" });
      const j = await r.json();
      if (r.ok && j.success) {
        setNote({ kind: "ok", text: `Voucher ${code} gelöscht.` });
        await load();
      } else {
        setNote({ kind: "err", text: j.detail || "Fehler" });
      }
    } catch {
      setNote({ kind: "err", text: "Verbindungsfehler." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-400">
        Rabatt-Vouchers (1x gültig)
      </h2>

      {note ? (
        <div
          className={`mb-3 rounded-lg border p-2 text-sm ${
            note.kind === "ok"
              ? "border-green-800 bg-green-950/40 text-green-300"
              : "border-red-800 bg-red-950/40 text-red-300"
          }`}
        >
          {note.text}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Tenant</label>
          <select
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            className={inputCls + " w-full"}
          >
            <option value="">— wählen —</option>
            {tenants.map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Rabattart</label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
            className={inputCls + " w-full"}
          >
            <option value="percent">Prozent (%)</option>
            <option value="fixed">Festbetrag (€)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Wert</label>
          <input
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className={inputCls + " w-full"}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Code</label>
          <div className="flex gap-1">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={inputCls + " w-full"}
              placeholder="z.B. SOMMER10"
            />
            <button
              onClick={generateCode}
              title="Code generieren"
              className="rounded-lg border border-zinc-700 px-2 text-sm hover:bg-zinc-800"
            >
              🎲
            </button>
          </div>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => void create()}
            disabled={busy}
            className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-500 disabled:opacity-50"
          >
            {busy ? "Erstelle…" : "Erstellen"}
          </button>
        </div>
      </div>

      {tenantSlug && vouchers.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs text-zinc-400">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Rabatt</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Verwendet bei</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {vouchers.map((v) => {
                const isUsed = v.status === "used" || v.status === "consumed";
                return (
                <tr key={v.id} className="bg-zinc-950/40">
                  <td className="px-3 py-2 font-mono font-semibold">{v.code}</td>
                  <td className="px-3 py-2">
                    {v.discount_type === "percent" ? `${v.discount_value}%` : `${v.discount_value} €`}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        isUsed
                          ? "bg-red-900/50 text-red-300"
                          : "bg-emerald-900/60 text-emerald-300"
                      }`}
                    >
                      {isUsed ? "verwendet" : "aktiv"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {v.used_table ? `${v.used_table}` : isUsed ? "(verwendet)" : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => void del(v.id, v.code)}
                      disabled={busy}
                      className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800 disabled:opacity-50"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}