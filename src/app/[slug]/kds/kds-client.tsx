"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createLiveClient } from "@/lib/live";
import { zoneBadgeClass } from "@/lib/zoneColor";
import {
  playNewOrderAlert,
  playServiceCallAlert,
  unlockAudio,
} from "@/lib/notifySound";
import type { LiveItem, LiveOrder, ServiceCall, TabletStatus } from "../admin/admin-types";

interface KdsClientProps {
  slug: string;
  tenantName: string;
  enabled: boolean;
  visibleSuperGroupIds: number[];
  visibleProductIds: number[];
  serviceTypes: string[];
  superGroups: { id: number; name: string; color: string; icon: string }[];
}

// Anzeige-Label + Icon je Service-Ruf-Typ (für Kacheln/Überschrift).
const SERVICE_CALL_META: Record<string, { label: string; icon: string }> = {
  kellner: { label: "Kellner rufen", icon: "room_service" },
  kohle: { label: "Kohle bestellen", icon: "local_fire_department" },
  rechnung: { label: "Rechnung", icon: "receipt_long" },
  bar: { label: "Barzahlung", icon: "payments" },
  karte: { label: "Kartenzahlung", icon: "credit_card" },
};

function serviceCallLabel(type: string): string {
  return SERVICE_CALL_META[type]?.label ?? type;
}

// Tischname wie serverseitig ("Tisch 1 (Draußen)") in Nummer + Zone zerlegen.
function parseTableLabel(raw: string): { number: string; zone: string } {
  let s = String(raw ?? "").trim();
  if (s.startsWith("Tisch ")) s = s.slice(6).trim();
  let zone = "";
  const m = s.match(/^(.*?)\s*\((.*)\)\s*$/);
  if (m) {
    zone = m[2].trim();
    s = m[1].trim();
  }
  return { number: s, zone };
}

// Muss identisch zu admin-client.tsx buildItemKey sein (Serve-Endpoint
// matcht darüber; fällt bei Key-Drift tolerant auf product_id zurück).
function buildItemKey(
  it: Pick<LiveItem, "product_id" | "note" | "item_status" | "combo_id" | "combo_instance_id">
): string {
  const noteSlug = (it.note ?? "").replace(/\s+/g, "_");
  const comboId = it.combo_id ?? "";
  const inst = it.combo_instance_id ?? "";
  return `${it.product_id}_${noteSlug}_${it.item_status}_${comboId}_${inst}_0`;
}

// Berliner Wanduhrzeit "YYYY-MM-DD HH:MM:SS" → Minuten seit Bestellung.
function minutesSince(ts: string, nowMs: number): number | null {
  try {
    const m = ts.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (!m) return null;
    const then = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
    const nowStr = new Date(nowMs).toLocaleString("sv-SE", {
      timeZone: "Europe/Berlin",
    });
    const n = nowStr.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (!n) return null;
    const now = Date.UTC(+n[1], +n[2] - 1, +n[3], +n[4], +n[5], +n[6]);
    return Math.max(0, Math.floor((now - then) / 60000));
  } catch {
    return null;
  }
}

function clockOf(ts: string): string {
  const m = ts.match(/[ T](\d{2}:\d{2})/);
  return m ? m[1] : "";
}

interface KdsLine {
  order: LiveOrder;
  item: LiveItem;
}

interface KdsGroup {
  table: string;
  zone: string;
  lines: KdsLine[];
  count: number;
}

