"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import VoucherPanel from "./voucher-panel";

const formatEur = (v: number): string =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);

interface TenantRow {
  slug: string;
  name: string;
  email: string;
  active: boolean | null;
  orders_enabled: boolean | null;
  loyalty_enabled: boolean | null;
  chat_enabled: boolean | null;
  enabled_features: string | null;
  show_revenue: boolean | null;
  operating_mode: string | null;
  tier: string | null;
  tagesumsatz: number | null;
  bestellungen_gesamt: number | null;
  is_setup_completed: boolean | null;
  _count: { products: number; orders: number; loyaltyCustomers: number };
}

interface AnnouncementRow {
  id: number;
  key: string | null;
  title: string;
  body: string;
  icon: string | null;
  is_active: boolean | null;
  created_at: Date;
}

const btnCls =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:border-amber-500 hover:text-amber-300 disabled:opacity-50";
const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500";

/** Play World aktiv? (Bestellsystem nötig; Abschaltung via enabled_features "play_off".) */
function playWorldEnabled(t: { orders_enabled: boolean | null; enabled_features: string | null }): boolean {
  if (t.orders_enabled === false) return false;
  try {
    const f = JSON.parse(t.enabled_features ?? "[]") as string[];
    return !(Array.isArray(f) && f.includes("play_off"));
  } catch {
    return true;
  }
}
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

