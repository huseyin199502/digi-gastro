"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PersonalTab from "./personal-tab";
import LoyaltyTab from "./loyalty-tab";
import LagerTab from "./lager-tab";
import SitzplanTab from "./sitzplan-tab";
import LandingpageTab from "./landingpage-tab";
import WerbungTab from "./werbung-tab";
import type { LiveItem, LiveOrder, LiveTable, ServiceCall, TabletStatus } from "./admin-types";
import { formatEur } from "./admin-types";

// ─────────────────────────── Types ───────────────────────────

export interface AdminProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  vegan: boolean;
  is_vegan: boolean;
  is_glutenfree: boolean;
  allergens: string[];
  category_type: string | null;
  category: string;
  is_available: boolean;
  happy_hour_price: number | null;
  start_time: string | null;
  end_time: string | null;
  name_en: string;
  description_en: string;
  related_product_ids: number[];
  extras: { name: string; price: number }[];
  variants: { name: string; price: number }[];
}

export interface AdminCategory {
  id: number;
  name: string;
  position: number | null;
  super_group_id: number | null;
  extras: string | null;
}

export interface AdminEvent {
  id: number;
  name: string;
  display_name: string;
  description: string;
  days: string[];
  start_time: string | null;
  end_time: string | null;
  mode: string | null;
  discount: number | null;
  is_active: boolean | null;
  banner_color: string | null;
  position: number | null;
}

export interface TenantSettings {
  address: string;
  plz: string;
  ort: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  theme: string;
  logo_url: string;
  logo_url_2: string;
  pos_system: string;
  pos_api_url: string;
  pos_active: boolean | null;
  show_revenue: boolean | null;
  is_shishabar: boolean;
}

export interface AdminInitial {
  slug: string;
  tenantName: string;
  sessionName: string;
  role: string;
  isOwner: boolean;
  products: AdminProduct[];
  categories: AdminCategory[];
  events: AdminEvent[];
  settings: TenantSettings;
  superGroups: { id: number; name: string; color: string; icon: string }[];
}

export interface Toast {
  id: number;
  msg: string;
  kind: "success" | "error";
}

// ─────────────────────────── Helpers ───────────────────────────

// Parst die Extras-JSON einer Bestellposition und trennt die Variante
// ("Variante: X"-Extra) von echten Extras — für die Chip-Anzeige.
function parseItemExtras(
  raw?: string | null
): { variant: string | null; extras: string[] } {
  if (!raw) return { variant: null, extras: [] };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { variant: null, extras: [] };
    let variant: string | null = null;
    const extras: string[] = [];
    for (const e of parsed) {
      const name = String((e as { name?: unknown })?.name ?? "").trim();
      if (!name) continue;
      if (name.startsWith("Variante:")) {
        variant = name.replace(/^Variante:\s*/, "");
      } else {
        extras.push(name);
      }
    }
    return { variant, extras };
  } catch {
    return { variant: null, extras: [] };
  }
}

// Entfernt automatisch erzeugte Notiz-Segmente ("Variante: …", "Extras: …"),
// da diese strukturiert als Chips angezeigt werden.
function cleanAutoNote(note?: string | null): string {
  if (!note) return "";
  return note
    .split(" | ")
    .filter(
      (seg) =>
        seg.trim() !== "" &&
        !seg.startsWith("Variante:") &&
        !seg.startsWith("Extras:")
    )
    .join(" | ");
}

function buildItemKey(
  it: Pick<LiveItem, "product_id" | "note" | "item_status" | "combo_id" | "combo_instance_id">,
  withIdx: boolean
): string {
  const noteSlug = (it.note ?? "").replace(/\s+/g, "_");
  const comboId = it.combo_id ?? "";
  const inst = it.combo_instance_id ?? "";
  const base = `${it.product_id}_${noteSlug}_${it.item_status}_${comboId}_${inst}`;
  return withIdx ? `${base}_0` : base;
}

// Optimistic-Serve-Overlay: bereits "servierte" Items werden lokal sofort
// als delivered dargestellt, auch wenn ein Poll noch alte Serverdaten
// liefert (verhindert Flackern bis der POST durch ist). Einträge bleiben
// nach Erfolg kurz bestehen (TTL) und fangen noch laufende Stale-Polls ab.
type ServeOverlayEntry = { units: number; ts: number };
type ServeOverlay = Map<string, ServeOverlayEntry>; // `${orderId}:${itemId}` -> optimistisch servierte Einheiten

const SERVE_OVERLAY_TTL_MS = 20000;

function applyServeOverlay(data: TabletStatus, overlay: ServeOverlay): TabletStatus {
  // Abgelaufene Einträge entfernen
  const now = Date.now();
  for (const [k, v] of overlay) {
    if (now - v.ts > SERVE_OVERLAY_TTL_MS) overlay.delete(k);
  }
  if (overlay.size === 0) return data;
  let changed = false;
  const alive = new Set<string>();
  const orders = data.orders.map((o) => {
    let oChanged = false;
    const items = o.items.map((it) => {
      // Eindeutig pro Position (itemId) statt Produkt-Key: Zwei identische
      // Colas haben denselben Produkt-Key, aber verschiedene itemIds — so
      // bleibt beim Einzel-Servieren die ANDERE Cola korrekt offen.
      const key = `${o.id}:${it.id}`;
      const entry = overlay.get(key);
      if (!entry || entry.units <= 0) return it;
      if ((it.item_status || "pending") !== "pending") {
        // Server hat die Servierung bereits verarbeitet → Overlay-Eintrag
        // hat ausgedient und MUSS entfernt werden, sonst würde er eine
        // später neu hinzugefügte Position desselben Produkts "verschlucken".
        return it;
      }
      alive.add(key);
      const q = it.quantity || 1;
      oChanged = true;
      return entry.units >= q ? { ...it, item_status: "delivered" } : { ...it, quantity: q - entry.units };
    });
    if (!oChanged) return o;
    changed = true;
    return { ...o, items };
  });
  // Einträge, die keinen offenen Treffer mehr haben, verwerfen
  for (const k of [...overlay.keys()]) {
    if (!alive.has(k)) overlay.delete(k);
  }
  return changed ? { ...data, orders } : data;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const EU_ALLERGENS = [
  "Gluten",
  "Krebstiere",
  "Eier",
  "Fisch",
  "Erdnüsse",
  "Soja",
  "Milch",
  "Schalenfrüchte",
  "Sellerie",
  "Senf",
  "Sesam",
  "Sulfite",
  "Lupinen",
  "Weichtiere",
];

function daysLabel(days: string[]): string {
  if (!days || days.length === 0) return "Täglich";
  const names: Record<string, string> = {
    Mo: "Mo", Di: "Di", Mi: "Mi", Do: "Do", Fr: "Fr", Sa: "Sa", So: "So",
    Montag: "Mo", Dienstag: "Di", Mittwoch: "Mi", Donnerstag: "Do",
    Freitag: "Fr", Samstag: "Sa", Sonntag: "So",
  };
  const mapped = days.map((d) => names[d] ?? d);
  return mapped.join(", ");
}

// ─────────────────────────── Main component ───────────────────────────

// Akustisches + haptisches Signal für neue Bestellungen.
// Spielt die MP3 ab (Web + PWA — der Service Worker cached sie
// cache-first). Blockiert der Browser Autoplay (noch keine Nutzer-
// Interaktion), fällt das synthetische Signal als Rückfallebene zurück.
const newOrderAudio =
  typeof Audio !== "undefined" ? new Audio("/sounds/neue-bestellung.mp3") : null;
if (newOrderAudio) newOrderAudio.preload = "auto";

function playBeepFallback() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const beep = (start: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.25);
    };
    beep(0, 880);
    beep(0.28, 1100);
    window.setTimeout(() => void ctx.close(), 800);
  } catch {
    // ignore
  }
}

function playNewOrderAlert() {
  try {
    navigator.vibrate?.([120, 80, 120]);
  } catch {
    // ignore
  }
  if (newOrderAudio) {
    try {
      newOrderAudio.currentTime = 0;
      void newOrderAudio.play().catch(() => playBeepFallback());
      return;
    } catch {
      // fall through to beep
    }
  }
  playBeepFallback();
}

// Akustisches Signal für neue Service-Rufe (Kellner/Kohle/Rechnung)
const serviceCallAudio =
  typeof Audio !== "undefined" ? new Audio("/sounds/service-ruf.mp3") : null;
if (serviceCallAudio) serviceCallAudio.preload = "auto";

function playServiceCallAlert() {
  try {
    navigator.vibrate?.([220, 90, 220]);
  } catch {
    // ignore
  }
  if (serviceCallAudio) {
    try {
      serviceCallAudio.currentTime = 0;
      void serviceCallAudio.play().catch(() => {});
    } catch {
      // ignore
    }
  }
}