export default function KdsClient({
  slug,
  tenantName,
  enabled,
  visibleSuperGroupIds,
  visibleProductIds,
  serviceTypes,
  superGroups,
}: KdsClientProps) {
  const [status, setStatus] = useState<TabletStatus | null>(null);
  const [offline, setOffline] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const router = useRouter();
  const seenOrderIds = useRef<Set<number> | null>(null);
  const seenCallMaxId = useRef<number | null>(null);

  const visibleProducts = useMemo(
    () => new Set(visibleProductIds),
    [visibleProductIds]
  );
  const serviceTypeSet = useMemo(
    () => new Set(serviceTypes),
    [serviceTypes]
  );

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch("/api/tablet-status", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = (await res.json()) as TabletStatus & { error?: string };
      if (data.error) {
        setOffline(false);
        setStatus(null);
        return;
      }
      setStatus(data);
      setOffline(false);

      // Neue relevante Bestellungen / Service-Rufe akustisch melden.
      if (enabled) {
        const relevantOrderIds = new Set(
          (data.orders ?? [])
            .filter((o) =>
              o.items.some((it) => visibleProducts.has(it.product_id))
            )
            .map((o) => o.id)
        );
        if (seenOrderIds.current === null) {
          seenOrderIds.current = relevantOrderIds; // erster Ladevorgang: still
        } else {
          const hasNew = [...relevantOrderIds].some(
            (id) => !seenOrderIds.current!.has(id)
          );
          if (hasNew) playNewOrderAlert();
          seenOrderIds.current = relevantOrderIds;
        }

        const maxCallId = (data.service_calls ?? [])
          .filter((c) => serviceTypeSet.has(c.type))
          .reduce((m, c) => Math.max(m, c.id), 0);
        if (seenCallMaxId.current === null) {
          seenCallMaxId.current = maxCallId;
        } else if (maxCallId > seenCallMaxId.current) {
          playServiceCallAlert();
          seenCallMaxId.current = maxCallId;
        }
      }
    } catch {
      setOffline(true);
    } finally {
      setLoaded(true);
    }
  }, [router, enabled, visibleProducts, serviceTypeSet]);

  useEffect(() => {
    const initial = setTimeout(() => void fetchLive(), 0);
    const debounceRef = { t: null as ReturnType<typeof setTimeout> | null };
    const client = createLiveClient(slug, {
      channels: ["update", "new_order", "service_call", "refresh_tables"],
      onEvent: () => {
        if (debounceRef.t) clearTimeout(debounceRef.t);
        debounceRef.t = setTimeout(() => void fetchLive(), 300);
      },
    });
    const poll = setInterval(() => void fetchLive(), 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchLive();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(initial);
      client.close();
      clearInterval(poll);
      if (debounceRef.t) clearTimeout(debounceRef.t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchLive, slug]);

  // Minuten-Anzeige regelmäßig aktualisieren.
  useEffect(() => {
    const iv = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(iv);
  }, []);

  // Audio nach der ersten Nutzer-Interaktion freischalten (Autoplay-Policy).
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  // Offene, sichtbare Positionen → nach Tisch gruppieren.
  const groups = useMemo<KdsGroup[]>(() => {
    const map = new Map<string, KdsGroup>();
    for (const o of status?.orders ?? []) {
      const pending = o.items.filter(
        (it) =>
          visibleProducts.has(it.product_id) &&
          (it.item_status || "pending") !== "delivered"
      );
      if (pending.length === 0) continue;
      const { number, zone } = parseTableLabel(o.table);
      const label = `Tisch ${number}${zone ? ` · ${zone}` : ""}`;
      const g = map.get(label) ?? { table: o.table, zone, lines: [], count: 0 };
      for (const it of pending) g.lines.push({ order: o, item: it });
      g.count += pending.reduce((s, it) => s + it.quantity, 0);
      map.set(label, g);
    }
    return [...map.values()].sort((a, b) => {
      const an = parseInt(parseTableLabel(a.table).number, 10);
      const bn = parseInt(parseTableLabel(b.table).number, 10);
      if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn;
      return a.table.localeCompare(b.table);
    });
  }, [status, visibleProducts]);

  const serviceCalls = useMemo<ServiceCall[]>(
    () =>
      (status?.service_calls ?? []).filter((c) => serviceTypeSet.has(c.type)),
    [status, serviceTypeSet]
  );

  const flashError = useCallback((msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }, []);

  const serveItems = useCallback(
    async (pairs: KdsLine[]) => {
      if (pairs.length === 0) return;
      const keys = new Set<string>();
      for (const p of pairs) keys.add(`${p.order.id}:${p.item.id}`);
      setBusy((prev) => new Set([...prev, ...keys]));

      const byOrder = new Map<number, { order: LiveOrder; itemKeys: string[] }>();
      for (const { order, item } of pairs) {
        const rec = byOrder.get(order.id) ?? { order, itemKeys: [] };
        rec.itemKeys.push(buildItemKey(item));
        byOrder.set(order.id, rec);
      }

      try {
        const responses = await Promise.all(
          [...byOrder.values()].map(({ order, itemKeys }) =>
            fetch("/admin/orders/serve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: order.id,
                item_keys: itemKeys,
                all_units: true,
              }),
            })
          )
        );
        if (responses.some((r) => !r.ok)) {
          const failed = responses.find((r) => !r.ok);
          const data = (await failed?.json().catch(() => ({}))) as {
            error?: string;
            detail?: string;
          };
          throw new Error(data?.error || data?.detail || "Fehler");
        }
        await fetchLive();
      } catch (e) {
        flashError(
          e instanceof Error && e.message !== "Fehler"
            ? e.message
            : "Servieren fehlgeschlagen"
        );
        await fetchLive();
      } finally {
        setBusy((prev) => {
          const next = new Set(prev);
          for (const k of keys) next.delete(k);
          return next;
        });
      }
    },
    [fetchLive, flashError]
  );

  const clearCall = useCallback(
    async (c: ServiceCall) => {
      setBusy((prev) => new Set(prev).add(`call:${c.id}`));
      try {
        const res = await fetch(`/${slug}/service-erledigt/${c.id}`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Fehler");
        await fetchLive();
      } catch {
        flashError("Service-Ruf konnte nicht abgeschlossen werden");
      } finally {
        setBusy((prev) => {
          const next = new Set(prev);
          next.delete(`call:${c.id}`);
          return next;
        });
      }
    },
    [fetchLive, flashError, slug]
  );

  const openCount = groups.reduce((s, g) => s + g.lines.length, 0);

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-amber-400">
            soup_kitchen
          </span>
          <span className="text-lg font-black tracking-tight">
            {tenantName}
          </span>
          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300">
            KDS
          </span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-xs">
          <span
            className={`flex items-center gap-1.5 ${
              offline ? "text-red-400" : "text-emerald-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                offline ? "bg-red-500" : "animate-pulse bg-emerald-500"
              }`}
            />
            {offline ? "Offline" : "Live"}
          </span>
          <span className="text-zinc-400">
            {openCount} offen · {groups.length} Tische
          </span>
          <button
            onClick={() => void fetchLive()}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 font-bold text-zinc-200 hover:border-zinc-500"
          >
            Aktualisieren
          </button>
          <a
            href={`/${slug}/admin`}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 font-bold text-zinc-200 hover:border-zinc-500"
          >
            Admin
          </a>
        </div>
      </header>

      {error ? (
        <div className="bg-red-600 px-4 py-2 text-center text-sm font-bold text-white">
          {error}
        </div>
      ) : null}

      <div className="flex-1 px-4 py-5 sm:px-6">
        {!enabled ? (
          <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-center sm:p-6 lg:p-8">
            <span className="material-symbols-outlined text-4xl text-zinc-500">
              visibility_off
            </span>
            <h2 className="mt-3 text-lg font-bold">KDS ist nicht aktiviert</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Aktiviere das Küchen-Display im Admin-Bereich unter „KDS“ und
              wähle die sichtbaren Hauptgruppen aus.
            </p>
            <a
              href={`/${slug}/admin`}
              className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
            >
              Zum Admin
            </a>
          </div>
        ) : (
          <>
            {serviceCalls.length > 0 ? (
              <section className="mb-5">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-amber-400">
                  <span className="material-symbols-outlined text-lg">
                    notifications_active
                  </span>
                  Service-Rufe
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {serviceCalls.map((c) => {
                    const { number, zone } = parseTableLabel(c.table);
                    const isBusy = busy.has(`call:${c.id}`);
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
                      >
                        <div>
                          <p className="text-lg font-black">
                            Tisch {number}
                            {zone ? (
                              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${zoneBadgeClass(zone)}`}>
                                {zone}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-amber-300">
                            {serviceCallLabel(c.type)} · {clockOf(c.timestamp)}
                          </p>
                        </div>
                        <button
                          disabled={isBusy}
                          onClick={() => void clearCall(c)}
                          className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50"
                        >
                          Erledigt
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {!loaded ? (
              <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-zinc-500">
                  progress_activity
                </span>
                <p className="mt-3 text-sm text-zinc-400">
                  Lade Bestellungen…
                </p>
              </div>
            ) : groups.length === 0 && serviceCalls.length === 0 ? (
              <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-zinc-600">
                  check_circle
                </span>
                <p className="mt-3 text-lg font-bold">Alles erledigt</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Keine offenen Bestellungen für die gewählten Hauptgruppen.
                </p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {groups.map((g) => {
                const { number, zone } = parseTableLabel(g.table);
                const allBusy = g.lines.every((l) =>
                  busy.has(`${l.order.id}:${l.item.id}`)
                );
                return (
                  <section
                    key={g.table}
                    className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black">Tisch {number}</span>
                        {zone ? (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${zoneBadgeClass(zone)}`}>
                            {zone}
                          </span>
                        ) : null}
                        <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
                          {g.count}
                        </span>
                      </div>
                      <button
                        disabled={allBusy}
                        onClick={() => void serveItems(g.lines)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                      >
                        Tisch servieren
                      </button>
                    </div>
                    <ul className="divide-y divide-zinc-800">
                      {g.lines.map(({ order, item }) => {
                        const key = `${order.id}:${item.id}`;
                        const isBusy = busy.has(key);
                        const mins = minutesSince(order.timestamp, nowMs);
                        return (
                          <li
                            key={key}
                            className="flex items-center gap-3 px-4 py-3"
                          >
                            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-zinc-800 px-2 text-base font-black text-amber-300">
                              {item.quantity}×
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-bold">
                                {item.name}
                              </p>
                              <p className="truncate text-xs text-zinc-400">
                                {item.note ? `${item.note} · ` : ""}
                                {clockOf(order.timestamp)}
                                {mins !== null ? ` · vor ${mins} Min` : ""}
                              </p>
                            </div>
                            <button
                              disabled={isBusy}
                              onClick={() => void serveItems([{ order, item }])}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                            >
                              Servieren
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-zinc-800 px-4 py-2 text-center text-[11px] text-zinc-600 sm:px-6">
        Sichtbar:{" "}
        {superGroups
          .filter((sg) => visibleSuperGroupIds.includes(sg.id))
          .map((sg) => sg.name)
          .join(", ") || "—"}
        {" · "}
        Abrechnung erfolgt über Live-Tische.
      </footer>
    </main>
  );
}
