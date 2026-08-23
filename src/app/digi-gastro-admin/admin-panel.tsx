"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const formatEur = (v: number): string =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);

interface TenantRow {
  slug: string;
  name: string;
  email: string;
  active: boolean | null;
  orders_enabled: boolean | null;
  loyalty_enabled: boolean | null;
  show_revenue: boolean | null;
  operating_mode: string | null;
  tier: string | null;
  tagesumsatz: number | null;
  bestellungen_gesamt: number | null;
  is_setup_completed: boolean | null;
  _count: { products: number; orders: number; loyaltyCustomers: number };
}

const btnCls =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:border-amber-500 hover:text-amber-300 disabled:opacity-50";
const inputCls =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500";

async function postJson(url: string, body?: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    error?: string;
    password?: string;
  };
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || "Aktion fehlgeschlagen");
  }
  return data;
}

export default function AdminPanel({ tenants }: { tenants: TenantRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const act = async (key: string, fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(key);
    setNote(null);
    try {
      const r = await fn();
      const pw = (r as { password?: string })?.password;
      setNote({ kind: "ok", text: pw ? `${okMsg} — Passwort: ${pw}` : okMsg });
      router.refresh();
    } catch (e) {
      setNote({ kind: "err", text: e instanceof Error ? e.message : "Aktion fehlgeschlagen" });
    } finally {
      setBusy(null);
    }
  };

  const createTenant = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    await act(
      "create",
      async () => {
        const r = await postJson("/digi-gastro-admin/tenant-erstellen", {
          name: newName.trim(),
          slug: newSlug.trim(),
        });
        return r;
      },
      `Konto für ${newName.trim()} erstellt. Login: ${newSlug.trim().toLowerCase().replace(/ /g, "-")}@digi-gastro.de`
    );
    setNewName("");
    setNewSlug("");
  };

  const adjustRevenue = async (t: TenantRow) => {
    const raw = prompt(`Umsatz-Anpassung für ${t.name} (+ oder −):`, "0");
    if (raw === null) return;
    const v = Number(raw.replace(",", "."));
    if (!Number.isFinite(v)) return;
    await act(
      `rev-${t.slug}`,
      () => postJson(`/digi-gastro-admin/tenant-adjust-revenue/${t.slug}`, { adjustment: v }),
      `Umsatz von ${t.name} angepasst (${v >= 0 ? "+" : ""}${v.toFixed(2)} €)`
    );
  };

  const editName = async (t: TenantRow) => {
    const newName = prompt(`Neuer Name für ${t.name}:`, t.name);
    if (newName === null || !newName.trim()) return;
    await act(
      `name-${t.slug}`,
      () => postJson(`/digi-gastro-admin/tenant-edit-name/${t.slug}`, { name: newName.trim() }),
      `Name von ${t.name} geändert`
    );
  };

  const setMode = async (t: TenantRow, mode: string) => {
    await act(
      `mode-${t.slug}`,
      () => postJson(`/digi-gastro-admin/tenant-operating-mode/${t.slug}`, { mode }),
      `Betriebsmodus von ${t.name} auf ${mode} gesetzt`
    );
  };

  const cleanupOrders = async (t: TenantRow) => {
    const mode = prompt(`Bestellungen bereinigen für ${t.name}?\nall | before_date | cancelled`, "before_date");
    if (mode === null || !mode.trim()) return;
    const opts: Record<string, unknown> = { mode: mode.trim() };
    if (mode.trim() === "before_date") {
      const date = prompt("Löschen bis zu diesem Datum (YYYY-MM-DD):", new Date().toISOString().slice(0, 10));
      if (date === null || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) return;
      opts.cutoff_date = date.trim();
    }
    await act(
      `cleanup-${t.slug}`,
      () => postJson(`/digi-gastro-admin/tenant-cleanup-orders/${t.slug}`, opts),
      `Bestellungen von ${t.name} bereinigt`
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {note ? (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            note.kind === "ok"
              ? "border-green-800 bg-green-950/40 text-green-300"
              : "border-red-800 bg-red-950/40 text-red-300"
          }`}
        >
          {note.text}
        </div>
      ) : null}

      <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-400">
          Neues Restaurant anlegen
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="z.B. Mein Restaurant"
            />
          </div>
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              className={inputCls}
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="z.B. mein-restaurant"
            />
          </div>
          <button
            onClick={() => void createTenant()}
            disabled={busy === "create" || !newName.trim() || !newSlug.trim()}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-500 disabled:opacity-50"
          >
            {busy === "create" ? "Erstelle…" : "Anlegen"}
          </button>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-zinc-900 text-left text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-4 py-3">Restaurant</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Modus</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3 text-right">Produkte</th>
              <th className="px-4 py-3 text-right">Bestellungen</th>
              <th className="px-4 py-3 text-right">Loyalty</th>
              <th className="px-4 py-3 text-right">Umsatz</th>
              <th className="px-4 py-3">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {tenants.map((t) => (
              <tr key={t.slug} className="bg-zinc-950/50 align-top">
                <td className="px-4 py-3">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.email}</div>
                  <div className="mt-1 text-[11px] text-zinc-600">
                    {t.is_setup_completed ? "Setup ✓" : "Setup ✗"} ·{" "}
                    {t.orders_enabled ? "Bestellung ✓" : "Bestellung ✗"} ·{" "}
                    {t.loyalty_enabled ? "Loyalty ✓" : "Loyalty ✗"} ·{" "}
                    {t.show_revenue ? "Umsatz ✓" : "Umsatz ✗"}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-zinc-400">
                  <a href={`/${t.slug}`} className="hover:text-amber-400">
                    /{t.slug}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      t.active ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {t.active ? "aktiv" : "deaktiviert"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                    value={t.operating_mode ?? "full"}
                    onChange={(e) => void setMode(t, e.target.value)}
                    disabled={busy === `mode-${t.slug}`}
                  >
                    <option value="full">full</option>
                    <option value="menu_only">menu_only</option>
                    <option value="stempelkarte_only">stempelkarte_only</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-zinc-400">{t.tier ?? "—"}</td>
                <td className="px-4 py-3 text-right">{t._count.products}</td>
                <td className="px-4 py-3 text-right">{t._count.orders}</td>
                <td className="px-4 py-3 text-right">{t._count.loyaltyCustomers}</td>
                <td className="px-4 py-3 text-right">{formatEur(t.tagesumsatz ?? 0)}</td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[220px] flex-wrap gap-1.5">
                    <button
                      className={btnCls}
                      disabled={busy !== null}
                      onClick={() =>
                        void act(
                          `toggle-${t.slug}`,
                          () => postJson(`/digi-gastro-admin/tenant-toggle/${t.slug}`),
                          `${t.active ? "Deaktiviert" : "Aktiviert"}: ${t.name}`
                        )
                      }
                    >
                      {t.active ? "Deaktivieren" : "Aktivieren"}
                    </button>
                    <button
                      className={btnCls}
                      disabled={busy !== null}
                      onClick={() =>
                        void act(
                          `orders-${t.slug}`,
                          () => postJson(`/digi-gastro-admin/tenant-orders-toggle/${t.slug}`),
                          `Bestellungen ${t.orders_enabled ? "aus" : "an"}: ${t.name}`
                        )
                      }
                    >
                      Bestellung {t.orders_enabled ? "aus" : "an"}
                    </button>
                    <button
                      className={btnCls}
                      disabled={busy !== null}
                      onClick={() =>
                        void act(
                          `loyalty-${t.slug}`,
                          () => postJson(`/digi-gastro-admin/tenant-loyalty-toggle/${t.slug}`),
                          `Loyalty ${t.loyalty_enabled ? "aus" : "an"}: ${t.name}`
                        )
                      }
                    >
                      Loyalty {t.loyalty_enabled ? "aus" : "an"}
                    </button>
                    <button
                      className={btnCls}
                      disabled={busy !== null}
                      onClick={() =>
                        void act(
                          `revtoggle-${t.slug}`,
                          () => postJson(`/digi-gastro-admin/tenant-revenue-toggle/${t.slug}`),
                          `Umsatz-Anzeige ${t.show_revenue ? "aus" : "an"}: ${t.name}`
                        )
                      }
                    >
                      Umsatz-Anzeige {t.show_revenue ? "aus" : "an"}
                    </button>
                    <button
                      className={btnCls}
                      disabled={busy !== null}
                      onClick={() =>
                        void act(
                          `setup-${t.slug}`,
                          () => postJson(`/digi-gastro-admin/tenant-complete-setup/${t.slug}`),
                          `Setup als abgeschlossen markiert: ${t.name}`
                        )
                      }
                    >
                      Setup abschließen
                    </button>
                    <button className={btnCls} disabled={busy !== null} onClick={() => void editName(t)}>
                      Name ändern
                    </button>
                    <button
                      className={btnCls}
                      disabled={busy !== null}
                      onClick={() =>
                        void act(
                          `pw-${t.slug}`,
                          () => postJson(`/digi-gastro-admin/tenant-reset-password/${t.slug}`),
                          `Passwort zurückgesetzt: ${t.name}`
                        )
                      }
                    >
                      Passwort zurücksetzen
                    </button>
                    <button className={btnCls} disabled={busy !== null} onClick={() => void adjustRevenue(t)}>
                      Umsatz anpassen
                    </button>
                    <button className={btnCls} disabled={busy !== null} onClick={() => void cleanupOrders(t)}>
                      Bestellungen bereinigen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}