export default function AdminClient({ initial }: { initial: AdminInitial }) {
  const router = useRouter();
  const { slug } = initial;

  const [tab, setTab] = useState<string>("live");
  const [live, setLive] = useState<TabletStatus | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [busy, setBusy] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string>("gesamt");
  const toastSeq = useRef(0);
  const seenOrderIds = useRef<Set<number> | null>(null);
  // Bekannte offene Menge je Bestellung — wächst sie, ist Nachschub
  // eingegangen (kein neuer Order-ID nötig, um den Ton auszulösen).
  const seenPendingQty = useRef<Map<number, number> | null>(null);
  // Höchste bisher gesehene Service-Call-ID — höhere ID = neuer Ruf.
  const seenCallMaxId = useRef<number | null>(null);
  // Optimistisch servierte Items (siehe applyServeOverlay) — wird nach
  // erfolgreichem POST / fehlgeschlagenem POST wieder geleert.
  const serveOverlayRef = useRef<ServeOverlay>(new Map());

  const pushToast = useCallback((msg: string, kind: Toast["kind"] = "success") => {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { id, msg, kind }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const liveReqSeq = useRef(0);
  const refreshLive = useCallback(async () => {
    const reqId = ++liveReqSeq.current;
    try {
      const res = await fetch("/api/tablet-status");
      if (!res.ok) return;
      const data = (await res.json()) as TabletStatus;
      // Latest-Wins: Eine späte Antwort eines älteren Requests (z.B. Poll,
      // der VOR einem Serve-POST startete) darf den aktuellen Zustand nicht
      // überschreiben — sonst springt das optimistische UI zurück.
      if (reqId !== liveReqSeq.current) return;
      // Neue Bestellungen erkennen → Signal. Zwei Fälle:
      // 1. Ganz neue Bestellung (neue Order-ID)
      // 2. Nachschub auf bereits OFFENER Bestellung (offene Menge wächst —
      //    z.B. "Neue Bestellung"-Sheet mergt in dieselbe Order → keine
      //    neue ID, aber neue offene Positionen)
      if (seenOrderIds.current === null || seenPendingQty.current === null) {
        seenOrderIds.current = new Set(data.orders.map((o) => o.id));
        seenPendingQty.current = new Map(
          data.orders.map((o) => [
            o.id,
            o.items.reduce(
              (s, it) => s + ((it.item_status || "pending") === "pending" ? it.quantity || 1 : 0),
              0
            ),
          ])
        );
      } else {
        const fresh = data.orders.filter(
          (o) => !seenOrderIds.current!.has(o.id) && o.status !== "bezahlt" && o.status !== "storniert"
        );
        for (const o of data.orders) seenOrderIds.current.add(o.id);
        let restocked = false;
        for (const o of data.orders) {
          if (o.status === "bezahlt" || o.status === "storniert") continue;
          const qty = o.items.reduce(
            (s, it) => s + ((it.item_status || "pending") === "pending" ? it.quantity || 1 : 0),
            0
          );
          const prevQty = seenPendingQty.current.get(o.id) ?? 0;
          if (qty > prevQty) restocked = true;
          seenPendingQty.current.set(o.id, qty);
        }
        if (fresh.length > 0 || restocked) playNewOrderAlert();
      }
      // Neue Service-Rufe erkennen → Signal (Kellner/Kohle/Rechnung)
      const maxCallId = (data.service_calls ?? []).reduce(
        (m, c) => Math.max(m, c.id),
        0
      );
      if (seenCallMaxId.current === null) {
        seenCallMaxId.current = maxCallId; // erster Load: still initialisieren
      } else if (maxCallId > seenCallMaxId.current) {
        playServiceCallAlert();
        seenCallMaxId.current = maxCallId;
      }
      setLive(applyServeOverlay(data, serveOverlayRef.current));
    } catch {
      // ignore – polling continues
    }
  }, []);

  // Offline-Erkennung: Banner + Auto-Refresh bei Reconnect
  const [offline, setOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => {
      setOffline(false);
      pushToast("Verbindung wiederhergestellt", "success");
      void refreshLive();
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, [pushToast, refreshLive]);

  // Poll live status
  useEffect(() => {
    const iv = window.setInterval(() => {
      void refreshLive();
    }, 8000);
    const to = window.setTimeout(() => void refreshLive(), 0);
    return () => {
      window.clearInterval(iv);
      window.clearTimeout(to);
    };
  }, [refreshLive]);

  // SSE live updates — mit automatischem Reconnect (Exponential Backoff),
  // sonst bleibt das Cockpit nach einem Verbindungsfehler nur noch auf dem
  // 8s-Poll hängen.
  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimer: number | null = null;
    let retryMs = 1000;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      es = new EventSource(`/api/${slug}/events/stream`);
      es.onopen = () => {
        retryMs = 1000;
      };
      es.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as { type?: string };
          if (msg.type === "update" || msg.type === "refresh_tables") {
            void refreshLive();
          }
        } catch {
          // ignore
        }
      };
      es.onerror = () => {
        es?.close();
        if (!disposed) retryTimer = window.setTimeout(connect, retryMs);
        retryMs = Math.min(retryMs * 2, 15000);
      };
    };
    connect();
    return () => {
      disposed = true;
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      es?.close();
    };
  }, [slug, refreshLive]);

  const postJson = useCallback(
    async (url: string, body: unknown, okMsg: string) => {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          pushToast(data.error || "Fehler", "error");
          return false;
        }
        pushToast(okMsg);
        void refreshLive();
        return true;
      } catch {
        pushToast("Verbindungsfehler", "error");
        return false;
      }
    },
    [pushToast, refreshLive]
  );

  const ordersByTable = useMemo(() => {
    const map = new Map<string, LiveOrder[]>();
    for (const o of live?.orders ?? []) {
      const list = map.get(o.table) ?? [];
      list.push(o);
      map.set(o.table, list);
    }
    return map;
  }, [live]);

  const activeTableOrders = selectedTable
    ? ordersByTable.get(selectedTable) ?? []
    : [];

  const filteredTables = useMemo(() => {
    const list = live?.tables ?? [];
    let out = list;
    if (zoneFilter === "gesamt") out = list;
    else if (zoneFilter === "aktiv") {
      const activeSet = new Set<string>();
      for (const o of live?.orders ?? []) activeSet.add(o.table);
      out = list.filter((t) => {
        const label = t.zone ? `Tisch ${t.number} (${t.zone})` : `Tisch ${t.number}`;
        return activeSet.has(label);
      });
    } else {
      out = list.filter((t) => (t.zone || "").toLowerCase() === zoneFilter.toLowerCase());
    }
    return [...out].sort((a, b) => {
      const an = parseInt(String(a.number), 10);
      const bn = parseInt(String(b.number), 10);
      if (an !== bn) return an - bn;
      return (a.zone || "").localeCompare(b.zone || "");
    });
  }, [live, zoneFilter]);

  const zoneCounts = useMemo(() => {
    const activeSet = new Set<string>();
    for (const o of live?.orders ?? []) activeSet.add(o.table);
    const counts: Record<string, number> = { gesamt: 0, aktiv: 0 };
    for (const t of live?.tables ?? []) {
      counts.gesamt += 1;
      const label = t.zone ? `Tisch ${t.number} (${t.zone})` : `Tisch ${t.number}`;
      if (activeSet.has(label)) counts.aktiv += 1;
      const zone = (t.zone || "").toLowerCase();
      if (zone) counts[zone] = (counts[zone] ?? 0) + 1;
    }
    return counts;
  }, [live]);

  const pendingCountFor = useCallback(
    (tableLabel: string): number => {
      let n = 0;
      for (const o of ordersByTable.get(tableLabel) ?? []) {
        for (const it of o.items) {
          if ((it.item_status || "pending") === "pending") n += it.quantity;
        }
      }
      return n;
    },
    [ordersByTable]
  );

  const tableTotal = useCallback(
    (tableLabel: string): number => {
      let sum = 0;
      for (const o of ordersByTable.get(tableLabel) ?? []) {
        sum += o.total ?? 0;
      }
      return sum;
    },
    [ordersByTable]
  );

  // ── Order actions ──
  // Sofortiges UI: Items werden lokal sofort als serviert markiert (Overlay),
  // der POST läuft im Hintergrund. Schlägt er fehl → Overlay verwerfen,
  // Serverstand neu laden und Fehler toasten.
  const serveItemsBulk = useCallback(
    async (entries: { o: LiveOrder; it: LiveItem }[], okMsg?: string) => {
      const valid = entries.filter((e) => (e.it.item_status || "pending") !== "delivered" && e.it.quantity > 0);
      if (valid.length === 0) return;

      // 1. Overlay aufbauen + lokal sofort anwenden
      const byOrder = new Map<
        number,
        { o: LiveOrder; entries: number; keys: string[]; units: number; itemIds: number[] }
      >();
      let totalUnits = 0;
      for (const { o, it } of valid) {
        const key = buildItemKey(it, true);
        // Overlay eindeutig pro Position (itemId), damit identische Produkte
        // (zwei Colas) nicht fälschlich gemeinsam als serviert markiert werden.
        serveOverlayRef.current.set(`${o.id}:${it.id}`, { units: it.quantity, ts: Date.now() });
        totalUnits += it.quantity;
        const rec = byOrder.get(o.id) ?? { o, entries: 0, keys: [], units: 0, itemIds: [] };
        rec.entries += 1;
        rec.keys.push(key);
        rec.itemIds.push(it.id);
        rec.units += it.quantity;
        byOrder.set(o.id, rec);
      }
      setLive((prev) => (prev ? applyServeOverlay(prev, serveOverlayRef.current) : prev));

      // 2. Ein POST pro betroffener Bestellung — parallel, nicht sequentiell.
      //    Werden ALLE offenen Positionen einer Bestellung bedient, schicken
      //    wir die Bestellung ohne item_keys (serviert alles) — so bleiben
      //    identische Produkte (zwei Colas) getrennt und beide werden bedient,
      //    statt vom Duplikat-Key-Dedup nur eine zu erwischen.
      const bodies = [...byOrder.entries()].map(([orderId, r]) => {
        const pendingCount = r.o.items.filter(
          (x) => (x.item_status || "pending") === "pending"
        ).length;
        const serveWhole = r.entries >= pendingCount;
        return {
          orderId,
          body: serveWhole
            ? { order_id: orderId, all_units: true }
            : { order_id: orderId, item_keys: r.keys, all_units: true },
        };
      });
      try {
        const responses = await Promise.all(
          bodies.map(({ orderId, body }) =>
            fetch("/admin/orders/serve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
          )
        );
        if (responses.some((res) => !res.ok)) {
          const failed = responses.find((res) => !res.ok);
          const data = (await failed?.json().catch(() => ({}))) as { error?: string };
          throw new Error(data?.error || "Fehler");
        }
        const payloads = (await Promise.all(
          responses.map((res) => res.json().catch(() => ({}) as { served?: number }))
        )) as { served?: number }[];
        const totalServed = payloads.reduce((s, p) => s + (p.served ?? 0), 0);
        if (totalServed === 0) {
          // Server hat nichts bedient (z.B. zweites Gerät war schneller oder
          // Key-Drift) → optimistische Anzeige SOFORT verwerfen, sonst
          // "kehrt" die Position scheinbar zurück.
          for (const [orderId, r] of byOrder) for (const id of r.itemIds) serveOverlayRef.current.delete(`${orderId}:${id}`);
          pushToast("Artikel waren bereits serviert.");
        } else {
          // Overlay-Einträge bleiben bewusst bestehen (TTL) — sie fangen
          // noch laufende Stale-Polls ab, bis der Serverstand überall angekommen ist.
          pushToast(okMsg ?? `Serviert: ${totalUnits} Artikel`);
        }
      } catch (err) {
        // Fehler → optimistische Änderung verwerfen
        for (const [orderId, r] of byOrder) for (const id of r.itemIds) serveOverlayRef.current.delete(`${orderId}:${id}`);
        pushToast(err instanceof Error && err.message !== "Fehler" ? err.message : "Servieren fehlgeschlagen", "error");
      } finally {
        void refreshLive();
      }
    },
    [pushToast, refreshLive]
  );

  const cancelItem = useCallback(
    async (o: LiveOrder, it: LiveItem, opts?: { skipConfirm?: boolean; quantity?: number }) => {
      const qty = opts?.quantity ?? it.quantity;
      if (!opts?.skipConfirm && !window.confirm(`Storno: ${qty}x ${it.name}?`)) return;
      await postJson(
        `/${slug}/tablet/cancel-item/${o.id}`,
        { item_key: buildItemKey(it, true), quantity: qty },
        `Storniert: ${qty}x ${it.name}`
      );
    },
    [postJson, slug]
  );

  const cancelOrder = useCallback(
    async (o: LiveOrder) => {
      if (!window.confirm(`Bestellung #${o.id} komplett stornieren?`)) return;
      await postJson(`/${slug}/tablet/stornieren/${o.id}`, undefined, `Bestellung #${o.id} storniert`);
    },
    [postJson, slug]
  );

  const payOrder = useCallback(
    async (o: LiveOrder, opts?: { skipConfirm?: boolean }) => {
      if (!opts?.skipConfirm && !window.confirm(`Bestellung #${o.id} (${formatEur(o.total)}) als bezahlt markieren?`)) return;
      await postJson(
        `/${slug}/tablet/bezahlen/${o.id}`,
        { waiter_id: initial.sessionName || null },
        `Bestellung #${o.id} bezahlt`
      );
    },
    [postJson, slug, initial.sessionName]
  );

  const serviceErledigt = useCallback(
    async (c: ServiceCall) => {
      await postJson(`/${slug}/service-erledigt/${c.id}`, undefined, "Service-Ruf erledigt");
    },
    [postJson, slug]
  );

  const splitPay = useCallback(
    async (o: LiveOrder, items: LiveItem[]) => {
      if (items.length === 0) return;
      const payload = items.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        note: it.note ?? undefined,
        combo_instance_id: it.combo_instance_id ?? undefined,
        item_id: it.id, // exakt pro Zeile, damit identische Produkte getrennt bezahlt werden
      }));
      const amount = items.reduce((s, i) => s + i.price * i.quantity, 0);
      await postJson(
        "/admin/orders/split-pay",
        { order_id: o.id, items: payload },
        `Teilzahlung ${formatEur(amount)} verbucht`
      );
    },
    [postJson]
  );

  const transferOrder = useCallback(
    async (o: LiveOrder, targetTable: string, itemKeys?: string[], itemsMap?: Record<string, number>) => {
      await postJson(
        "/admin/orders/transfer",
        { source_table: o.table, target_table: targetTable, item_keys: itemKeys, items: itemsMap },
        itemKeys && itemKeys.length > 0
          ? `Umbuchung (${itemKeys.length} Produkt${itemKeys.length === 1 ? "" : "e"}) nach ${targetTable}`
          : `Umbuchung nach ${targetTable}`
      );
    },
    [postJson]
  );

  const addManualOrder = useCallback(
    async (tableLabel: string, items: { product_id: number; quantity: number }[]) => {
      if (items.length === 0) return;
      // Idempotenz-Key pro Klick — schützt vor Browser-Retries bei
      // schlechter Verbindung (dieselbe Anfrage wird nicht doppelt gebucht).
      // ALLE ausgewählten Produkte gehen als EIN Request raus → ein Bon,
      // keine Race-Conditions durch parallele Einzel-Requests.
      const idempotencyKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      await postJson(
        "/api/admin/orders/add-manual",
        { table_number: tableLabel, items, idempotency_key: idempotencyKey },
        items.length === 1 ? "Bestellung hinzugefügt" : `${items.length} Produkte hinzugefügt`
      );
    },
    [postJson]
  );

  // ── Product actions ──
  const toggleProduct = useCallback(
    async (p: AdminProduct) => {
      await postJson(`/admin/product-toggle/${p.id}`, undefined, p.is_available ? `${p.name} ausverkauft` : `${p.name} wieder verfügbar`);
      router.refresh();
    },
    [postJson, router]
  );

  const deleteProduct = useCallback(
    async (p: AdminProduct) => {
      if (!window.confirm(`Produkt "${p.name}" löschen?`)) return;
      await postJson(`/admin/produkt-loeschen/${p.id}`, undefined, `Produkt "${p.name}" gelöscht`);
      router.refresh();
    },
    [postJson, router]
  );

  // ── Category actions ──
  const createCategory = useCallback(
    async (name: string) => {
      await postJson("/admin/kategorie-erstellen", { name }, `Kategorie "${name}" angelegt`);
      router.refresh();
    },
    [postJson, router]
  );

  const deleteCategory = useCallback(
    async (c: AdminCategory) => {
      if (!window.confirm(`Kategorie "${c.name}" löschen?`)) return;
      await postJson("/admin/kategorie-loeschen", { name: c.name }, `Kategorie "${c.name}" gelöscht`);
      router.refresh();
    },
    [postJson, router]
  );

  // ── Event actions ──
  const toggleEvent = useCallback(
    async (e: AdminEvent) => {
      try {
        const res = await fetch(`/admin/events/${e.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !e.is_active }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          pushToast(data.error || "Fehler", "error");
          return;
        }
        pushToast(
          e.is_active
            ? `Event "${e.display_name}" deaktiviert`
            : `Event "${e.display_name}" aktiviert`
        );
        router.refresh();
      } catch {
        pushToast("Verbindungsfehler", "error");
      }
    },
    [pushToast, router]
  );

  const deleteEvent = useCallback(
    async (e: AdminEvent) => {
      if (!window.confirm(`Event "${e.display_name}" löschen?`)) return;
      const res = await fetch(`/admin/events/${e.id}`, { method: "DELETE" });
      if (res.ok) {
        pushToast(`Event "${e.display_name}" gelöscht`);
        router.refresh();
      } else {
        pushToast("Event konnte nicht gelöscht werden", "error");
      }
    },
    [pushToast, router]
  );

  const navItems = [
    { id: "live", label: "Live" },
    { id: "produkte", label: "Produkte" },
    { id: "kategorien", label: "Kategorien" },
    { id: "events", label: "Events" },
    { id: "personal", label: "Personal" },
    { id: "loyalty", label: "Loyalty" },
    { id: "lager", label: "Lager" },
    { id: "werbung", label: "Werbung" },
    { id: "landingpage", label: "Landingpage" },
    { id: "reports", label: "Reports" },
    { id: "einstellungen", label: "Einstellungen" },
  ];

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold sm:text-xl">{initial.tenantName}</span>
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
              Admin
            </span>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 text-sm sm:w-auto sm:gap-4">
            <span className="w-full text-zinc-400 sm:w-auto">
              {initial.isOwner ? "Inhaber" : initial.sessionName} ({initial.role})
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/${slug}`}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:border-zinc-500"
              >
                Speisekarte ansehen
              </a>
              <button
                onClick={() => void (async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                  router.refresh();
                })()}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-zinc-200 hover:bg-zinc-700"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="mx-auto flex max-w-7xl flex-wrap gap-1 px-4 py-3 sm:px-6">
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold sm:px-4 ${
              tab === n.id
                ? "bg-emerald-600 text-white"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {tab === "live" ? (
          <LiveTab
            live={live}
            zoneFilter={zoneFilter}
            setZoneFilter={setZoneFilter}
            zoneCounts={zoneCounts}
            filteredTables={filteredTables}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            pendingCountFor={pendingCountFor}
            tableTotal={tableTotal}
            activeTableOrders={activeTableOrders}
            serveItemsBulk={serveItemsBulk}
            cancelItem={cancelItem}
            cancelOrder={cancelOrder}
            payOrder={payOrder}
            splitPay={splitPay}
            transferOrder={transferOrder}
            serviceErledigt={serviceErledigt}
            addManualOrder={addManualOrder}
            pushToast={pushToast}
            products={initial.products}
            categories={initial.categories}
            superGroups={initial.superGroups ?? []}
            slug={initial.slug}
          />
        ) : tab === "produkte" ? (
          <ProductsTab
            initial={initial}
            busy={busy}
            setBusy={setBusy}
            toggleProduct={toggleProduct}
            deleteProduct={deleteProduct}
            pushToast={pushToast}
          />
        ) : tab === "kategorien" ? (
          <CategoriesTab
            categories={initial.categories}
            products={initial.products}
            superGroups={initial.superGroups ?? []}
            createCategory={createCategory}
            deleteCategory={deleteCategory}
            pushToast={pushToast}
          />
        ) : tab === "events" ? (
          <EventsTab
            events={initial.events}
            products={initial.products}
            toggleEvent={toggleEvent}
            deleteEvent={deleteEvent}
            busy={busy}
            setBusy={setBusy}
            pushToast={pushToast}
          />
        ) : tab === "reports" ? (
          <ReportsTab live={live} pushToast={pushToast} />
        ) : tab === "personal" ? (
          <PersonalTab pushToast={pushToast} />
        ) : tab === "loyalty" ? (
          <LoyaltyTab pushToast={pushToast} />
        ) : tab === "lager" ? (
          <LagerTab pushToast={pushToast} />
        ) : tab === "werbung" ? (
          <WerbungTab />
        ) : tab === "landingpage" ? (
          <LandingpageTab pushToast={pushToast} />
        ) : (
          <SettingsTab initial={initial} pushToast={pushToast} />
        )}
      </div>

      {/* Offline-Banner */}
      {offline ? (
        <div className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-sm font-bold text-white">
          <span className="material-symbols-outlined text-lg">wifi_off</span>
          Keine Verbindung — Bestellungen werden nicht live aktualisiert
        </div>
      ) : null}

      {/* Offline-Banner */}
      {offline ? (
        <div className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-sm font-bold text-white">
          <span className="material-symbols-outlined text-lg">wifi_off</span>
          Keine Verbindung — Bestellungen werden nicht live aktualisiert
        </div>
      ) : null}

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${
              t.kind === "error"
                ? "bg-red-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </main>
  );
}

// ─────────────────────────── Live tab ───────────────────────────

interface LiveTabProps {
  live: TabletStatus | null;
  zoneFilter: string;
  setZoneFilter: (z: string) => void;
  zoneCounts: Record<string, number>;
  filteredTables: LiveTable[];
  selectedTable: string | null;
  setSelectedTable: (t: string | null) => void;
  pendingCountFor: (label: string) => number;
  tableTotal: (label: string) => number;
  activeTableOrders: LiveOrder[];
  serveItemsBulk: (entries: { o: LiveOrder; it: LiveItem }[], okMsg?: string) => void;
  cancelItem: (o: LiveOrder, it: LiveItem, opts?: { skipConfirm?: boolean; quantity?: number }) => void;
  cancelOrder: (o: LiveOrder) => void;
  payOrder: (o: LiveOrder, opts?: { skipConfirm?: boolean }) => void;
  splitPay: (o: LiveOrder, items: LiveItem[]) => void;
  transferOrder: (o: LiveOrder, targetLabel: string, itemKeys?: string[], itemsMap?: Record<string, number>) => void;
  serviceErledigt: (c: ServiceCall) => void;
  addManualOrder: (tableNumber: string, items: { product_id: number; quantity: number }[]) => void;
  pushToast: (msg: string, kind?: "success" | "error") => void;
  products: AdminProduct[];
  categories: AdminCategory[];
  superGroups: { id: number; name: string; color: string; icon: string }[];
  slug: string;
  showRevenue?: boolean;
}

function LiveTab(props: LiveTabProps) {
  const {
    live, zoneFilter, setZoneFilter, zoneCounts, filteredTables,
    selectedTable, setSelectedTable, pendingCountFor, tableTotal,
    activeTableOrders, serveItemsBulk, cancelItem, cancelOrder,
    payOrder, splitPay, transferOrder, serviceErledigt, addManualOrder,
    pushToast, products, categories, superGroups, slug, showRevenue,
  } = props;

  return (
    <SitzplanTab
      live={live}
      zoneFilter={zoneFilter}
      setZoneFilter={setZoneFilter}
      zoneCounts={zoneCounts}
      filteredTables={filteredTables}
      selectedTable={selectedTable}
      setSelectedTable={setSelectedTable}
      pendingCountFor={pendingCountFor}
      tableTotal={tableTotal}
      activeTableOrders={activeTableOrders}
      serveItemsBulk={serveItemsBulk}
      cancelItem={cancelItem}
      cancelOrder={cancelOrder}
      payOrder={payOrder}
      splitPay={splitPay}
      transferOrder={transferOrder}
      serviceErledigt={serviceErledigt}
      addManualOrder={addManualOrder}
      pushToast={pushToast}
      products={products}
      categories={categories}
      superGroups={superGroups}
      slug={slug}
      showRevenue={showRevenue}
    />
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

// ─────────────────────────── Orders tab ───────────────────────────

interface OrdersTabProps {
  live: TabletStatus | null;
  serveItemsBulk: (entries: { o: LiveOrder; it: LiveItem }[], okMsg?: string) => void;
  cancelItem: (o: LiveOrder, it: LiveItem) => void;
  cancelOrder: (o: LiveOrder) => void;
  payOrder: (o: LiveOrder, opts?: { skipConfirm?: boolean }) => void;
}

function OrdersTab(props: OrdersTabProps) {
  const { live, serveItemsBulk, cancelItem, cancelOrder, payOrder } = props;
  const [statusFilter, setStatusFilter] = useState<string>("aktiv");

  const groups = useMemo(() => {
    const list = live?.orders ?? [];
    if (statusFilter !== "aktiv") {
      return list
        .filter((o) => o.status === statusFilter)
        .map((o) => ({ table: o.table, orders: [o] }));
    }
    // Aktive Bestellungen pro Tisch zu EINEM Bon zusammenfassen.
    // Erst nach Abrechnung (alle Bestellungen des Tisches bezahlt)
    // beginnt ein neuer Bon.
    const byTable = new Map<string, LiveOrder[]>();
    for (const o of list) {
      const arr = byTable.get(o.table) ?? [];
      arr.push(o);
      byTable.set(o.table, arr);
    }
    return [...byTable.entries()].map(([table, os]) => ({
      table,
      orders: os,
    }));
  }, [live, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter("aktiv")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
            statusFilter === "aktiv"
              ? "bg-emerald-600 text-white"
              : "border border-zinc-700 text-zinc-300"
          }`}
        >
          Aktiv
        </button>
        <button
          onClick={() => setStatusFilter("bezahlt")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
            statusFilter === "bezahlt"
              ? "bg-emerald-600 text-white"
              : "border border-zinc-700 text-zinc-300"
          }`}
        >
          Bezahlt
        </button>
        <button
          onClick={() => setStatusFilter("storniert")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
            statusFilter === "storniert"
              ? "bg-red-600 text-white"
              : "border border-zinc-700 text-zinc-300"
          }`}
        >
          Storniert
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-zinc-500">Keine Bestellungen gefunden.</p>
      ) : null}

      {groups.map((g) => {
        const first = g.orders[0];
        const bonNumber = g.orders.find((o) => o.daily_bon_number != null)?.daily_bon_number ?? first.id;
        const total = g.orders.reduce((s, o) => s + (o.total ?? 0), 0);
        const pendingCount = g.orders.reduce(
          (s, o) => s + o.items.filter((i) => (i.item_status || "pending") === "pending").length,
          0
        );
        return (
          <div
            key={`${g.table}-${g.orders.map((o) => o.id).join("_")}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold">Bon #{bonNumber}</span>
                <span className="text-zinc-400">{g.table}</span>
                {g.orders.length > 1 ? (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                    {g.orders.length} Bestellungen
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    first.status === "bezahlt"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : first.status === "storniert"
                        ? "bg-red-500/15 text-red-300"
                        : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {first.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatEur(total)}</span>
              </div>
            </div>

            <ul className="mb-3 space-y-1.5">
              {g.orders.flatMap((o) =>
                o.items.map((it, idx) => {
                  const isPending = (it.item_status || "pending") === "pending";
                  return (
                  <li
                    key={`${o.id}-${idx}`}
                    className="flex items-center justify-between gap-2 rounded-lg bg-zinc-950/50 px-3 py-2 text-sm"
                  >
                    <span className="flex-1">
                      {it.quantity}× {it.name}
                      {(() => {
                        const { variant, extras } = parseItemExtras(it.extras);
                        const noteRest = cleanAutoNote(it.note);
                        return (
                          <>
                            {variant ? (
                              <span className="ml-1.5 inline-block rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
                                {variant}
                              </span>
                            ) : null}
                            {extras.map((ex) => (
                              <span
                                key={ex}
                                className="ml-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/25"
                              >
                                + {ex}
                              </span>
                            ))}
                            {noteRest ? (
                              <span className="text-zinc-500"> ({noteRest})</span>
                            ) : null}
                          </>
                        );
                      })()}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        isPending
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-emerald-500/15 text-emerald-300"
                      }`}
                    >
                      {it.item_status || "pending"}
                    </span>
                    {isPending ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => serveItemsBulk([{ o, it }], `Serviert: ${it.quantity}x ${it.name}`)}
                          className="rounded bg-emerald-600 px-2 py-1 text-xs font-bold hover:bg-emerald-700"
                        >
                          Servieren
                        </button>
                        <button
                          onClick={() => cancelItem(o, it)}
                          className="rounded bg-red-600 px-2 py-1 text-xs font-bold hover:bg-red-700"
                        >
                          Storno
                        </button>
                      </div>
                    ) : null}
                  </li>
                  );
                })
              )}
            </ul>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  serveItemsBulk(
                    g.orders.flatMap((o) =>
                      o.items
                        .filter((i) => (i.item_status || "pending") === "pending")
                        .map((i) => ({ o, it: i }))
                    ),
                    "Alles serviert"
                  )
                }
                disabled={pendingCount === 0}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700 disabled:opacity-40"
              >
                Alle serviert ({pendingCount})
              </button>
              <button
                onClick={async () => {
                  const open = g.orders.filter(
                    (ord) => ord.status !== "bezahlt" && ord.status !== "storniert"
                  );
                  if (open.length === 0) return;
                  const openTotal = open.reduce((s, ord) => s + (ord.total ?? 0), 0);
                  if (
                    !window.confirm(
                      `Tisch ${g.table} über ${formatEur(openTotal)} abrechnen? (${open.length} Bestellung${open.length === 1 ? "" : "en"})`
                    )
                  )
                    return;
                  for (const ord of open) {
                    await payOrder(ord, { skipConfirm: true });
                  }
                }}
                className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold hover:bg-sky-700"
              >
                Tisch abrechnen
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm(`Alle Bestellungen an ${g.table} stornieren?`)) return;
                  for (const o of g.orders) {
                    await cancelOrder(o);
                  }
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold hover:bg-red-700"
              >
                Stornieren
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────── Products tab ───────────────────────────

interface ProductsTabProps {
  initial: AdminInitial;
  busy: boolean;
  setBusy: (b: boolean) => void;
  toggleProduct: (p: AdminProduct) => void;
  deleteProduct: (p: AdminProduct) => void;
  pushToast: (msg: string, kind?: Toast["kind"]) => void;
}

function ProductsTab(props: ProductsTabProps) {
  const { initial, busy, setBusy, toggleProduct, deleteProduct, pushToast } = props;
  const router = useRouter();
  const [view, setView] = useState<"grid" | "table">("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  // ── Product editing state ──
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editHappyHour, setEditHappyHour] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editVegan, setEditVegan] = useState(false);
  const [editGlutenfree, setEditGlutenfree] = useState(false);
  const [editNameEn, setEditNameEn] = useState("");
  const [editDescriptionEn, setEditDescriptionEn] = useState("");
  const [editAllergens, setEditAllergens] = useState<string[]>([]);
  const [editRelated, setEditRelated] = useState<number[]>([]);
  const [editExtras, setEditExtras] = useState<{ name: string; price: string }[]>([]);
  const [editVariants, setEditVariants] = useState<{ name: string; price: string }[]>([]);

  // ── CSV-Import state ──
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOverwrite, setImportOverwrite] = useState(false);

  // ── Bulk-Edit state ──
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditCategory(p.category);
    setEditDescription(p.description ?? "");
    setEditHappyHour(p.happy_hour_price != null ? String(p.happy_hour_price) : "");
    setEditImage(p.image ?? "");
    setEditVegan(!!p.is_vegan);
    setEditGlutenfree(!!p.is_glutenfree);
    setEditNameEn(p.name_en ?? "");
    setEditDescriptionEn(p.description_en ?? "");
    setEditAllergens(p.allergens ?? []);
    setEditRelated(p.related_product_ids ?? []);
    setEditExtras((p.extras ?? []).map((e) => ({ name: e.name, price: String(e.price) })));
    setEditVariants((p.variants ?? []).map((v) => ({ name: v.name, price: String(v.price) })));
  };

  const submitEdit = async () => {
    if (!editing) return;
    if (!editName.trim()) {
      pushToast("Produktname erforderlich", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          price: parseFloat(editPrice) || 0,
          category: editCategory.trim(),
          description: editDescription.trim(),
          name_en: editNameEn.trim(),
          description_en: editDescriptionEn.trim(),
          is_vegan: editVegan,
          is_glutenfree: editGlutenfree,
          allergens: editAllergens,
          related_product_ids: editRelated,
          extras: editExtras
            .filter((e) => e.name.trim() !== "")
            .map((e) => ({ name: e.name.trim(), price: parseFloat(e.price) || 0 })),
          variants: editVariants
            .filter((v) => v.name.trim() !== "")
            .map((v) => ({ name: v.name.trim(), price: parseFloat(v.price) || 0 })),
          happy_hour_price:
            editHappyHour.trim() === "" ? null : parseFloat(editHappyHour),
          image_url: editImage.trim(),
        }),
      });
      if (res.ok) {
        pushToast(`Produkt "${editName.trim()}" gespeichert`);
        setEditing(null);
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
        pushToast(data.detail || data.error || "Fehler", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const submitCreate = async () => {
    if (!name.trim()) {
      pushToast("Produktname erforderlich", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/admin/produkt-erstellen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: parseFloat(price) || 0,
          category: category.trim(),
        }),
      });
      if (res.ok) {
        pushToast(`Produkt "${name.trim()}" angelegt`);
        setShowCreate(false);
        setName("");
        setPrice("");
        setCategory("");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        pushToast(data.error || "Fehler", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const sorted = useMemo(() => {
    let list = [...initial.products];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [initial.products, searchQuery]);

  const moveProduct = async (sortedIdx: number, dir: -1 | 1) => {
    const newIdx = sortedIdx + dir;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const ordered = [...sorted];
    const [moved] = ordered.splice(sortedIdx, 1);
    ordered.splice(newIdx, 0, moved);
    const res = await fetch("/admin/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_ids: ordered.map((p) => p.id) }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      pushToast("Sortierung fehlgeschlagen", "error");
    }
  };

  const generateImages = async () => {
    setBusy(true);
    try {
      const res = await fetch("/admin/products/generate-images", { method: "POST" });
      if (res.ok) {
        const j = (await res.json()) as { updated_count?: number };
        pushToast(`${j.updated_count ?? 0} Bilder zugewiesen`);
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
        pushToast(data.detail || data.error || "Fehler", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const doImportCsv = async () => {
    if (!importFile) {
      pushToast("Bitte CSV-Datei auswählen", "error");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("csv_file", importFile);
      fd.append("overwrite", String(importOverwrite));
      const res = await fetch("/admin/products/import-csv", {
        method: "POST",
        body: fd,
        headers: { "x-requested-with": "fetch" },
      });
      if (res.redirected || res.ok) {
        pushToast("CSV importiert");
        setShowImport(false);
        setImportFile(null);
        setImportOverwrite(false);
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        pushToast(data.detail || data.error || "Import fehlgeschlagen", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkSetAvailability = async (_available: boolean) => {
    if (selected.size === 0) {
      pushToast("Keine Produkte ausgewählt", "error");
      return;
    }
    setBulkBusy(true);
    try {
      let ok = true;
      for (const id of selected) {
        const p = initial.products.find((x) => x.id === id);
        if (!p) continue;
        const res = await fetch(`/admin/product-toggle/${id}`, { method: "POST" });
        if (!res.ok) ok = false;
      }
      pushToast(ok ? `Verfügbarkeit für ${selected.size} Produkte geändert` : "Teilweise fehlgeschlagen", ok ? "success" : "error");
      setSelected(new Set());
      router.refresh();
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkSetCategory = async (catName: string) => {
    if (selected.size === 0) {
      pushToast("Keine Produkte ausgewählt", "error");
      return;
    }
    setBulkBusy(true);
    try {
      let ok = true;
      for (const id of selected) {
        const p = initial.products.find((x) => x.id === id);
        if (!p) continue;
        const res = await fetch(`/api/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: p.name,
            price: p.price,
            category: catName,
            description: p.description ?? "",
            is_vegan: p.is_vegan,
            is_glutenfree: p.is_glutenfree,
            image_url: p.image ?? "",
            allergens: p.allergens ?? [],
            related_product_ids: p.related_product_ids ?? [],
            name_en: p.name_en ?? "",
            description_en: p.description_en ?? "",
          }),
        });
        if (!res.ok) ok = false;
      }
      pushToast(ok ? `Kategorie für ${selected.size} Produkte geändert` : "Teilweise fehlgeschlagen", ok ? "success" : "error");
      setSelected(new Set());
      router.refresh();
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) {
      pushToast("Keine Produkte ausgewählt", "error");
      return;
    }
    if (!window.confirm(`${selected.size} Produkt(e) löschen?`)) return;
    setBulkBusy(true);
    try {
      let ok = true;
      for (const id of selected) {
        const p = initial.products.find((x) => x.id === id);
        if (!p) continue;
        const res = await fetch(`/admin/produkt-loeschen/${id}`, { method: "POST" });
        if (!res.ok) ok = false;
      }
      pushToast(ok ? `${selected.size} Produkte gelöscht` : "Teilweise fehlgeschlagen", ok ? "success" : "error");
      setSelected(new Set());
      router.refresh();
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBulkBusy(false);
    }
  };

  // ── KI-Bildgenerierung (Puter.js, client-seitig — wie Legacy) ──
  const [aiBusy, setAiBusy] = useState(false);
  const aiButtonRef = useRef<HTMLButtonElement>(null);

  const generateAiImage = async (productName: string) => {
    const btn = aiButtonRef.current;
    const log = (...a: unknown[]) => console.log("[KI-Bild]", ...a);
    const logErr = (...a: unknown[]) => console.error("[KI-Bild]", ...a);

    if (!productName.trim()) {
      pushToast("Bitte zuerst einen Produktnamen angeben.", "error");
      return;
    }

    // Puter.js laden (wird nur einmal injiziert)
    const win = window as unknown as {
      puter?: {
        auth: { isSignedIn: () => boolean; signIn: () => Promise<void> };
        ai: { txt2img: (prompt: string, opts?: { model?: string; quality?: string }) => Promise<unknown> };
      };
    };
    let puter = win.puter;
    if (!puter) {
      try {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://js.puter.com/v2/";
          s.async = true;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Puter.js konnte nicht geladen werden."));
          document.head.appendChild(s);
        });
        puter = win.puter;
      } catch (e) {
        pushToast("KI-Service konnte nicht geladen werden.", "error");
        logErr("Puter.js load failed", e);
        return;
      }
    }
    if (!puter || typeof puter.ai?.txt2img !== "function") {
      pushToast("KI-Service noch nicht bereit. Bitte Seite neu laden.", "error");
      return;
    }
    const auth = puter.auth;

    try {
      if (typeof auth.isSignedIn === "function" && !auth.isSignedIn()) {
        pushToast("Login-Popup öffnet sich. Bitte mit kostenlosem Puter-Account einloggen.", "success");
        try {
          await auth.signIn?.();
          await new Promise((r) => setTimeout(r, 500));
        } catch (signInErr) {
          const status = (signInErr as { status?: number })?.status;
          if (status === 401) {
            pushToast("Login-Popup ist offen. Bitte einloggen, dann erneut klicken.", "success");
          } else {
            pushToast("Login abgebrochen. Bitte erneut klicken.", "error");
          }
          return;
        }
        if (typeof auth.isSignedIn === "function" && !auth.isSignedIn()) {
          pushToast("Bitte im Popup einloggen, dann erneut auf KI-Bild klicken.", "success");
          return;
        }
      }

      setAiBusy(true);
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-[10px] animate-spin">sync</span> Laden...`;
      }

      const prompt = `Professional studio food photography of ${productName} on a clean neutral background, centered, delicious`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT: KI hat nach 60s nicht geantwortet.")), 60000)
      );
      const txt2imgPromise = puter.ai.txt2img(prompt, {
        model: "gpt-image-2",
        quality: "medium",
      });
      const imgElement = await Promise.race([txt2imgPromise, timeoutPromise]);

      let imgSrc: string | null = null;
      if (typeof imgElement === "string" && imgElement.length > 0) {
        imgSrc = imgElement;
      } else if (imgElement && typeof imgElement === "object") {
        const obj = imgElement as { src?: string; url?: string; toString?: () => string };
        imgSrc =
          obj.src ||
          obj.url ||
          (typeof obj.toString === "function" && obj.toString() !== "[object Object]"
            ? obj.toString()
            : null);
      }
      if (!imgSrc) throw new Error("Puter lieferte kein Bild (kein src).");

      // Bild → Blob via Canvas (umgeht CORS-Probleme bei Puter-Storage-URLs)
      let blob: Blob | null = null;
      try {
        blob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || img.width || 1024;
            canvas.height = img.naturalHeight || img.height || 1024;
            canvas.getContext("2d")?.drawImage(img, 0, 0);
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob fehlgeschlagen"))), "image/png");
          };
          img.onerror = () => reject(new Error("Bild konnte nicht geladen werden (CORS/Netzwerk)."));
          img.src = imgSrc;
        });
      } catch {
        const resp = await fetch(imgSrc);
        if (!resp.ok) throw new Error(`Bild-Download fehlgeschlagen (HTTP ${resp.status}).`);
        blob = await resp.blob();
      }
      if (!blob || blob.size === 0) throw new Error("Generiertes Bild ist leer.");

      // Hochladen → Server speichert + erzeugt WebP
      const formData = new FormData();
      formData.append("file", blob, "ai-generated.jpg");
      const up = await fetch("/api/products/process-generated-image", {
        method: "POST",
        body: formData,
      });
      if (!up.ok) {
        const errData = (await up.json().catch(() => ({}))) as { detail?: string; error?: string };
        throw new Error(errData.detail || errData.error || `Serverfehler ${up.status}`);
      }
      const data = (await up.json()) as { success?: boolean; image_url?: string };
      if (data.success && data.image_url) {
        setEditImage(data.image_url);
        pushToast("KI-Bild erfolgreich generiert!", "success");
        log("SUCCESS — image_url:", data.image_url);
      } else {
        throw new Error("Serverantwort ungültig.");
      }
    } catch (err) {
      const msg = String((err as Error)?.message || err || "Unbekannter Fehler");
      if (msg.startsWith("TIMEOUT:")) {
        pushToast("Zeitüberschreitung: KI brauchte länger als 60s. Bitte erneut versuchen.", "error");
      } else if (msg.includes("401") || /unauthorized|auth.*required|login.*required/i.test(msg)) {
        pushToast("Puter-Login erforderlich. Bitte erneut klicken.", "error");
      } else {
        pushToast(msg, "error");
      }
      logErr("KI-Bild Fehler:", err);
    } finally {
      setAiBusy(false);
      if (btn) {
        btn.disabled = false;
      }
    }
  };

  const uploadProductImage = async (file: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("image_file", file);
      const res = await fetch("/admin/products/upload-image", {
        method: "POST",
        body: fd,
        headers: { "x-requested-with": "fetch" },
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        image_url?: string;
        detail?: string;
        error?: string;
      };
      if (res.ok && data.success && data.image_url) {
        setEditImage(data.image_url);
        pushToast("Bild hochgeladen");
      } else {
        pushToast(data.detail || data.error || "Upload fehlgeschlagen", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Produkte ({sorted.length})</h2>
        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Produkte suchen..."
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={() => setView("grid")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
              view === "grid" ? "bg-zinc-800 text-white" : "border-zinc-700 text-zinc-300"
            }`}
          >
            Kacheln
          </button>
          <button
            onClick={() => setView("table")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
              view === "table" ? "bg-zinc-800 text-white" : "border-zinc-700 text-zinc-300"
            }`}
          >
            Liste
          </button>
          <Link
            href="/admin/products/export-csv"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-zinc-500"
          >
            CSV Export
          </Link>
          <button
            onClick={() => setShowImport(true)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-zinc-500"
          >
            CSV Import
          </button>
          <button
            onClick={() => void generateImages()}
            disabled={busy}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-zinc-500 disabled:opacity-40"
          >
            Bilder erzeugen
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700"
          >
            + Neues Produkt
          </button>
        </div>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-900/20 p-3">
          <span className="text-sm font-bold text-emerald-300">{selected.size} ausgewählt</span>
          <button
            onClick={() => bulkSetAvailability(true)}
            disabled={bulkBusy}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold hover:bg-zinc-700 disabled:opacity-40"
          >
            Verfügbarkeit umschalten
          </button>
          <select
            onChange={(e) => {
              if (e.target.value !== "") {
                void bulkSetCategory(e.target.value);
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
          >
            <option value="">Kategorie setzen...</option>
            {initial.categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => void bulkDelete()}
            disabled={bulkBusy}
            className="rounded-lg bg-red-900/60 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-800 disabled:opacity-40"
          >
            Löschen
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-zinc-500"
          >
            Auswahl aufheben
          </button>
        </div>
      ) : null}

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sorted.map((p) => (
            <div
              key={p.id}
              className={`relative overflow-hidden rounded-xl border bg-zinc-900/60 ${
                p.is_available ? "border-zinc-800" : "border-zinc-800 opacity-60"
              } ${selected.has(p.id) ? "ring-2 ring-emerald-500" : ""}`}
            >
              <div className="absolute left-2 top-2 z-10">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 accent-emerald-500"
                  title="Auswählen für Bulk-Bearbeitung"
                />
              </div>
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-28 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-28 items-center justify-center bg-zinc-800 text-zinc-600">
                  —
                </div>
              )}
              <div className="p-3">
                <p className="truncate text-sm font-bold" title={p.name}>
                  {p.name}
                </p>
                <p className="text-xs text-zinc-400">{p.category}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold">{formatEur(p.price)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.is_available
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    {p.is_available ? "Aktiv" : "Ausverkauft"}
                  </span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => toggleProduct(p)}
                    className="flex-1 rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
                  >
                    {p.is_available ? "Ausverkauft" : "Aktivieren"}
                  </button>
                  <button
                    onClick={() => deleteProduct(p)}
                    className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-0 text-sm">
            <thead className="bg-zinc-900 text-left text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Kategorie</th>
                <th className="px-4 py-3 text-right">Preis</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sorted.map((p) => (
                <tr key={p.id} className="bg-zinc-950/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.category}</td>
                  <td className="px-4 py-3 text-right">{formatEur(p.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.is_available
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {p.is_available ? "Aktiv" : "Ausverkauft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => moveProduct(sorted.indexOf(p), -1)}
                        disabled={sorted.indexOf(p) === 0}
                        className="rounded bg-zinc-800 px-1.5 py-1 text-xs font-bold hover:bg-zinc-700 disabled:opacity-30"
                        title="Nach oben"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveProduct(sorted.indexOf(p), 1)}
                        disabled={sorted.indexOf(p) === sorted.length - 1}
                        className="rounded bg-zinc-800 px-1.5 py-1 text-xs font-bold hover:bg-zinc-700 disabled:opacity-30"
                        title="Nach unten"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => toggleProduct(p)}
                        className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
                      >
                        {p.is_available ? "Ausverkauft" : "Aktivieren"}
                      </button>
                      <button
                        onClick={() => deleteProduct(p)}
                        className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800"
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
      )}

      {showCreate ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-bold">Neues Produkt</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Preis (€)</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  step="0.01"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Kategorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="">— Bitte wählen —</option>
                  {initial.categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void submitCreate()}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-40"
              >
                Anlegen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-bold">Produkt bearbeiten</h3>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Name *</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Preis (€)</label>
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Happy-Hour-Preis (€)</label>
                  <input
                    value={editHappyHour}
                    onChange={(e) => setEditHappyHour(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="Leer = kein Rabatt"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Kategorie</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="">— Bitte wählen —</option>
                  {initial.categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Beschreibung</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Bild-URL</label>
                <input
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
                <button
                  ref={aiButtonRef}
                  onClick={() => void generateAiImage(editName)}
                  disabled={aiBusy || busy}
                  className="mt-2 flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600/20 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                  KI Bild generieren
                </button>
                <label className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">
                  <span className="material-symbols-outlined text-[12px]">upload_file</span>
                  Bild hochladen
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadProductImage(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {editImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editImage}
                    alt="Vorschau"
                    className="mt-2 h-24 w-24 rounded-lg border border-zinc-700 object-cover"
                  />
                ) : null}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editVegan}
                    onChange={(e) => setEditVegan(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Vegan
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editGlutenfree}
                    onChange={(e) => setEditGlutenfree(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Glutenfrei
                </label>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                <label className="mb-1 block text-xs font-bold text-zinc-300">
                  Englisch (DE / EN)
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-zinc-500">Name (EN)</label>
                    <input
                      value={editNameEn}
                      onChange={(e) => setEditNameEn(e.target.value)}
                      placeholder="English name"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-zinc-500">Beschreibung (EN)</label>
                    <input
                      value={editDescriptionEn}
                      onChange={(e) => setEditDescriptionEn(e.target.value)}
                      placeholder="English description"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                <label className="mb-1 block text-xs font-bold text-zinc-300">
                  Allergene
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EU_ALLERGENS.map((a) => {
                    const on = editAllergens.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() =>
                          setEditAllergens((prev) =>
                            on ? prev.filter((x) => x !== a) : [...prev, a]
                          )
                        }
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                          on
                            ? "bg-amber-600 text-white"
                            : "border border-zinc-700 text-zinc-300"
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Produkt-Extras (Optionen für Kunden)</label>
                  <button
                    type="button"
                    onClick={() => setEditExtras((prev) => [...prev, { name: "", price: "" }])}
                    className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
                  >
                    + Extra hinzufügen
                  </button>
                </div>
                <p className="mb-2 text-[11px] text-zinc-500">
                  Z.B. &quot;Cola 0,4&quot;, &quot;Zwiebeln&quot;, &quot;extra Käse&quot;. Kunde kann beim Bestellen diese Optionen auswählen.
                </p>
                <div className="space-y-1.5">
                  {editExtras.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={row.name}
                        onChange={(e) => setEditExtras((prev) => prev.map((r, ri) => (ri === i ? { ...r, name: e.target.value } : r)))}
                        placeholder="Name (z.B. Cola 0,4)"
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
                      />
                      <input
                        value={row.price}
                        onChange={(e) => setEditExtras((prev) => prev.map((r, ri) => (ri === i ? { ...r, price: e.target.value } : r)))}
                        type="number"
                        step="0.1"
                        placeholder="Preis €"
                        className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setEditExtras((prev) => prev.filter((_, ri) => ri !== i))}
                        className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {editExtras.length === 0 ? (
                    <p className="text-xs text-zinc-500">Keine Extras konfiguriert.</p>
                  ) : null}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Produkt-Varianten (Auswahl für Kunden)</label>
                  <button
                    type="button"
                    onClick={() => setEditVariants((prev) => [...prev, { name: "", price: "" }])}
                    className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
                  >
                    + Variante hinzufügen
                  </button>
                </div>
                <p className="mb-2 text-[11px] text-zinc-500">
                  Z.B. &quot;Klein / Groß&quot;, &quot;0,3l / 0,5l&quot;. Preis = Aufpreis auf den Grundpreis. Kunde wählt im Bestelldialog genau eine Variante.
                </p>
                <div className="space-y-1.5">
                  {editVariants.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={row.name}
                        onChange={(e) => setEditVariants((prev) => prev.map((r, ri) => (ri === i ? { ...r, name: e.target.value } : r)))}
                        placeholder="Name (z.B. Groß 0,5l)"
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
                      />
                      <input
                        value={row.price}
                        onChange={(e) => setEditVariants((prev) => prev.map((r, ri) => (ri === i ? { ...r, price: e.target.value } : r)))}
                        type="number"
                        step="0.1"
                        placeholder="Aufpreis €"
                        className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setEditVariants((prev) => prev.filter((_, ri) => ri !== i))}
                        className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {editVariants.length === 0 ? (
                    <p className="text-xs text-zinc-500">Keine Varianten konfiguriert.</p>
                  ) : null}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                <label className="mb-1 block text-xs font-bold text-zinc-300">
                  Passende Extras / Upselling
                </label>
                <p className="mb-2 text-[11px] text-zinc-500">
                  Empfohlene Zusatzprodukte, die dem Gast beim Bestellen vorgeschlagen werden.
                </p>
                <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                  {initial.products
                    .filter((p) => p.id !== editing?.id)
                    .map((p) => {
                      const on = editRelated.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm ${
                            on ? "bg-emerald-500/10" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() =>
                              setEditRelated((prev) =>
                                on ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                              )
                            }
                            className="h-4 w-4 accent-emerald-500"
                          />
                          <span className="flex-1 truncate">{p.name}</span>
                          <span className="text-xs text-zinc-500">{formatEur(p.price)}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void submitEdit()}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-40"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showImport ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-bold">CSV Import</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">CSV-Datei (*.csv)</label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={importOverwrite}
                  onChange={(e) => setImportOverwrite(e.target.checked)}
                  className="h-4 w-4 accent-red-500"
                />
                <span className="text-red-300">
                  Alle bestehenden Produkte & Kategorien ersetzen (Überschreiben)
                </span>
              </label>
              <p className="text-xs text-zinc-500">
                Spalten: name, price, category, category_type, description, image, is_vegan,
                is_glutenfree, is_available, allergens. Trennzeichen &quot;;&quot; oder &quot;,&quot;.
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowImport(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void doImportCsv()}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-40"
              >
                Importieren
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface CategoriesTabProps {
  categories: AdminCategory[];
  products: AdminProduct[];
  superGroups: { id: number; name: string; color: string; icon: string }[];
  createCategory: (name: string) => void;
  deleteCategory: (c: AdminCategory) => void;
  pushToast: (msg: string, kind?: "success" | "error") => void;
}

function CategoriesTab(props: CategoriesTabProps) {
  const { categories, products, superGroups, createCategory, deleteCategory, pushToast } = props;
  const router = useRouter();
  const [name, setName] = useState("");

  // ── Super-Group (Hauptgruppe) state ──
  const [sgName, setSgName] = useState("");
  const [sgColor, setSgColor] = useState("#374151");
  const [sgIcon, setSgIcon] = useState("");
  const [showSgCreate, setShowSgCreate] = useState(false);
  const [editSg, setEditSg] = useState<{ id: number; name: string; color: string; icon: string } | null>(null);
  const [eSgName, setESgName] = useState("");
  const [eSgColor, setESgColor] = useState("#374151");
  const [eSgIcon, setESgIcon] = useState("");

  // ── Extras state ──
  const [extrasCat, setExtrasCat] = useState<AdminCategory | null>(null);
  const [extrasRows, setExtrasRows] = useState<{ name: string; price: string }[]>([]);

  const countFor = useCallback(
    (catName: string) => products.filter((p) => p.category === catName).length,
    [products]
  );

  const createSuperGroup = async () => {
    if (!sgName.trim()) {
      pushToast("Name erforderlich", "error");
      return;
    }
    const res = await fetch("/api/super-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: sgName.trim(), color: sgColor, icon: sgIcon }),
    });
    if (res.ok) {
      pushToast(`Hauptgruppe "${sgName.trim()}" angelegt`);
      setSgName("");
      setSgColor("#374151");
      setSgIcon("");
      setShowSgCreate(false);
      router.refresh();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      pushToast(d.error || "Fehler", "error");
    }
  };

  const openEditSg = (sg: { id: number; name: string; color: string; icon: string }) => {
    setEditSg(sg);
    setESgName(sg.name);
    setESgColor(sg.color);
    setESgIcon(sg.icon);
  };

  const saveEditSg = async () => {
    if (!editSg) return;
    if (!eSgName.trim()) {
      pushToast("Name erforderlich", "error");
      return;
    }
    const res = await fetch(`/api/super-groups/${editSg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: eSgName.trim(), color: eSgColor, icon: eSgIcon }),
    });
    if (res.ok) {
      pushToast("Hauptgruppe gespeichert");
      setEditSg(null);
      router.refresh();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      pushToast(d.error || "Fehler", "error");
    }
  };

  const deleteSg = async (sg: { id: number; name: string }) => {
    if (!window.confirm(`Hauptgruppe "${sg.name}" löschen? Zugeordnete Kategorien werden zurückgesetzt.`)) return;
    const res = await fetch(`/api/super-groups/${sg.id}`, { method: "DELETE" });
    if (res.ok) {
      pushToast("Hauptgruppe gelöscht");
      router.refresh();
    } else {
      pushToast("Löschen fehlgeschlagen", "error");
    }
  };

  const assignCategory = async (cat: AdminCategory, sgId: string) => {
    const res = await fetch(`/api/categories/${cat.id}/super-group`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ super_group_id: sgId === "" ? null : Number(sgId) }),
    });
    if (res.ok) {
      pushToast(`Kategorie "${cat.name}" zugeordnet`);
      router.refresh();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      pushToast(d.error || "Fehler", "error");
    }
  };

  const renameCategory = async (cat: AdminCategory) => {
    const newName = window.prompt("Neuer Kategoriename:", cat.name);
    if (!newName || newName.trim() === cat.name) return;
    const res = await fetch("/api/categories/edit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_name: cat.name, new_name: newName.trim() }),
    });
    if (res.ok) {
      pushToast("Kategorie umbenannt");
      router.refresh();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      pushToast(d.error || "Fehler", "error");
    }
  };

  const moveCategory = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= categories.length) return;
    const ordered = [...categories];
    const [moved] = ordered.splice(idx, 1);
    ordered.splice(newIdx, 0, moved);
    const res = await fetch("/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: ordered.map((c) => c.name) }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      pushToast("Sortierung fehlgeschlagen", "error");
    }
  };

  const openExtras = (cat: AdminCategory) => {
    setExtrasCat(cat);
    let parsed: unknown[] = [];
    try {
      parsed = JSON.parse(cat.extras || "[]");
    } catch {
      parsed = [];
    }
    setExtrasRows(
      (parsed as { name?: string; price?: number }[]).map((e) => ({
        name: e.name ?? "",
        price: e.price != null ? String(e.price) : "",
      }))
    );
  };

  const addExtraRow = () => setExtrasRows((prev) => [...prev, { name: "", price: "" }]);

  const saveExtras = async () => {
    if (!extrasCat) return;
    const clean = extrasRows
      .filter((r) => r.name.trim() !== "")
      .map((r) => ({ name: r.name.trim(), price: parseFloat(r.price) || 0 }));
    const res = await fetch("/api/categories/extras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_name: extrasCat.name, extras: clean }),
    });
    if (res.ok) {
      pushToast(`Extras für "${extrasCat.name}" gespeichert`);
      setExtrasCat(null);
      router.refresh();
    } else {
      pushToast("Speichern fehlgeschlagen", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Hauptgruppen (Super-Groups) ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Hauptgruppen ({superGroups.length})</h2>
          <button
            onClick={() => setShowSgCreate(true)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700"
          >
            + Neue Hauptgruppe
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {superGroups.map((sg) => {
            const catCount = categories.filter((c) => c.super_group_id === sg.id).length;
            return (
              <div
                key={sg.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
                style={{ borderLeft: `4px solid ${sg.color}` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: sg.color + "26", color: sg.color }}
                  >
                    {sg.icon ? <span className="material-symbols-outlined text-xl" style={{ color: sg.color }}>{sg.icon}</span> : "•"}
                  </span>
                  <div>
                    <p className="font-bold">{sg.name}</p>
                    <p className="text-xs text-zinc-400">{catCount} Kategorien</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditSg(sg)}
                    className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => deleteSg(sg)}
                    className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            );
          })}
          {superGroups.length === 0 ? (
            <p className="text-sm text-zinc-500">Noch keine Hauptgruppen.</p>
          ) : null}
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Hauptgruppen (z.B. Getränke, Snacks, Shisha) fassen mehrere Kategorien zusammen und
          gruppieren Produkte im Bon, in der Küche und im Sitzplan.
        </p>
      </div>

      {/* ── Kategorien ── */}
      <div>
        <h2 className="mb-3 text-lg font-bold">Kategorien ({categories.length})</h2>

        <div className="mb-4 flex max-w-md gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Neue Kategorie..."
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                createCategory(name.trim());
                setName("");
              }
            }}
          />
          <button
            onClick={() => {
              if (name.trim()) {
                createCategory(name.trim());
                setName("");
              }
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700"
          >
            Anlegen
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-left text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Hauptgruppe</th>
                <th className="px-4 py-3">Extras</th>
                <th className="px-4 py-3 text-right">Produkte</th>
                <th className="px-4 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {categories.map((c) => {
                let extrasCount = 0;
                try {
                  extrasCount = (JSON.parse(c.extras || "[]") as unknown[]).length;
                } catch {
                  extrasCount = 0;
                }
                return (
                  <tr key={c.id} className="bg-zinc-950/50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      <select
                        value={c.super_group_id ?? ""}
                        onChange={(e) => assignCategory(c, e.target.value)}
                        className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs"
                      >
                        <option value="">— Sonstiges —</option>
                        {superGroups.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      <button
                        onClick={() => openExtras(c)}
                        className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
                      >
                        {extrasCount > 0 ? `${extrasCount} Extras` : "Extras"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400">{countFor(c.name)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => moveCategory(categories.indexOf(c), -1)}
                          disabled={categories.indexOf(c) === 0}
                          className="rounded bg-zinc-800 px-1.5 py-1 text-xs font-bold hover:bg-zinc-700 disabled:opacity-30"
                          title="Nach oben"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveCategory(categories.indexOf(c), 1)}
                          disabled={categories.indexOf(c) === categories.length - 1}
                          className="rounded bg-zinc-800 px-1.5 py-1 text-xs font-bold hover:bg-zinc-700 disabled:opacity-30"
                          title="Nach unten"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => renameCategory(c)}
                          className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
                        >
                          Umbenennen
                        </button>
                        <button
                          onClick={() => deleteCategory(c)}
                          className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    Noch keine Kategorien.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Super-Group create modal ── */}
      {showSgCreate ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-bold">Neue Hauptgruppe</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Name *</label>
                <input
                  value={sgName}
                  onChange={(e) => setSgName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Farbe</label>
                  <input
                    value={sgColor}
                    onChange={(e) => setSgColor(e.target.value)}
                    type="color"
                    className="h-[38px] w-full rounded-lg border border-zinc-700 bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Icon (Material-Symbol)</label>
                  <input
                    value={sgIcon}
                    onChange={(e) => setSgIcon(e.target.value)}
                    placeholder="local_bar"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowSgCreate(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void createSuperGroup()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700"
              >
                Anlegen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Super-Group edit modal ── */}
      {editSg ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-bold">Hauptgruppe bearbeiten</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Name *</label>
                <input
                  value={eSgName}
                  onChange={(e) => setESgName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Farbe</label>
                  <input
                    value={eSgColor}
                    onChange={(e) => setESgColor(e.target.value)}
                    type="color"
                    className="h-[38px] w-full rounded-lg border border-zinc-700 bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Icon (Material-Symbol)</label>
                  <input
                    value={eSgIcon}
                    onChange={(e) => setESgIcon(e.target.value)}
                    placeholder="local_bar"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditSg(null)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void saveEditSg()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Extras modal ── */}
      {extrasCat ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-bold">Extras — {extrasCat.name}</h3>
            <p className="mb-3 text-xs text-zinc-500">
              Zusatzprodukte, die unter dieser Kategorie angeboten werden (z.B. Sojamilch +1€).
            </p>
            <div className="space-y-2">
              {extrasRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={row.name}
                    onChange={(e) =>
                      setExtrasRows((prev) =>
                        prev.map((r, ri) => (ri === i ? { ...r, name: e.target.value } : r))
                      )
                    }
                    placeholder="Name"
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                  <input
                    value={row.price}
                    onChange={(e) =>
                      setExtrasRows((prev) =>
                        prev.map((r, ri) => (ri === i ? { ...r, price: e.target.value } : r))
                      )
                    }
                    type="number"
                    step="0.1"
                    placeholder="Preis €"
                    className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => setExtrasRows((prev) => prev.filter((_, ri) => ri !== i))}
                    className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {extrasRows.length === 0 ? (
                <p className="text-sm text-zinc-500">Keine Extras.</p>
              ) : null}
            </div>
            <div className="mt-4">
              <button
                onClick={addExtraRow}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold hover:bg-zinc-800"
              >
                + Extras hinzufügen
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setExtrasCat(null)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void saveExtras()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────── Events tab ───────────────────────────

interface EventsTabProps {
  events: AdminEvent[];
  products: AdminProduct[];
  toggleEvent: (e: AdminEvent) => void;
  deleteEvent: (e: AdminEvent) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
  pushToast: (msg: string, kind?: Toast["kind"]) => void;
}

interface EventComboRow {
  name: string;
  combo_price: string;
  items: { product_id: string; category_name: string; excluded_product_ids: number[] }[];
}

function EventsTab(props: EventsTabProps) {
  const { events, products, toggleEvent, deleteEvent, busy, setBusy, pushToast } = props;
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");
  const [mode, setMode] = useState("selected");
  const [discount, setDiscount] = useState("0");
  const [days, setDays] = useState<string[]>([]);
  const [bannerColor, setBannerColor] = useState("#059669");

  // ── Event product/combo state (create) ──
  const [eventProducts, setEventProducts] = useState<Record<number, string>>({});
  const [combos, setCombos] = useState<EventComboRow[]>([]);

  // ── Event editing state ──
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [eName, setEName] = useState("");
  const [eDisplayName, setEDisplayName] = useState("");
  const [eStartTime, setEStartTime] = useState("18:00");
  const [eEndTime, setEEndTime] = useState("20:00");
  const [eMode, setEMode] = useState("selected");
  const [eDiscount, setEDiscount] = useState("0");
  const [eDays, setEDays] = useState<string[]>([]);
  const [eBannerColor, setEBannerColor] = useState("#dc2626");

  // ── Event product/combo state (edit) ──
  const [eEventProducts, setEEventProducts] = useState<Record<number, string>>({});
  const [eCombos, setECombos] = useState<EventComboRow[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const toggleProduct = (id: number, price: string) => {
    setEventProducts((prev) => {
      const next = { ...prev };
      if (price.trim() === "") delete next[id];
      else next[id] = price.trim();
      return next;
    });
  };

  const toggleEProduct = (id: number, price: string) => {
    setEEventProducts((prev) => {
      const next = { ...prev };
      if (price.trim() === "") delete next[id];
      else next[id] = price.trim();
      return next;
    });
  };

  const addCombo = (setFn: React.Dispatch<React.SetStateAction<EventComboRow[]>>) => {
    setFn((prev) => [...prev, { name: "", combo_price: "", items: [{ product_id: "", category_name: "", excluded_product_ids: [] }] }]);
  };

  const removeCombo = (setFn: React.Dispatch<React.SetStateAction<EventComboRow[]>>, idx: number) => {
    setFn((prev) => prev.filter((_, i) => i !== idx));
  };

  const addComboItem = (setFn: React.Dispatch<React.SetStateAction<EventComboRow[]>>, cIdx: number) => {
    setFn((prev) =>
      prev.map((c, i) =>
        i === cIdx ? { ...c, items: [...c.items, { product_id: "", category_name: "", excluded_product_ids: [] }] } : c
      )
    );
  };

  const updateCombo = (
    setFn: React.Dispatch<React.SetStateAction<EventComboRow[]>>,
    cIdx: number,
    patch: Partial<EventComboRow>
  ) => {
    setFn((prev) => prev.map((c, i) => (i === cIdx ? { ...c, ...patch } : c)));
  };

  const updateComboItem = (
    setFn: React.Dispatch<React.SetStateAction<EventComboRow[]>>,
    cIdx: number,
    iIdx: number,
    patch: Partial<{ product_id: string; category_name: string; excluded_product_ids: number[] }>
  ) => {
    setFn((prev) =>
      prev.map((c, i) =>
        i === cIdx
          ? { ...c, items: c.items.map((it, ii) => (ii === iIdx ? { ...it, ...patch } : it)) }
          : c
      )
    );
  };

  const buildComboPayload = (rows: EventComboRow[]) =>
    rows
      .filter((c) => c.name.trim() !== "" && c.combo_price.trim() !== "" && parseFloat(c.combo_price) > 0)
      .map((c) => ({
        name: c.name.trim(),
        combo_price: parseFloat(c.combo_price),
        items: c.items
          .filter((it) => it.product_id !== "" || it.category_name !== "")
          .map((it) => ({
            product_id: it.product_id === "" ? null : Number(it.product_id),
            category_name: it.category_name === "" ? null : it.category_name,
            excluded_product_ids: it.excluded_product_ids ?? [],
          })),
      }))
      .filter((c) => c.items.length > 0); // Only save combos with at least one item

  const buildProductPayload = (map: Record<number, string>) =>
    Object.entries(map)
      .map(([pid, price]) => ({ product_id: Number(pid), event_price: parseFloat(price) }))
      .filter((p) => Number.isFinite(p.event_price) && p.event_price > 0);

  const openEdit = (e: AdminEvent) => {
    setEditing(e);
    setEName(e.name);
    setEDisplayName(e.display_name);
    setEStartTime(e.start_time ?? "18:00");
    setEEndTime(e.end_time ?? "20:00");
    setEMode(e.mode ?? "selected");
    setEDiscount(String(e.discount ?? 0));
    setEDays(e.days ?? []);
    setEBannerColor(e.banner_color ?? "#dc2626");
    setEEventProducts({});
    setECombos([]);
    setLoadingDetails(true);
    void (async () => {
      try {
        const res = await fetch(`/admin/events/${e.id}`);
        if (res.ok) {
          const data = (await res.json()) as {
            products?: { product_id: number; event_price: number }[];
            combos?: {
              name: string;
              combo_price: number;
              items?: { product_id: number | null; category_name: string | null; excluded_product_ids?: number[] }[];
            }[];
          };
          const pmap: Record<number, string> = {};
          for (const p of data.products ?? []) {
            if (p.event_price != null) pmap[p.product_id] = String(p.event_price);
          }
          setEEventProducts(pmap);
          setECombos(
            (data.combos ?? []).map((c) => ({
              name: c.name,
              combo_price: String(c.combo_price ?? ""),
              items: (c.items ?? []).map((it) => ({
                product_id: it.product_id != null ? String(it.product_id) : "",
                category_name: it.category_name ?? "",
                excluded_product_ids: it.excluded_product_ids ?? [],
              })),
            }))
          );
        }
      } catch {
        // ignore – leere Produkt-/Combo-Auswahl bleibt
      } finally {
        setLoadingDetails(false);
      }
    })();
  };

  const submitEdit = async () => {
    if (!editing) return;
    if (!eName.trim()) {
      pushToast("Event-Name erforderlich", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/admin/events/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eName.trim(),
          display_name: eDisplayName.trim() || eName.trim(),
          start_time: eStartTime,
          end_time: eEndTime,
          mode: "selected",
          discount: 0,
          days: eDays,
          banner_color: eBannerColor,
          products: buildProductPayload(eEventProducts),
          combos: buildComboPayload(eCombos),
        }),
      });
      if (res.ok) {
        const comboCount = buildComboPayload(eCombos).length;
        const productCount = buildProductPayload(eEventProducts).length;
        let msg = `Event "${eName.trim()}" gespeichert`;
        if (productCount > 0) msg += ` · ${productCount} Produkte`;
        if (comboCount > 0) msg += ` · ${comboCount} Kombis`;
        pushToast(msg);
        setEditing(null);
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        pushToast(data.error || "Fehler", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const submitCreate = async () => {
    if (!name.trim()) {
      pushToast("Event-Name erforderlich", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          display_name: displayName.trim() || name.trim(),
          start_time: startTime,
          end_time: endTime,
          mode: "selected",
          discount: 0,
          days,
          banner_color: bannerColor,
          is_active: true,
          products: buildProductPayload(eventProducts),
          combos: buildComboPayload(combos),
        }),
      });
      if (res.ok) {
        const comboCount = buildComboPayload(combos).length;
        const productCount = buildProductPayload(eventProducts).length;
        let msg = "Event angelegt";
        if (productCount > 0) msg += ` · ${productCount} Produkte`;
        if (comboCount > 0) msg += ` · ${comboCount} Kombis`;
        pushToast(msg);
        setShowCreate(false);
        setName("");
        setDisplayName("");
        setDays([]);
        setEventProducts({});
        setCombos([]);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        pushToast(data.error || "Fehler", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const renderEventProducts = (
    pmap: Record<number, string>,
    onToggle: (id: number, price: string) => void
  ) => {
    // Group products by category
    const grouped = new Map<string, AdminProduct[]>();
    for (const p of products) {
      const cat = p.category || "Sonstiges";
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(p);
    }

    return (
      <div>
        <label className="mb-1 block text-xs text-zinc-400">
          Ausgewählte Produkte (Event-Preis je Produkt)
        </label>
        <p className="mb-2 text-[11px] text-zinc-500">
          Setze einen Sonderpreis pro Produkt. Produkte ohne Preis nehmen nicht am Event teil.
        </p>
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/50 p-2">
          {Array.from(grouped.entries()).map(([catName, catProducts]) => (
            <div key={catName}>
              <div className="mb-1 flex items-center gap-2 rounded-md bg-zinc-800/50 px-2 py-1.5">
                <div className="h-3 w-0.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  {catName}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {catProducts.length} {catProducts.length === 1 ? "Produkt" : "Produkte"}
                </span>
              </div>
              <div className="space-y-1">
                {catProducts.map((p) => {
                  const on = pmap[p.id] !== undefined;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${on ? "bg-emerald-500/10" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) => onToggle(p.id, e.target.checked ? String(p.price) : "")}
                        className="h-4 w-4 accent-emerald-500"
                      />
                      <span className="flex-1 truncate text-sm">{p.name}</span>
                      <span className="text-xs text-zinc-500">{formatEur(p.price)}</span>
                      <input
                        value={on ? pmap[p.id] : ""}
                        onChange={(e) => onToggle(p.id, e.target.value)}
                        type="number"
                        step="0.1"
                        placeholder="Event-Preis"
                        className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {products.length === 0 ? (
            <p className="p-2 text-center text-xs text-zinc-500">Keine Produkte vorhanden.</p>
          ) : null}
        </div>
      </div>
    );
  };

  const renderCombos = (
    rows: EventComboRow[],
    setFn: React.Dispatch<React.SetStateAction<EventComboRow[]>>
  ) => (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-xs text-zinc-400">Kombi-Angebote</label>
        <button
          onClick={() => addCombo(setFn)}
          className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
        >
          + Kombi hinzufügen
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((c, cIdx) => (
          <div key={cIdx} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <input
                value={c.name}
                onChange={(e) => updateCombo(setFn, cIdx, { name: e.target.value })}
                placeholder="Kombi-Name (z.B. Cola + Shisha)"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
              <input
                value={c.combo_price}
                onChange={(e) => updateCombo(setFn, cIdx, { combo_price: e.target.value })}
                type="number"
                step="0.1"
                placeholder="Preis €"
                className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
              <button
                onClick={() => removeCombo(setFn, cIdx)}
                className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5">
              {c.items.map((it, iIdx) => (
                <div key={iIdx}>
                  <div className="flex items-center gap-2">
                    <select
                      value={it.product_id}
                      onChange={(e) =>
                        updateComboItem(setFn, cIdx, iIdx, {
                          product_id: e.target.value,
                          category_name: "",
                          excluded_product_ids: [],
                        })
                      }
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
                    >
                      <option value="">— Produkt auswählen —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-zinc-500">oder Kategorie</span>
                    <select
                      value={it.category_name}
                      onChange={(e) =>
                        updateComboItem(setFn, cIdx, iIdx, {
                          product_id: "",
                          category_name: e.target.value,
                          excluded_product_ids: [],
                        })
                      }
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
                    >
                      <option value="">— Kategorie auswählen —</option>
                      {[...new Set(products.map((p) => p.category).filter(Boolean))].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  {it.category_name !== "" ? (
                    <div className="mt-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-2">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                        Ausgeschlossene Produkte (nicht im Kombi wählbar)
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {products
                          .filter((p) => p.category === it.category_name)
                          .map((p) => {
                            const excluded = (it.excluded_product_ids ?? []).includes(p.id);
                            return (
                              <label key={p.id} className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-300">
                                <input
                                  type="checkbox"
                                  checked={excluded}
                                  onChange={() => {
                                    const cur = new Set(it.excluded_product_ids ?? []);
                                    if (cur.has(p.id)) cur.delete(p.id);
                                    else cur.add(p.id);
                                    updateComboItem(setFn, cIdx, iIdx, {
                                      excluded_product_ids: [...cur],
                                    });
                                  }}
                                  className="h-3.5 w-3.5 accent-red-500"
                                />
                                {p.name}
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              <button
                onClick={() => addComboItem(setFn, cIdx)}
                className="text-xs font-bold text-sky-400 hover:text-sky-300"
              >
                + Artikel hinzufügen
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="text-xs text-zinc-500">Keine Kombi-Angebote.</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Events ({events.length})</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700"
        >
          + Neues Event
        </button>
      </div>

      {events.map((e) => (
        <div
          key={e.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
          style={{ borderLeft: `4px solid ${e.banner_color ?? "#dc2626"}` }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold">{e.display_name}</p>
              <p className="text-xs text-zinc-400">
                {daysLabel(e.days)} · {e.start_time ?? "—"}–{e.end_time ?? "—"} · Ausgewählte Produkte
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  e.is_active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {e.is_active ? "Aktiv" : "Inaktiv"}
              </span>
              <button
                onClick={() => openEdit(e)}
                className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
              >
                Bearbeiten
              </button>
              <button
                onClick={() => toggleEvent(e)}
                className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold hover:bg-zinc-700"
              >
                {e.is_active ? "Deaktivieren" : "Aktivieren"}
              </button>
              <button
                onClick={() => deleteEvent(e)}
                className="rounded bg-red-900/60 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-800"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      ))}
      {events.length === 0 ? (
        <p className="text-sm text-zinc-500">Noch keine Events.</p>
      ) : null}

      {showCreate ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-bold">Neues Event</h3>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Anzeigename</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Beginn</label>
                  <input
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    type="time"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Ende</label>
                  <input
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    type="time"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Farbe</label>
                  <input
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    type="color"
                    className="h-[38px] w-full rounded-lg border border-zinc-700 bg-zinc-950"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Wochentage</label>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((d) => {
                    const on = days.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() =>
                          setDays((prev) =>
                            on ? prev.filter((x) => x !== d) : [...prev, d]
                          )
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                          on
                            ? "bg-emerald-600 text-white"
                            : "border border-zinc-700 text-zinc-300"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              {mode === "selected" ? renderEventProducts(eventProducts, toggleProduct) : null}
              {mode === "selected" ? renderCombos(combos, setCombos) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void submitCreate()}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-40"
              >
                Anlegen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-bold">Event bearbeiten</h3>
            {loadingDetails ? (
              <p className="py-6 text-center text-sm text-zinc-400">Lade Details...</p>
            ) : (
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Name *</label>
                <input
                  value={eName}
                  onChange={(e) => setEName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Anzeigename</label>
                <input
                  value={eDisplayName}
                  onChange={(e) => setEDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Beginn</label>
                  <input
                    value={eStartTime}
                    onChange={(e) => setEStartTime(e.target.value)}
                    type="time"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Ende</label>
                  <input
                    value={eEndTime}
                    onChange={(e) => setEEndTime(e.target.value)}
                    type="time"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Farbe</label>
                  <input
                    value={eBannerColor}
                    onChange={(e) => setEBannerColor(e.target.value)}
                    type="color"
                    className="h-[38px] w-full rounded-lg border border-zinc-700 bg-zinc-950"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Wochentage</label>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((d) => {
                    const on = eDays.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() =>
                          setEDays((prev) =>
                            on ? prev.filter((x) => x !== d) : [...prev, d]
                          )
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                          on
                            ? "bg-emerald-600 text-white"
                            : "border border-zinc-700 text-zinc-300"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              {eMode === "selected" ? renderEventProducts(eEventProducts, toggleEProduct) : null}
              {eMode === "selected" ? renderCombos(eCombos, setECombos) : null}
            </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void submitEdit()}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-40"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────── Reports tab ───────────────────────────

interface ReportsTabProps {
  live: TabletStatus | null;
  pushToast: (msg: string, kind?: Toast["kind"]) => void;
}

function ReportsTab(props: ReportsTabProps) {
  const { live, pushToast } = props;
  const [range, setRange] = useState("today");
  const [status, setStatus] = useState("all");
  const [frm, setFrm] = useState("");
  const [to, setTo] = useState("");

  const exportUrl = useMemo(() => {
    const q = new URLSearchParams();
    q.set("range", range);
    q.set("status", status);
    if (range === "custom") {
      if (frm) q.set("frm", frm);
      if (to) q.set("to", to);
    }
    const s = q.toString();
    return s ? `?${s}` : "";
  }, [range, status, frm, to]);

  const openExport = (base: string) => {
    window.open(base + exportUrl, "_blank");
  };

  const monatsUrl = useMemo(() => {
    if (!frm || !to) return "";
    const q = new URLSearchParams();
    q.set("frm", frm);
    q.set("to", to);
    return `/admin/monatsreport/pdf?${q.toString()}`;
  }, [frm, to]);

  const rangeOptions = [
    { id: "today", label: "Heute" },
    { id: "7d", label: "Letzte 7 Tage" },
    { id: "30d", label: "Letzte 30 Tage" },
    { id: "all", label: "Alle" },
    { id: "custom", label: "Benutzerdefiniert" },
  ];

  const statusOptions = [
    { id: "all", label: "Alle" },
    { id: "aktiv", label: "Aktiv" },
    { id: "bezahlt", label: "Bezahlt" },
    { id: "storniert", label: "Storniert" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Bestellungen &amp; Reports</h2>

      {/* Live summary from tablet-status */}
      {live ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Umsatz heute (brutto)" value={formatEur(live.stats.brutto)} />
          <StatCard label="Umsatz 7%" value={formatEur(live.stats.brutto_7)} />
          <StatCard label="Umsatz 19%" value={formatEur(live.stats.brutto_19)} />
          <StatCard label="Bestellungen heute" value={String(live.stats.orders_count)} />
        </div>
      ) : null}

      {/* Filter panel */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="mb-3 font-bold">Zeitraum</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {rangeOptions.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                range === r.id
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {range === "custom" ? (
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Von</label>
              <input
                type="date"
                value={frm}
                onChange={(e) => setFrm(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Bis</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        ) : null}

        <h3 className="mb-3 mt-4 font-bold">Status</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatus(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                status === s.id
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openExport("/admin/orders-export/pdf")}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700"
          >
            📄 PDF-Export
          </button>
          <button
            onClick={() => openExport("/admin/orders-export/xlsx")}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700"
          >
            📊 XLSX-Export
          </button>
          {monatsUrl ? (
            <button
              onClick={() => window.open(monatsUrl, "_blank")}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-bold hover:bg-zinc-700"
            >
              🗓️ Monatsreport (PDF)
            </button>
          ) : (
            <button
              onClick={() => pushToast("Bitte Zeitraum (Von/Bis) wählen", "error")}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-bold hover:bg-zinc-700"
            >
              🗓️ Monatsreport (PDF)
            </button>
          )}
        </div>
      </div>

      {/* Recent payments + cancellations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-bold">Letzte Zahlungen</h3>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            {(live?.recent_payments ?? []).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm last:border-0"
              >
                <span>
                  Bon #{p.id} · {p.table}
                </span>
                <span className="font-semibold text-emerald-400">
                  {formatEur(p.total)}
                </span>
              </div>
            ))}
            {(live?.recent_payments ?? []).length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500">Noch keine Zahlungen.</p>
            ) : null}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-bold">Letzte Stornierungen</h3>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            {(live?.recent_cancellations ?? []).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm last:border-0"
              >
                <span>
                  Bon #{p.id} · {p.table}
                </span>
                <span className="font-semibold text-red-400">{formatEur(p.total)}</span>
              </div>
            ))}
            {(live?.recent_cancellations ?? []).length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500">
                Keine Stornierungen.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Settings tab ───────────────────────────

interface SettingsTabProps {
  initial: AdminInitial;
  pushToast: (msg: string, kind?: Toast["kind"]) => void;
}

function SettingsTab(props: SettingsTabProps) {
  const { initial, pushToast } = props;
  const router = useRouter();
  const { slug } = initial;
  const s = initial.settings;

  const [address, setAddress] = useState(s.address);
  const [plz, setPlz] = useState(s.plz);
  const [ort, setOrt] = useState(s.ort);
  const [instagram, setInstagram] = useState(s.instagram);
  const [facebook, setFacebook] = useState(s.facebook);
  const [tiktok, setTiktok] = useState(s.tiktok);
  const [busy, setBusy] = useState(false);
  const [tableNum, setTableNum] = useState("1");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoFile2, setLogoFile2] = useState<File | null>(null);
  const [isShishabar, setIsShishabar] = useState(s.is_shishabar);

  const uploadLogo = async (file: File, field: "logo" | "logo2") => {
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("field", field);
      const res = await fetch("/admin/upload-logo", {
        method: "POST",
        body: form,
        headers: { "x-requested-with": "fetch" },
      });
      if (res.ok) {
        pushToast(`${field === "logo" ? "Logo" : "Logo 2"} hochgeladen`);
        router.refresh();
      } else {
        pushToast("Upload fehlgeschlagen", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteLogo = async (field: "logo_url" | "logo_url_2") => {
    if (!window.confirm(`${field === "logo_url" ? "Logo" : "Logo 2"} wirklich löschen?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/admin/branding/delete-logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "fetch",
        },
        body: JSON.stringify({ logo_field: field }),
      });
      if (res.ok) {
        pushToast("Logo gelöscht");
        router.refresh();
      } else {
        pushToast("Löschen fehlgeschlagen", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const saveBranding = async () => {
    setBusy(true);
    try {
      const form = new FormData();
      form.set("address", address);
      form.set("plz", plz);
      form.set("ort", ort);
      form.set("instagram", instagram);
      form.set("facebook", facebook);
      form.set("tiktok", tiktok);
      const res = await fetch("/admin/branding", {
        method: "POST",
        body: form,
        headers: { "x-requested-with": "fetch" },
      });
      if (res.ok) {
        pushToast("Branding gespeichert");
      } else {
        pushToast("Fehler beim Speichern", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const toggleShishabar = async () => {
    setBusy(true);
    try {
      const res = await fetch("/admin/shishabar-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "fetch" },
        body: JSON.stringify({ is_shishabar: !isShishabar }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; is_shishabar?: boolean };
      if (res.ok && data.success) {
        setIsShishabar(Boolean(data.is_shishabar));
        pushToast(
          data.is_shishabar ? "Shishabar-Modus aktiviert" : "Shishabar-Modus deaktiviert"
        );
        router.refresh();
      } else {
        pushToast("Fehler beim Umschalten", "error");
      }
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const rotateToken = async () => {
    if (!window.confirm("POS-Security-Token wirklich rotieren? Vorhandene POS-Geräte werden entkoppelt.")) return;
    const res = await fetch("/admin/token-rotieren", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      pushToast("Token rotiert");
    } else {
      pushToast("Fehler", "error");
    }
  };

  const impersonate = async () => {
    const res = await fetch(`/admin/impersonate/${encodeURIComponent(tableNum)}`, {
      method: "POST",
    });
    if (res.ok) {
      pushToast("Tisch übernommen");
      router.push(`/${slug}`);
    } else {
      pushToast("Tisch nicht gefunden", "error");
    }
  };

  const settingsCards = [
    {
      title: "QR-Codes drucken",
      desc: "Printet QR-Tischkarten als PDF.",
      action: (
        <a
          href="/admin/qr-print"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700"
        >
          QR-PDF öffnen
        </a>
      ),
    },
    {
      title: "POS-Token rotieren",
      desc: "Neues Security-Token für POS-Geräte erzeugen.",
      action: (
        <button
          onClick={() => void rotateToken()}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold hover:bg-zinc-700"
        >
          Rotieren
        </button>
      ),
    },
    {
      title: "Als Tisch anmelden",
      desc: "Menü-Vorschau als Gast eines Tisches öffnen.",
      action: (
        <div className="flex gap-2">
          <input
            value={tableNum}
            onChange={(e) => setTableNum(e.target.value)}
            className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs"
          />
          <button
            onClick={() => void impersonate()}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold hover:bg-sky-700"
          >
            Öffnen
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Einstellungen</h2>

      {initial.settings.show_revenue === false ? (
        <p className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
          Umsatz-Anzeigen wurden vom Plattform-Administrator deaktiviert.
        </p>
      ) : null}

      {/* Branding */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="mb-1 font-bold">Branding</h3>
        <p className="mb-4 text-xs text-zinc-400">
          Adresse, Social-Media-Links und Logos für die Speisekarte.
        </p>

        {/* Logo Upload */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Logo 1 */}
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
            <label className="mb-2 block text-xs font-bold text-zinc-300">Logo 1 (Hauptlogo)</label>
            {initial.settings.logo_url ? (
              <div className="mb-3 flex items-center gap-3">
                <img src={initial.settings.logo_url} alt="Logo 1" className="h-16 w-16 rounded-lg border border-zinc-700 object-contain bg-white" />
                <button
                  onClick={() => deleteLogo("logo_url")}
                  disabled={busy}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold hover:bg-red-700 disabled:opacity-40"
                >
                  Löschen
                </button>
              </div>
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setLogoFile(f); void uploadLogo(f, "logo"); }
              }}
              disabled={busy}
              className="w-full text-xs text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-700 file:px-2 file:py-1 file:text-xs file:text-zinc-200"
            />
          </div>

          {/* Logo 2 */}
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
            <label className="mb-2 block text-xs font-bold text-zinc-300">Logo 2 (Zweites Geschäft)</label>
            {initial.settings.logo_url_2 ? (
              <div className="mb-3 flex items-center gap-3">
                <img src={initial.settings.logo_url_2} alt="Logo 2" className="h-16 w-16 rounded-lg border border-zinc-700 object-contain bg-white" />
                <button
                  onClick={() => deleteLogo("logo_url_2")}
                  disabled={busy}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold hover:bg-red-700 disabled:opacity-40"
                >
                  Löschen
                </button>
              </div>
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setLogoFile2(f); void uploadLogo(f, "logo2"); }
              }}
              disabled={busy}
              className="w-full text-xs text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-700 file:px-2 file:py-1 file:text-xs file:text-zinc-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Adresse</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">PLZ</label>
              <input
                value={plz}
                onChange={(e) => setPlz(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Ort</label>
              <input
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Instagram</label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Facebook</label>
              <input
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">TikTok</label>
              <input
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
        <button
          onClick={() => void saveBranding()}
          disabled={busy}
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-40"
        >
          Speichern
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsCards.map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <p className="font-bold">{c.title}</p>
            <p className="mb-3 mt-1 text-xs text-zinc-400">{c.desc}</p>
            {c.action}
          </div>
        ))}

        {/* Shishabar-Modus Toggle */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Shishabar-Modus</p>
              <p className="mt-1 text-xs text-zinc-400">
                Aktiviert die „Shisha&quot;-Kategorie für Shisha-Bars.
              </p>
            </div>
            <button
              onClick={() => void toggleShishabar()}
              disabled={busy}
              className={`relative h-7 w-14 shrink-0 rounded-full transition-colors ${
                isShishabar ? "bg-emerald-600" : "bg-zinc-700"
              } disabled:opacity-40`}
              aria-pressed={isShishabar}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                  isShishabar ? "left-[calc(100%-1.625rem)]" : "left-0.5"
                }`}
              />
            </button>
          </div>
          <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${isShishabar ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-800 text-zinc-400"}`}>
            {isShishabar ? "Aktiv" : "Inaktiv"}
          </span>
        </div>
      </div>

      <p className="text-xs text-zinc-600">
        POS / Küchen-Konfiguration folgt in einem späteren Schritt.
      </p>
    </div>
  );
}