export default function AdminPanel({
  tenants,
  announcements,
}: {
  tenants: TenantRow[];
  announcements: AnnouncementRow[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  // Neuigkeiten-Formular
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annIcon, setAnnIcon] = useState("celebration");

  const createAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) return;
    await act(
      "ann-create",
      async () => {
        const fd = new FormData();
        fd.set("title", annTitle.trim());
        fd.set("body", annBody.trim());
        fd.set("icon", annIcon.trim() || "celebration");
        fd.set("is_active", "1");
        const res = await fetch("/digi-gastro-admin/announcement-erstellen", {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Erstellen fehlgeschlagen");
      },
      "Neuigkeit veröffentlicht — erscheint 1x pro Geräte-Login"
    );
    setAnnTitle("");
    setAnnBody("");
    setAnnIcon("celebration");
  };

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

  const impersonate = async (slug: string) => {
    setBusy(`imp-${slug}`);
    setNote(null);
    try {
      const res = await fetch(`/digi-gastro-admin/tenant-impersonate/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        redirect: "manual",
      });
      // Bei redirect:"manual" liefert der Browser eine opaque-redirect-Antwort
      // (res.status === 0, res.type === "opaqueredirect") statt des HTTP-Codes.
      // Erfolg = es gab eine Weiterleitung (Cookie wurde gesetzt).
      if (
        res.redirected ||
        res.type === "opaqueredirect" ||
        (res.status >= 300 && res.status < 400)
      ) {
        router.push(`/${slug}/admin`);
        return;
      }
      setNote({ kind: "err", text: "Einloggen fehlgeschlagen." });
    } catch {
      setNote({ kind: "err", text: "Verbindungsfehler." });
    } finally {
      setBusy(null);
    }
  };

  const deleteTenant = async (t: TenantRow) => {
    const sure = window.confirm(
      `Tenant wirklich löschen?\n\n"${t.name}" (${t.slug})\nAlle Bestellungen, Produkte, Kategorien und Kundendaten werden unwiderruflich gelöscht!`
    );
    if (!sure) return;
    const sure2 = window.prompt(
      `Zum Bestätigen bitte den Slug "${t.slug}" eingeben:`,
      ""
    );
    if (sure2?.trim() !== t.slug) {
      setNote({ kind: "err", text: "Löschen abgebrochen (Slug stimmt nicht)." });
      return;
    }
    await act(
      `del-${t.slug}`,
      () => postJson(`/digi-gastro-admin/tenant-delete/${t.slug}`),
      `Tenant gelöscht`
    );
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-500 disabled:opacity-50 sm:col-span-2 sm:w-auto sm:justify-self-start"
          >
            {busy === "create" ? "Erstelle…" : "Anlegen"}
          </button>
        </div>
      </section>

      <div className="hidden overflow-x-auto rounded-xl border border-zinc-800 lg:block">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-zinc-900 text-left text-xs uppercase text-zinc-400">
            <tr>
              <th className="sticky left-0 z-20 bg-zinc-900 px-4 py-3">Restaurant</th>
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
                <td className="sticky left-0 z-10 bg-zinc-950 px-4 py-3">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.email}</div>
                  <div className="mt-1 text-[11px] text-zinc-600">
                    {t.is_setup_completed ? "Setup ✓" : "Setup ✗"} ·{" "}
                    {t.orders_enabled ? "Bestellung ✓" : "Bestellung ✗"} ·{" "}
                    {t.loyalty_enabled ? "Loyalty ✓" : "Loyalty ✗"} ·{" "}
                    {t.chat_enabled ? "Chat ✓" : "Chat ✗"} ·{" "}
                    {playWorldEnabled(t) ? "Play ✓" : "Play ✗"} ·{" "}
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
                          `chat-${t.slug}`,
                          () => postJson(`/digi-gastro-admin/tenant-chat-toggle/${t.slug}`),
                          `Chat ${t.chat_enabled ? "aus" : "an"}: ${t.name}`
                        )
                      }
                    >
                      Chat {t.chat_enabled ? "aus" : "an"}
                    </button>
                    <button
                      className={btnCls}
                      disabled={busy !== null}
                      onClick={() =>
                        void act(
                          `play-${t.slug}`,
                          () => postJson(`/digi-gastro-admin/tenant-play-toggle/${t.slug}`),
                          `Play World ${playWorldEnabled(t) ? "aus" : "an"}: ${t.name}`
                        )
                      }
                    >
                      Play World {playWorldEnabled(t) ? "aus" : "an"}
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
                    <button
                      className="rounded-lg border border-sky-700 bg-sky-900 px-2.5 py-1 text-xs font-medium text-sky-200 hover:border-sky-500 hover:text-sky-100 disabled:opacity-50"
                      disabled={busy !== null}
                      onClick={() => void impersonate(t.slug)}
                    >
                      Einloggen
                    </button>
                    <button
                      className="rounded-lg border border-red-800 bg-red-950 px-2.5 py-1 text-xs font-medium text-red-300 hover:border-red-500 hover:text-red-200 disabled:opacity-50"
                      disabled={busy !== null}
                      onClick={() => void deleteTenant(t)}
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card-Liste (gleiche Daten/Aktionen wie die Tabelle oben) */}
      <div className="grid gap-3 lg:hidden">
        {tenants.map((t) => (
          <div key={t.slug} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-semibold">{t.name}</div>
                <div className="truncate text-xs text-zinc-500">{t.email}</div>
                <a href={`/${t.slug}`} className="font-mono text-xs text-zinc-400 hover:text-amber-400">
                  /{t.slug}
                </a>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  t.active ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                }`}
              >
                {t.active ? "aktiv" : "deaktiviert"}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-zinc-600">
              {t.is_setup_completed ? "Setup ✓" : "Setup ✗"} ·{" "}
              {t.orders_enabled ? "Bestellung ✓" : "Bestellung ✗"} ·{" "}
              {t.loyalty_enabled ? "Loyalty ✓" : "Loyalty ✗"} ·{" "}
              {t.chat_enabled ? "Chat ✓" : "Chat ✗"} ·{" "}
              {playWorldEnabled(t) ? "Play ✓" : "Play ✗"} ·{" "}
              {t.show_revenue ? "Umsatz ✓" : "Umsatz ✗"}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span>{t._count.products} Produkte</span>
              <span>{t._count.orders} Bestellungen</span>
              <span>{t._count.loyaltyCustomers} Loyalty</span>
              <span className="font-semibold">{formatEur(t.tagesumsatz ?? 0)}</span>
              <span className="text-xs text-zinc-400">Tier: {t.tier ?? "—"}</span>
            </div>
            <div className="mt-2">
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 sm:w-auto"
                value={t.operating_mode ?? "full"}
                onChange={(e) => void setMode(t, e.target.value)}
                disabled={busy === `mode-${t.slug}`}
              >
                <option value="full">full</option>
                <option value="menu_only">menu_only</option>
                <option value="stempelkarte_only">stempelkarte_only</option>
              </select>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                className={`${btnCls} w-full`}
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
                className={`${btnCls} w-full`}
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
                className={`${btnCls} w-full`}
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
                className={`${btnCls} w-full`}
                disabled={busy !== null}
                onClick={() =>
                  void act(
                    `chat-${t.slug}`,
                    () => postJson(`/digi-gastro-admin/tenant-chat-toggle/${t.slug}`),
                    `Chat ${t.chat_enabled ? "aus" : "an"}: ${t.name}`
                  )
                }
              >
                Chat {t.chat_enabled ? "aus" : "an"}
              </button>
              <button
                className={`${btnCls} w-full`}
                disabled={busy !== null}
                onClick={() =>
                  void act(
                    `play-${t.slug}`,
                    () => postJson(`/digi-gastro-admin/tenant-play-toggle/${t.slug}`),
                    `Play World ${playWorldEnabled(t) ? "aus" : "an"}: ${t.name}`
                  )
                }
              >
                Play World {playWorldEnabled(t) ? "aus" : "an"}
              </button>
              <button
                className={`${btnCls} w-full`}
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
                className={`${btnCls} w-full`}
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
              <button className={`${btnCls} w-full`} disabled={busy !== null} onClick={() => void editName(t)}>
                Name ändern
              </button>
              <button
                className={`${btnCls} w-full`}
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
              <button className={`${btnCls} w-full`} disabled={busy !== null} onClick={() => void adjustRevenue(t)}>
                Umsatz anpassen
              </button>
              <button className={`${btnCls} w-full`} disabled={busy !== null} onClick={() => void cleanupOrders(t)}>
                Bestellungen bereinigen
              </button>
              <button
                className="w-full rounded-lg border border-sky-700 bg-sky-900 px-2.5 py-1 text-xs font-medium text-sky-200 hover:border-sky-500 hover:text-sky-100 disabled:opacity-50"
                disabled={busy !== null}
                onClick={() => void impersonate(t.slug)}
              >
                Einloggen
              </button>
              <button
                className="w-full rounded-lg border border-red-800 bg-red-950 px-2.5 py-1 text-xs font-medium text-red-300 hover:border-red-500 hover:text-red-200 disabled:opacity-50"
                disabled={busy !== null}
                onClick={() => void deleteTenant(t)}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Neuigkeiten / Tenant-Onboarding */}
      <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-amber-400">
          Neuigkeiten (Tenant-Onboarding)
        </h2>
        <p className="mb-3 text-xs text-zinc-500">
          Erscheint als animiertes Popup im Admin-Dashboard — einmal pro
          Gerät: dasselbe Login auf einem neuen Handy/Tablet/PC zeigt die
          Neuigkeit erneut. Beim Löschen erscheint sie auf allen Geräten
          wieder.
        </p>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className={labelCls}>Titel</label>
            <input
              className={inputCls}
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="z.B. Neu: Gast-Chat 🎉"
              maxLength={120}
            />
          </div>
          <div>
            <label className={labelCls}>Icon (Material-Symbol)</label>
            <input
              className={inputCls}
              value={annIcon}
              onChange={(e) => setAnnIcon(e.target.value)}
              placeholder="forum / celebration / chat_bubble"
              maxLength={40}
            />
          </div>
          <button
            onClick={() => void createAnnouncement()}
            disabled={busy === "ann-create" || !annTitle.trim() || !annBody.trim()}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-500 disabled:opacity-50"
          >
            {busy === "ann-create" ? "Veröffentliche…" : "Veröffentlichen"}
          </button>
        </div>
        <div className="mb-4">
          <label className={labelCls}>Text</label>
          <textarea
            className={`${inputCls} w-full`}
            rows={3}
            value={annBody}
            onChange={(e) => setAnnBody(e.target.value)}
            placeholder="Was ist neu? Was sollte der Tenant wissen/tun?"
            maxLength={1000}
          />
        </div>

        <div className="flex flex-col gap-2">
          {announcements.length === 0 ? (
            <p className="text-sm text-zinc-500">Noch keine Neuigkeiten.</p>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                    <span className="material-symbols-outlined text-base text-amber-400">
                      {a.icon || "celebration"}
                    </span>
                    {a.title}
                    {!a.is_active ? (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                        inaktiv
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{a.body}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    className={btnCls}
                    disabled={busy !== null}
                    onClick={() =>
                      void act(
                        `ann-toggle-${a.id}`,
                        () => postJson(`/digi-gastro-admin/announcement-toggle/${a.id}`),
                        `Neuigkeit ${a.is_active ? "deaktiviert" : "aktiviert"}`
                      )
                    }
                  >
                    {a.is_active ? "Deaktivieren" : "Aktivieren"}
                  </button>
                  <button
                    className="rounded-lg border border-red-800 bg-red-950 px-2.5 py-1 text-xs font-medium text-red-300 hover:border-red-500 disabled:opacity-50"
                    disabled={busy !== null}
                    onClick={() =>
                      void act(
                        `ann-del-${a.id}`,
                        () => postJson(`/digi-gastro-admin/announcement-loeschen/${a.id}`),
                        "Neuigkeit gelöscht"
                      )
                    }
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Rabatt-Vouchers */}
      <VoucherPanel tenants={tenants.map((t) => ({ slug: t.slug, name: t.name }))} />
    </div>
  );
}