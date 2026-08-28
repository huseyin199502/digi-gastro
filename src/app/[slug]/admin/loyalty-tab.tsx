"use client";

// ──────────────────────────────────────────────────────────────────
// Etappe 8 — Loyalty-Tab im Admin-Dashboard.
// Übersicht (Analytics, Karten, Kampagnen, Wallet-Config) + Kundenliste
// auf Basis der /admin/loyalty/* Routen.
// ──────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";

interface LoyaltyAnalytics {
  total_cards: number;
  active_cards: number;
  total_customers: number;
  active_customers_30d: number;
  total_stamps: number;
  rewards_redeemed: number;
  pushs_sent_30d: number;
  pushs_failed_30d: number;
}

interface LoyaltyCard {
  id: number;
  name: string;
  description: string | null;
  stamps_required: number;
  reward_name: string | null;
  is_active: boolean;
  color_hex: string | null;
  icon: string | null;
}

interface LoyaltyCampaign {
  id: number;
  name: string;
  campaign_type: string | null;
  title: string | null;
  message: string | null;
  is_active: boolean;
}

interface LoyaltyDashboardData {
  analytics: LoyaltyAnalytics;
  tenant: { name: string; logo_url: string; slug: string };
  cards: LoyaltyCard[];
  campaigns: LoyaltyCampaign[];
  geofence: { latitude: number; longitude: number; address: string | null; name: string | null } | null;
  apple_configured: boolean;
  google_configured: boolean;
}

interface LoyaltyCustomer {
  id: number;
  pass_serial: string;
  short_code: string;
  pass_type: string;
  current_stamps: number;
  total_stamps_earned: number;
  rewards_redeemed: number;
  tier: string;
  nickname: string | null;
  last_message: string;
  first_visit_at: string | null;
  last_visit_at: string | null;
  push_opt_out: boolean;
  pass_downloaded_at: string | null;
  has_device_registration: boolean;
  stamps_required: number;
  card_name: string;
  reward_name: string;
}

interface Toast {
  id: number;
  msg: string;
  kind: "success" | "error";
}

function fmtDate(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

export default function LoyaltyTab({ pushToast }: { pushToast: (m: string, k?: Toast["kind"]) => void }) {
  const [section, setSection] = useState<"uebersicht" | "kunden" | "diagnose">("uebersicht");
  const [data, setData] = useState<LoyaltyDashboardData | null>(null);
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [pagination, setPagination] = useState({ page: 1, per_page: 25, total: 0, total_pages: 1 });

  const loadOverview = useCallback(async () => {
    try {
      const r = await fetch("/admin/loyalty/dashboard");
      if (r.ok) setData(await r.json());
    } catch {
      /* ignore */
    }
  }, []);


  const loadCustomers = useCallback(
    async (page: number) => {
      try {
        const r = await fetch(`/admin/loyalty/customers?page=${page}&per_page=25`);
        if (r.ok) {
          const j = await r.json();
          setCustomers(j.customers ?? []);
          setPagination(j.pagination ?? { page: 1, per_page: 25, total: 0, total_pages: 1 });
        }
      } catch {
        /* ignore */
      }
    },
    []
  );

  useEffect(() => {
    const to = window.setTimeout(() => void loadOverview(), 0);
    return () => window.clearTimeout(to);
  }, [loadOverview]);

  useEffect(() => {
    const to = window.setTimeout(() => void loadCustomers(1), 0);
    return () => window.clearTimeout(to);
  }, [loadCustomers]);


  const setStamps = async (c: LoyaltyCustomer) => {
    const raw = window.prompt(
      `Stempel für ${c.nickname ?? c.short_code} setzen (max ${c.stamps_required}):`,
      String(c.current_stamps)
    );
    if (raw == null) return;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > c.stamps_required) {
      pushToast("Ungültige Stempelanzahl", "error");
      return;
    }
    try {
      const r = await fetch(`/admin/loyalty/customer/${c.id}/set-stamps?stamps=${n}`, {
        method: "POST",
      });
      if (r.ok) {
        pushToast("Stempel aktualisiert");
        await loadCustomers(pagination.page);
      } else {
        const j = await r.json().catch(() => ({}));
        pushToast(String(j.detail ?? "Fehler"), "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    }
  };

  const sendMessage = async (c: LoyaltyCustomer) => {
    const message = window.prompt(
      `Nachricht an ${c.nickname ?? c.short_code} senden:`,
      ""
    );
    if (message == null) return;
    const msg = message.trim();
    if (!msg) return;
    if (
      !window.confirm(
        `Nachricht an Kunden "${c.nickname ?? c.short_code}" (${c.short_code}) senden?\n\n"${msg}"`
      )
    ) {
      return;
    }
    try {
      const r = await fetch("/admin/loyalty/quick-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, customer_id: c.id }),
      });
      const j = (await r.json().catch(() => ({}))) as { success?: boolean; stats?: { pushs_sent?: number } };
      if (r.ok && j.success) {
        pushToast(
          `Nachricht gesendet${j.stats?.pushs_sent ? ` (${j.stats.pushs_sent} Kunde)` : ""}`
        );
      } else {
        pushToast("Nachricht konnte nicht gesendet werden", "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Loyalty &amp; Stempelkarten</h2>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "uebersicht", label: "Übersicht" },
            { id: "kunden", label: "Kunden" },
            { id: "diagnose", label: "Diagnose" },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              section === s.id
                ? "bg-emerald-600 text-white"
                : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "uebersicht" ? (
        <OverviewTab data={data} pushToast={pushToast} onCreated={() => void loadOverview()} />
      ) : section === "kunden" ? (
        <CustomersTab
          customers={customers}
          pagination={pagination}
          onPage={loadCustomers}
          onSetStamps={setStamps}
          onSendMessage={sendMessage}
        />
      ) : (
        <DiagnoseTab pushToast={pushToast} />
      )}
    </div>
  );
}

// ─────────────────────────── Übersicht ───────────────────────────

function OverviewTab({
  data,
  pushToast,
  onCreated,
}: {
  data: LoyaltyDashboardData | null;
  pushToast: (m: string, k?: Toast["kind"]) => void;
  onCreated: () => void;
}) {
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardReward, setCardReward] = useState("");
  const [cardStamps, setCardStamps] = useState("10");
  const [cardBusy, setCardBusy] = useState(false);

  const createCard = async () => {
    if (cardBusy) return;
    if (!cardName.trim() || !cardReward.trim() || !cardStamps.trim()) {
      pushToast("Bitte Name, Belohnung und Stempelanzahl angeben", "error");
      return;
    }
    setCardBusy(true);
    try {
      const r = await fetch("/admin/loyalty/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cardName.trim(),
          reward_name: cardReward.trim(),
          stamps_required: cardStamps.trim(),
        }),
      });
      if (r.ok) {
        pushToast("Stempelkarte erstellt");
        setCardFormOpen(false);
        setCardName("");
        setCardReward("");
        setCardStamps("10");
        onCreated();
      } else {
        const j = await r.json().catch(() => ({}));
        pushToast(String(j.detail ?? "Fehler"), "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setCardBusy(false);
    }
  };

  const deleteCard = async (c: LoyaltyCard) => {
    if (
      !window.confirm(
        `Stempelkarte "${c.name}" wirklich löschen?\nAlle Stempelkarten der Kunden werden entfernt!`
      )
    ) {
      return;
    }
    setCardBusy(true);
    try {
      const r = await fetch(`/admin/loyalty/card/${c.id}`, { method: "DELETE" });
      if (r.ok) {
        pushToast("Stempelkarte gelöscht");
        onCreated();
      } else {
        const j = await r.json().catch(() => ({}));
        pushToast(String(j.detail ?? "Fehler"), "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setCardBusy(false);
    }
  };

  // Nachricht an alle Wallet-Kunden (Backend: /admin/loyalty/quick-send)
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastBusy, setBroadcastBusy] = useState(false);
  const sendBroadcast = async () => {
    const message = broadcastMsg.trim();
    if (!message || broadcastBusy) return;
    if (!window.confirm(`Nachricht an ALLE Kunden senden?\n\n"${message}"`)) return;
    setBroadcastBusy(true);
    try {
      const r = await fetch("/admin/loyalty/quick-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        error?: string;
        pushs_sent?: number;
        pushs_failed?: number;
        total?: number;
      };
      if (!r.ok) {
        pushToast(j.error || "Senden fehlgeschlagen.", "error");
        return;
      }
      pushToast(
        `Nachricht an ${j.total ?? j.pushs_sent ?? 0} Kunde(n) gesendet${j.pushs_failed ? ` — ${j.pushs_failed} fehlgeschlagen` : ""}`
      );
      setBroadcastMsg("");
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBroadcastBusy(false);
    }
  };
  if (!data) {
    return <p className="text-sm text-zinc-500">Wird geladen…</p>;
  }
  const a = data.analytics;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Kunden gesamt" value={String(a.total_customers)} />
        <StatCard label="Aktiv (30 Tage)" value={String(a.active_customers_30d)} />
        <StatCard label="Stempel vergeben" value={String(a.total_stamps)} />
        <StatCard label="Prämien eingelöst" value={String(a.rewards_redeemed)} />
        <StatCard label="Pushs gesendet (30d)" value={String(a.pushs_sent_30d)} />
        <StatCard label="Push-Fehler (30d)" value={String(a.pushs_failed_30d)} />
        <StatCard label="Karten aktiv" value={`${a.active_cards}/${a.total_cards}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">Stempelkarten</h3>
            {data.cards.length === 0 ? (
              <button
                onClick={() => setCardFormOpen((v) => !v)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {cardFormOpen ? "Abbrechen" : "+ Stempelkarte erstellen"}
              </button>
            ) : null}
          </div>

          {cardFormOpen && data.cards.length === 0 ? (
            <div className="mb-3 rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
              <p className="mb-3 text-sm font-semibold text-emerald-300">
                Neue Stempelkarte anlegen
              </p>
              <div className="space-y-2">
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Name (z.B. Stempelkarte)"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
                <input
                  value={cardReward}
                  onChange={(e) => setCardReward(e.target.value)}
                  placeholder="Belohnung (z.B. Shisha gratis)"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
                <input
                  value={cardStamps}
                  onChange={(e) => setCardStamps(e.target.value)}
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Stempel bis Belohnung"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => void createCard()}
                  disabled={cardBusy}
                  className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {cardBusy ? "Erstelle…" : "Stempelkarte erstellen"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-xl border border-zinc-800">
            {data.cards.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0"
              >
                <div>
                  <p className="font-semibold">
                    <span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: c.color_hex ?? "#10b981" }} />
                    {c.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {c.stamps_required} Stempel → {c.reward_name ?? "Belohnung"}
                    {c.is_active ? "" : " · inaktiv"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      c.is_active ? "bg-emerald-900/60 text-emerald-300" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {c.is_active ? "aktiv" : "inaktiv"}
                  </span>
                  <button
                    onClick={() => void deleteCard(c)}
                    disabled={cardBusy}
                    className="rounded-lg bg-red-900/60 px-2.5 py-1 text-xs font-bold text-red-300 hover:bg-red-800 disabled:opacity-50"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
            {data.cards.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500">Keine Stempelkarten.</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          {/* Nachricht an alle Wallet-Kunden senden (Quick-Send) */}
          <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
            <h3 className="mb-1 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-lg text-emerald-400">campaign</span>
              Nachricht an alle Kunden
            </h3>
            <p className="mb-3 text-xs text-zinc-400">
              Erscheint als Push auf den Wallet-Karten aller Kunden (ohne Opt-out).
            </p>
            <textarea
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              maxLength={200}
              rows={2}
              placeholder="z.B. Heute: 2 für 1 auf alle Shishas! 🎉"
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-500">{broadcastMsg.length}/200</span>
              <button
                onClick={() => void sendBroadcast()}
                disabled={broadcastMsg.trim().length === 0 || broadcastBusy}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px]"
              >
                {broadcastBusy ? "Wird gesendet…" : "An alle senden"}
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-bold">Kampagnen</h3>
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              {data.campaigns.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0"
                >
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-zinc-500">
                      {c.title ?? c.campaign_type ?? "—"}
                      {c.message ? ` — ${c.message}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      c.is_active ? "bg-emerald-900/60 text-emerald-300" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {c.is_active ? "aktiv" : "inaktiv"}
                  </span>
                </div>
              ))}
              {data.campaigns.length === 0 ? (
                <p className="px-4 py-6 text-sm text-zinc-500">Keine Kampagnen.</p>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-bold">Wallet-Konfiguration</h3>
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0">
                <span>Apple Wallet</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${data.apple_configured ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/50 text-red-300"}`}>
                  {data.apple_configured ? "konfiguriert" : "nicht konfiguriert"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0">
                <span>Google Wallet</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${data.google_configured ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/50 text-red-300"}`}>
                  {data.google_configured ? "konfiguriert" : "nicht konfiguriert"}
                </span>
              </div>
              {data.geofence ? (
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0">
                  <span>Geofence</span>
                  <span className="text-zinc-400">
                    {data.geofence.name ?? data.geofence.address ?? `${data.geofence.latitude.toFixed(4)}, ${data.geofence.longitude.toFixed(4)}`}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Kunden ───────────────────────────

function CustomersTab(props: {
  customers: LoyaltyCustomer[];
  pagination: { page: number; per_page: number; total: number; total_pages: number };
  onPage: (page: number) => Promise<void>;
  onSetStamps: (c: LoyaltyCustomer) => Promise<void>;
  onSendMessage: (c: LoyaltyCustomer) => Promise<void>;
}) {
  const { customers, pagination, onPage, onSetStamps, onSendMessage } = props;
  return (
    <div>
      <div className="mb-3 text-sm text-zinc-400">
        {pagination.total} Kunden · Seite {pagination.page}/{pagination.total_pages}
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400">
              <th className="px-4 py-2.5">Kunde</th>
              <th className="px-4 py-2.5">Code</th>
              <th className="px-4 py-2.5">Stempel</th>
              <th className="px-4 py-2.5">Tier</th>
              <th className="px-4 py-2.5">Letzter Besuch</th>
              <th className="px-4 py-2.5">Wallet</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const pct = Math.min(100, Math.round((c.current_stamps / Math.max(1, c.stamps_required)) * 100));
              return (
                <tr key={c.id} className="border-b border-zinc-800 bg-zinc-950/50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{c.nickname ?? "—"}</p>
                    <p className="text-xs text-zinc-500">
                      {c.pass_type === "apple" ? "Apple" : "Google"} · {c.pass_serial}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-xs">{c.short_code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <div className="mb-1 flex justify-between text-xs">
                        <span>{c.current_stamps}/{c.stamps_required}</span>
                        <span className="text-zinc-500">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-semibold">{c.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{fmtDate(c.last_visit_at)}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.has_device_registration ? (
                      <span className="text-emerald-400">Gerät registriert</span>
                    ) : (
                      <span className="text-zinc-500">nicht heruntergeladen</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => void onSetStamps(c)}
                        className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                      >
                        Stempel setzen
                      </button>
                      <button
                        onClick={() => void onSendMessage(c)}
                        className="rounded-lg border border-emerald-700 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-950"
                      >
                        Nachricht
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-sm text-zinc-500">
                  Keine Kunden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => void onPage(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          ← Zurück
        </button>
        <span className="text-sm text-zinc-400">
          Seite {pagination.page} / {pagination.total_pages}
        </span>
        <button
          onClick={() => void onPage(pagination.page + 1)}
          disabled={pagination.page >= pagination.total_pages}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── Diagnose ───────────────────────────

interface DiagnoseData {
  stats: {
    total_customers: number;
    total_device_registrations: number;
    customers_with_pass: number;
    customers_with_stamps: number;
    total_stamps_active: number;
    total_rewards_redeemed: number;
    customers_with_device_id: number;
    customers_without_device_id: number;
  };
  duplicate_anonymous_ids: { count: number; groups: Record<string, unknown[]> };
  customers_without_anonymous_id: { count: number; customers: unknown[] };
  orphan_device_registrations: { count: number; registrations: unknown[] };
  multi_device_customers: { count: number; customers: unknown[] };
  duplicate_device_ids: { count: number; groups: Record<string, unknown[]> };
}

function DiagnoseTab({ pushToast }: { pushToast: (m: string, k?: Toast["kind"]) => void }) {
  const [data, setData] = useState<DiagnoseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [passkitLogs, setPasskitLogs] = useState<{ id: number; created_at: string; logs: string[] }[]>([]);
  const [showPasskit, setShowPasskit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/admin/loyalty/diagnose");
      if (r.ok) setData(await r.json());
      else pushToast("Diagnose fehlgeschlagen", "error");
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    const to = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(to);
  }, [load]);

  const deleteAll = async () => {
    if (!window.confirm("Wirklich ALLE Kunden löschen? Dies kann nicht rückgängig gemacht werden!")) return;
    setLoading(true);
    try {
      const r = await fetch("/admin/loyalty/delete-all-customers", { method: "POST" });
      if (r.ok) {
        const j = (await r.json()) as { deleted_count?: number };
        pushToast(`${j.deleted_count ?? 0} Kunden gelöscht`);
        await load();
      } else {
        pushToast("Löschen fehlgeschlagen", "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setLoading(false);
    }
  };

  const s = data?.stats;

  const loadPasskit = async () => {
    setLoading(true);
    try {
      const r = await fetch("/admin/passkit/logs?limit=30");
      if (r.ok) {
        const j = (await r.json()) as { logs: { id: number; created_at: string; logs: string[] }[] };
        setPasskitLogs(j.logs ?? []);
        setShowPasskit(true);
      } else {
        pushToast("PassKit-Logs konnten nicht geladen werden", "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">Diagnose &amp; Datenqualität</h3>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Neu laden
        </button>
      </div>

      {!data ? (
        <p className="text-sm text-zinc-500">Wird geladen…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Kunden gesamt" value={String(s!.total_customers)} />
            <StatCard label="Device-Registrations" value={String(s!.total_device_registrations)} />
            <StatCard label="Mit Wallet-Pass" value={String(s!.customers_with_pass)} />
            <StatCard label="Mit Stempeln" value={String(s!.customers_with_stamps)} />
            <StatCard label="Stempel aktiv" value={String(s!.total_stamps_active)} />
            <StatCard label="Prämien eingelöst" value={String(s!.total_rewards_redeemed)} />
            <StatCard label="Mit Device-ID" value={String(s!.customers_with_device_id)} />
            <StatCard label="Ohne Device-ID" value={String(s!.customers_without_device_id)} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <IssueCard
              title="Duplikate (anonymous_id)"
              count={data.duplicate_anonymous_ids.count}
              detail="Mehrere Kunden mit gleicher anonymous_id (Cookie-Reset)"
            />
            <IssueCard
              title="Ohne anonymous_id"
              count={data.customers_without_anonymous_id.count}
              detail="Legacy/leere Datensätze"
            />
            <IssueCard
              title="Verwaiste Device-Registrations"
              count={data.orphan_device_registrations.count}
              detail="Geräte ohne zugehörigen Kunden"
            />
            <IssueCard
              title="Mehrfach-Geräte-Kunden"
              count={data.multi_device_customers.count}
              detail="Kunden mit mehreren registrierten Geräten"
            />
            <IssueCard
              title="Duplikate (last_known_device_id)"
              count={data.duplicate_device_ids.count}
              detail="Mehrere Kunden auf demselben Gerät"
            />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">PassKit-Logs (iOS)</p>
                <p className="text-xs text-zinc-500">
                  Fehler die Apple an die Wallet-Webservice geschickt hat (z.B. &quot;spurious push&quot;).
                </p>
              </div>
              {!showPasskit ? (
                <button
                  onClick={() => void loadPasskit()}
                  disabled={loading}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Logs laden
                </button>
              ) : (
                <button
                  onClick={() => setShowPasskit(false)}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300"
                >
                  Ausblenden
                </button>
              )}
            </div>
            {showPasskit ? (
              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {passkitLogs.length === 0 ? (
                  <p className="text-sm text-zinc-500">Keine Logs.</p>
                ) : (
                  passkitLogs.map((l) => (
                    <div
                      key={l.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3"
                    >
                      <p className="font-mono text-xs text-zinc-500">{l.created_at}</p>
                      <pre className="mt-1 whitespace-pre-wrap text-xs text-zinc-300">
                        {l.logs.join("\n")}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-4">
            <p className="font-bold text-red-300">Gefährlicher Bereich</p>
            <p className="mb-3 text-xs text-zinc-400">
              Löscht ALLE Loyalty-Kunden inkl. Stempel, Push-Logs und PassKit-Registrations dieses
              Restaurants. Für Demo-Cleanup gedacht.
            </p>
            <button
              onClick={() => void deleteAll()}
              disabled={loading}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold hover:bg-red-600 disabled:opacity-40"
            >
              Alle Kunden löschen
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function IssueCard({ title, count, detail }: { title: string; count: number; detail: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-zinc-500">{detail}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
          count > 0
            ? "bg-red-900/50 text-red-300"
            : "bg-emerald-900/60 text-emerald-300"
        }`}
      >
        {count}
      </span>
    </div>
  );
}