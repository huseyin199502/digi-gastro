"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type {
  LiveItem,
  LiveOrder,
  LiveTable,
  ServiceCall,
  TabletStatus,
} from "./admin-types";
import { formatEur } from "./admin-types";
import type { AdminProduct } from "./admin-types";
import { beginTransferAction, endTransferAction } from "@/lib/transferAction";

// ─────────────────────────── Types ───────────────────────────

type TableStatus = "free" | "active" | "pending" | "calling";

interface SitzplanTabProps {
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
  transferOrder: (o: LiveOrder, targetLabel: string, itemKeys?: string[], itemsMap?: Record<string, number>, idempotencyKey?: string) => Promise<boolean>;
  serviceErledigt: (c: ServiceCall) => void;
  addManualOrder: (tableLabel: string, items: { product_id: number; quantity: number }[]) => void;
  pushToast: (msg: string, kind?: "success" | "error") => void;
  products: AdminProduct[];
  categories: { id: number; name: string; super_group_id: number | null }[];
  superGroups: { id: number; name: string; color: string; icon: string }[];
  slug: string;
  showRevenue?: boolean;
}

// ─────────────────────────── Helpers ───────────────────────────

function tableLabel(t: LiveTable): string {
  return t.zone ? `Tisch ${t.number} (${t.zone})` : `Tisch ${t.number}`;
}

function plainTableLabel(t: LiveTable): string {
  return `Tisch ${t.number}`;
}

function tableLabelFor(t: LiveTable): string {
  return tableLabel(t);
}

interface StatusInfo {
  status: TableStatus;
  call: ServiceCall | null;
  label: string;
}

function deriveStatus(t: LiveTable, live: TabletStatus | null): StatusInfo {
  const label = tableLabel(t);
  const plain = plainTableLabel(t);
  const orders = (live?.orders ?? []).filter((o) => o.table === label);
  const call =
    (live?.service_calls ?? []).find((c) => c.table === label || c.table === plain) ?? null;

  let status: TableStatus = "free";
  if (call) {
    status = "calling";
  } else if (orders.length > 0) {
    status =
      orders.some((o) => o.items.some((it) => (it.item_status || "pending") === "pending"))
        ? "pending"
        : "active";
  }
  return { status, call, label };
}

const STATUS_META: Record<TableStatus, { text: string; icon: string }> = {
  free: { text: "Frei", icon: "" },
  active: { text: "Serviert", icon: "✓" },
  pending: { text: "Offen", icon: "•" },
  calling: { text: "Ruf", icon: "🔔" },
};

function statusStyle(status: TableStatus): CSSProperties {
  switch (status) {
    case "active":
      return {
        background: "linear-gradient(135deg, #065f46, #047857)",
        color: "#ffffff",
        borderColor: "#059669",
      };
    case "pending":
      return {
        background: "linear-gradient(135deg, #7f1d1d, #991b1b)",
        color: "#ffffff",
        borderColor: "#dc2626",
        animation: "pulseRed 1.5s infinite",
      };
    case "calling":
      return {
        background: "rgba(245, 158, 11, 0.08)",
        color: "#fbbf24",
        borderColor: "#f59e0b",
        animation: "pulseAmber 1.2s infinite alternate",
      };
    default:
      return {
        background: "linear-gradient(135deg, #1f2937, #111827)",
        color: "#f3f4f6",
        borderColor: "rgba(255, 255, 255, 0.1)",
      };
  }
}

// ─────────────────────────── Super-Group Badges ───────────────────────────

interface SuperGroupBadge {
  id: string;
  name: string;
  color: string;
  icon: string;
  count: number;
}

function computeSuperGroupBadges(
  orders: LiveOrder[],
  products: AdminProduct[],
  categories: { id: number; name: string; super_group_id: number | null }[],
  superGroups: { id: number; name: string; color: string; icon: string }[]
): SuperGroupBadge[] {
  const sgCounts: Record<string, number> = {};
  const sonstigesCount = { count: 0 };

  for (const order of orders) {
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;
      const category = categories.find((c) => c.name === product.category);
      const sgId = category?.super_group_id ?? null;
      const bucketId = sgId !== null ? String(sgId) : "sonstiges";
      if (bucketId === "sonstiges") {
        sonstigesCount.count += 1;
      } else {
        sgCounts[bucketId] = (sgCounts[bucketId] || 0) + 1;
      }
    }
  }

  const badges: SuperGroupBadge[] = [];

  for (const [id, count] of Object.entries(sgCounts)) {
    const sg = superGroups.find((s) => String(s.id) === id);
    if (sg) {
      badges.push({
        id,
        name: sg.name,
        color: sg.color || "#9ca3af",
        icon: sg.icon || "category",
        count,
      });
    }
  }

  if (sonstigesCount.count > 0) {
    badges.push({
      id: "sonstiges",
      name: "Sonstiges",
      color: "#9ca3af",
      icon: "restaurant",
      count: sonstigesCount.count,
    });
  }

  return badges.sort((a, b) => b.count - a.count);
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

// ─────────────────────────── Component ───────────────────────────

export default function SitzplanTab(props: SitzplanTabProps) {
  const {
    live,
    zoneFilter,
    setZoneFilter,
    zoneCounts,
    filteredTables,
    selectedTable,
    setSelectedTable,
    pendingCountFor,
    tableTotal,
    activeTableOrders,
    serveItemsBulk,
    cancelItem,
    cancelOrder,
    payOrder,
    splitPay,
    transferOrder,
    serviceErledigt,
    addManualOrder,
    pushToast,
    products,
    categories,
    superGroups,
    slug,
    showRevenue = true,
  } = props;

  const [splitMode, setSplitMode] = useState(false);
  const [splitSel, setSplitSel] = useState<Map<number, number>>(new Map());
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  const [transferSel, setTransferSel] = useState<Map<number, number>>(new Map());
  const [transferBusy, setTransferBusy] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newOrderItems, setNewOrderItems] = useState<Map<number, number>>(new Map()); // productId -> quantity
  const [multiSelect, setMultiSelect] = useState<Set<number>>(new Set());
  // Stempel vergeben (Loyalty) direkt aus dem Cockpit
  const [stampOpen, setStampOpen] = useState(false);
  const [stampCode, setStampCode] = useState("");
  const [stampBusy, setStampBusy] = useState(false);
  // Aufgeklappte Kategorien im "Neue Bestellung"-Sheet
  const [openOrderCats, setOpenOrderCats] = useState<Set<string>>(new Set());
  // Produktsuche im "Neue Bestellung"-Sheet
  const [orderSearch, setOrderSearch] = useState("");
  // Rabatt-Vouchers für alle Tische (map: Tischlabel -> Rabatt)
  const [voucherMap, setVoucherMap] = useState<Record<string, { type: string; value: number; label: string }>>({});

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch(`/api/voucher/tenant?slug=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((j) => {
          if (!cancelled && j.ok) setVoucherMap(j.discounts ?? {});
        })
        .catch(() => {
          if (!cancelled) setVoucherMap({});
        });
    };
    load();
    // Periodisch aktualisieren, damit frisch eingelöste Codes ohne manuelles
    // Neu-Laden im Cockpit erscheinen.
    const iv = window.setInterval(load, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
  }, [slug]);

  const discountOf = (table: string | null | undefined) =>
    table ? voucherMap[table] ?? null : null;

  const applyDiscount = (
    total: number,
    disc: { type: string; value: number } | null
  ): { discount: number; total: number } => {
    if (!disc) return { discount: 0, total };
    const d =
      disc.type === "percent"
        ? Math.round(total * (disc.value / 100) * 100) / 100
        : disc.value;
    return { discount: d, total: Math.max(0, Math.round((total - d) * 100) / 100) };
  };

  // Live-Timer für die Tisch-Kacheln
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const iv = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(iv);
  }, []);

  // Älteste Bestellzeit (timestamp) eines Tisches → Sekunden, die seitdem vergangen sind
  const tileSecondsFor = (label: string): number => {
    const orders = (live?.orders ?? []).filter((o) => o.table === label);
    if (orders.length === 0) return 0;
    let earliest = Number.POSITIVE_INFINITY;
    for (const o of orders) {
      // Server liefert "YYYY-MM-DD HH:MM:SS" (Berlin). Als lokale Zeit interpretieren.
      const ts = new Date(String(o.timestamp || "").replace(" ", "T")).getTime();
      if (Number.isFinite(ts) && ts < earliest) earliest = ts;
    }
    if (!Number.isFinite(earliest)) return 0;
    return Math.max(0, Math.floor((now - earliest) / 1000));
  };

  const stats = live?.stats;

  const zones = useMemo(() => {
    const set = new Set<string>();
    for (const t of live?.tables ?? []) {
      if (t.zone) set.add(t.zone);
    }
    return [...set];
  }, [live]);

  // Kacheln nach Zone gruppieren (z.B. "Drinnen:" alle aktiven Tische,
  // darunter "Draußen:" alle aktiven Tische)
  const tablesByZone = useMemo(() => {
    const map = new Map<string, LiveTable[]>();
    for (const t of filteredTables) {
      const z = t.zone || "";
      if (!map.has(z)) map.set(z, []);
      map.get(z)!.push(t);
    }
    return [...map.entries()];
  }, [filteredTables]);

  const statusByLabel = useMemo(() => {
    const map = new Map<string, StatusInfo>();
    for (const t of live?.tables ?? []) {
      map.set(tableLabel(t), deriveStatus(t, live));
    }
    return map;
  }, [live]);

  const selectedInfo = useMemo(() => {
    if (!selectedTable) return null;
    const info = statusByLabel.get(selectedTable);
    const table = (live?.tables ?? []).find((t) => tableLabel(t) === selectedTable) ?? null;
    return { info, table };
  }, [selectedTable, statusByLabel, live]);

  const selectedCall = selectedInfo?.info?.call ?? null;

  // Super-Gruppe eines Items bestimmen (Getränke, Snacks, Shishas, Sonstiges ...)
  const superGroupOf = (item: LiveItem): { id: string; name: string; color: string; icon: string } | null => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return null;
    const category = categories.find((c) => c.name === product.category);
    const sgId = category?.super_group_id ?? null;
    if (sgId === null) return null;
    const sg = superGroups.find((s) => String(s.id) === String(sgId));
    return sg
      ? { id: String(sg.id), name: sg.name, color: sg.color || "#9ca3af", icon: sg.icon || "category" }
      : null;
  };

  // Items eines Bons nach Super-Gruppe gruppieren, geordnet wie in superGroups (Sonstiges ans Ende)
  const groupItemsBySuperGroup = (order: LiveOrder) => {
    const grouped: { sg: { id: string; name: string; color: string; icon: string }; items: LiveItem[] }[] = [];
    const sonstigesItems: LiveItem[] = [];
    for (const it of order.items) {
      const sg = superGroupOf(it);
      if (!sg) {
        sonstigesItems.push(it);
        continue;
      }
      const existing = grouped.find((g) => g.sg.id === sg.id);
      if (existing) existing.items.push(it);
      else grouped.push({ sg, items: [it] });
    }
    grouped.sort((a, b) => {
      const ia = superGroups.findIndex((s) => String(s.id) === a.sg.id);
      const ib = superGroups.findIndex((s) => String(s.id) === b.sg.id);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
    if (sonstigesItems.length > 0) {
      grouped.push({
        sg: { id: "sonstiges", name: "Sonstiges", color: "#9ca3af", icon: "restaurant" },
        items: sonstigesItems,
      });
    }
    return grouped;
  };

  // Bestellungen sortieren: offene (pending) zuerst (neueste oben), servierte darunter
  const sortedTableOrders = useMemo(() => {
    return [...activeTableOrders].sort((a, b) => {
      const aPending = a.items.some((it) => (it.item_status || "pending") === "pending");
      const bPending = b.items.some((it) => (it.item_status || "pending") === "pending");
      if (aPending !== bPending) return aPending ? -1 : 1;
      const aTs = new Date(String(a.timestamp || "").replace(" ", "T")).getTime();
      const bTs = new Date(String(b.timestamp || "").replace(" ", "T")).getTime();
      return (Number.isFinite(bTs) ? bTs : 0) - (Number.isFinite(aTs) ? aTs : 0);
    });
  }, [activeTableOrders]);

  // Alle Bestellungen des Tisches als EIN Bon darstellen.
  // Erst nach Abrechnung beginnt ein neuer Bon.
  const mergedTableOrder = useMemo<LiveOrder | null>(() => {
    if (sortedTableOrders.length === 0) return null;
    const first = sortedTableOrders[0];
    if (sortedTableOrders.length === 1) return first;
    const bon =
      sortedTableOrders.find((o) => o.daily_bon_number != null)?.daily_bon_number ?? first.id;
    return {
      ...first,
      daily_bon_number: bon,
      total: sortedTableOrders.reduce((s, o) => s + (o.total ?? 0), 0),
      timestamp: first.timestamp,
      items: sortedTableOrders.flatMap((o) => o.items),
    };
  }, [sortedTableOrders]);

  // Zuordnung Item -> ursprüngliche Bestellung (für Serve/Storno/Split/Transfer)
  const ownerByItemId = useMemo(() => {
    const m = new Map<number, LiveOrder>();
    for (const o of activeTableOrders) {
      for (const it of o.items) m.set(it.id, o);
    }
    return m;
  }, [activeTableOrders]);

  const ownerOf = (fallback: LiveOrder, it: LiveItem): LiveOrder =>
    ownerByItemId.get(it.id) ?? fallback;

  // ── "Neue Bestellung": jedes OFFENE Produkt als EIGENE Position ──
  // Kein Zusammenführen: Gleiche Produkte (z.B. zweimal Cola) bleiben
  // getrennte Zeilen, damit der Kellner jede einzelne Cola separat
  // servieren/stornieren kann. Eine Position = genau eine order_item-Zeile.
  interface PendingGroup {
    key: string;
    name: string;
    note: string | null;
    comboName: string | null;
    qty: number;
    price: number; // Einzelpreis der Position (inkl. Kombi-Logik)
    ts: number; // Bestellzeit der Position
    entries: { o: LiveOrder; it: LiveItem }[];
  }

  const pendingGroups = useMemo<PendingGroup[]>(() => {
    if (!mergedTableOrder) return [];
    const groups: PendingGroup[] = [];
    for (const it of mergedTableOrder.items) {
      if ((it.item_status || "pending") !== "pending") continue;
      const ownerTs = new Date(
        String(ownerOf(mergedTableOrder, it).timestamp || "").replace(" ", "T")
      ).getTime();
      groups.push({
        key: `item_${it.id}`,
        name: it.name,
        note: it.note?.trim() || null,
        comboName: it.combo_name ?? null,
        qty: it.quantity,
        price: it.price,
        ts: Number.isFinite(ownerTs) ? ownerTs : 0,
        entries: [{ o: ownerOf(mergedTableOrder, it), it }],
      });
    }
    // Sortierung: erst nach Super-Gruppe (Getränke, Hauptgerichte, … in
    // konfigurierter Reihenfolge, "Sonstiges" ans Ende), dann neueste zuerst.
    return groups.sort((a, b) => {
      const sga = superGroupOf(a.entries[0].it);
      const sgb = superGroupOf(b.entries[0].it);
      const idx = (sg: { id: string } | null) => {
        if (!sg) return 999;
        const i = superGroups.findIndex((s) => String(s.id) === String(sg.id));
        return i === -1 ? 999 : i;
      };
      const di = idx(sga) - idx(sgb);
      if (di !== 0) return di;
      return b.ts - a.ts || a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedTableOrder, ownerByItemId]);

  const pendingTotalQty = useMemo(
    () => pendingGroups.reduce((s, g) => s + g.qty, 0),
    [pendingGroups]
  );

  const servePendingGroup = (g: PendingGroup) => {
    void serveItemsBulk(g.entries);
  };

  const cancelPendingGroup = (g: PendingGroup) => {
    if (!window.confirm(`Storno: ${g.qty}x ${g.name}?`)) return;
    for (const e of g.entries) void cancelItem(e.o, e.it, { skipConfirm: true, quantity: e.it.quantity });
  };

  const payWholeTable = async () => {
    // Nur offene Bestellungen abrechnen — bereits bezahlte/stornierte
    // (z.B. durch Teilzahlung) werden übersprungen.
    const open = activeTableOrders.filter(
      (ord) => ord.status !== "bezahlt" && ord.status !== "storniert"
    );
    if (open.length === 0) {
      pushToast("Keine offenen Bestellungen an diesem Tisch.", "error");
      return;
    }
    const rawSum = open.reduce((s, ord) => s + (ord.total ?? 0), 0);
    const disc = discountOf(activeTableOrders[0]?.table);
    const res = applyDiscount(rawSum, disc);
    const sum = res.total;
    const pendingItems = open.reduce(
      (s, ord) => s + ord.items.filter((it) => (it.item_status || "pending") === "pending").length,
      0
    );
    const warn =
      pendingItems > 0
        ? `\n\n⚠️ ${pendingItems} Artikel wurden noch nicht serviert und werden mitabgerechnet!`
        : "";
    if (
      !window.confirm(
        `Tisch ${selectedTable} über ${formatEur(sum)}${
          disc ? ` (statt ${formatEur(rawSum)} mit Rabatt −${disc.label})` : ""
        } abrechnen? (${open.length} Bestellung${open.length === 1 ? "" : "en"})${warn}`
      )
    )
      return;
    for (const ord of open) {
      await payOrder(ord, { skipConfirm: true });
    }
    // Rabatt nach Abrechnung konsumieren -> nächster Kunde am selben Tisch
    // bekommt NICHT mehr den Rabatt des vorherigen Kunden.
    if (disc) {
      await fetch("/api/voucher/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, table: activeTableOrders[0]?.table }),
      }).catch(() => {});
      fetch(`/api/voucher/tenant?slug=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.ok) setVoucherMap(j.discounts ?? {});
        })
        .catch(() => {});
    }
    closeCockpit();
  };

  const cancelWholeBon = () => {
    if (!window.confirm(`Kompletten Bon an ${selectedTable} stornieren?`)) return;
    for (const ord of activeTableOrders) {
      cancelOrder(ord);
    }
    closeCockpit();
  };
  const badgesByTable = useMemo(() => {
    const map = new Map<string, SuperGroupBadge[]>();
    if (!live) return map;
    for (const t of live.tables ?? []) {
      const label = tableLabel(t);
      const orders = (live?.orders ?? []).filter((o) => o.table === label);
      // Badges (Shisha/Speisen/Getränke) zeigen NUR die wirklich OFFENEN
      // Positionen — nicht die ganze Bestellung. Kommt z.B. nur eine Shisha
      // neu rein, leuchtet die Kachel ausschließlich lila, damit der
      // Shisha-Meister sofort sieht: neue Bestellung = nur Shisha.
      const pendingOnlyOrders = orders
        .map((o) => ({
          ...o,
          items: o.items.filter((it) => (it.item_status || "pending") === "pending"),
        }))
        .filter((o) => o.items.length > 0);
      if (pendingOnlyOrders.length > 0) {
        map.set(label, computeSuperGroupBadges(pendingOnlyOrders, products, categories, superGroups));
      }
    }
    return map;
  }, [live, products, categories, superGroups]);

  // ── Kombi-Gruppen ──
  // Ein gekaufter Kombi besteht aus mehreren Positionen (gleiche "Kombi:"-
  // Notiz bzw. gleiche combo_instance_id). Kombis sind nur ALS GANZES
  // abrechenbar/umbuchbar: ein Produkt an-/abwählen wählt alle mit.
  const comboGroupKeyOf = (it: LiveItem): string | null => {
    if (it.combo_instance_id) return `inst:${it.combo_instance_id}`;
    if (it.note?.startsWith("Kombi:")) return `note:${it.note}`;
    return null;
  };
  const isComboRow = (it: LiveItem | undefined): boolean =>
    !!it && comboGroupKeyOf(it) !== null;

  const comboGroupIds = (itemId: number): number[] => {
    const items = mergedTableOrder?.items ?? [];
    const it = items.find((x) => x.id === itemId);
    if (!it) return [itemId];
    const key = comboGroupKeyOf(it);
    if (!key) return [itemId];
    return items.filter((x) => comboGroupKeyOf(x) === key).map((x) => x.id);
  };

  const toggleSplitItem = (itemId: number, _quantity: number) => {
    const ids = comboGroupIds(itemId);
    setSplitSel((prev) => {
      const next = new Map(prev);
      if (next.has(ids[0])) {
        for (const id of ids) next.delete(id);
      } else {
        for (const id of ids) {
          const m = mergedTableOrder?.items.find((x) => x.id === id);
          if (m) next.set(id, m.quantity); // immer volle Menge
        }
      }
      return next;
    });
  };

  const setSplitQty = (itemId: number, qty: number) => {
    // Kombis sind nicht teilbar — Mengen-Stepper ist für sie deaktiviert
    if (isComboRow(mergedTableOrder?.items.find((x) => x.id === itemId))) return;
    setSplitSel((prev) => {
      const next = new Map(prev);
      next.set(itemId, qty);
      return next;
    });
  };

  const splitItemsFor = (o: LiveOrder): LiveItem[] => {
    return o.items
      .filter((it) => splitSel.has(it.id))
      .map((it) => ({ ...it, quantity: Math.min(splitSel.get(it.id)!, it.quantity) }));
  };

  const splitSelectedSum = (o: LiveOrder): number =>
    splitItemsFor(o).reduce((s, i) => s + i.price * i.quantity, 0);

  const confirmSplit = (o: LiveOrder) => {
    const items = splitItemsFor(o);
    if (items.length === 0) return;
    // Ausgewählte Items können aus mehreren Bestellungen stammen —
    // gruppiert je Ursprungs-Bestellung kassieren.
    const byOwner = new Map<number, { order: LiveOrder; items: LiveItem[] }>();
    for (const it of items) {
      const owner = ownerOf(o, it);
      const entry = byOwner.get(owner.id);
      if (entry) entry.items.push(it);
      else byOwner.set(owner.id, { order: owner, items: [it] });
    }
    for (const { order, items: its } of byOwner.values()) {
      splitPay(order, its);
    }
    setSplitMode(false);
    setSplitSel(new Map());
  };

  // Multi-Select Funktionen
  const toggleMultiSelectItem = (itemId: number) => {
    setMultiSelect((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const selectAllInGroup = (items: LiveItem[]) => {
    setMultiSelect((prev) => {
      const next = new Set(prev);
      const allSelected = items.every((it) => next.has(it.id));
      if (allSelected) {
        items.forEach((it) => next.delete(it.id));
      } else {
        items.forEach((it) => next.add(it.id));
      }
      return next;
    });
  };

  // Neue Bestellung - Mehrfachauswahl
  const toggleNewOrderItem = (productId: number) => {
    setNewOrderItems((prev) => {
      const next = new Map(prev);
      if (next.has(productId)) next.delete(productId);
      else next.set(productId, 1);
      return next;
    });
  };

  const setNewOrderItemQty = (productId: number, qty: number) => {
    setNewOrderItems((prev) => {
      const next = new Map(prev);
      if (qty <= 0) next.delete(productId);
      else next.set(productId, qty);
      return next;
    });
  };

  const submitNewOrder = () => {
    if (!selectedInfo?.table || newOrderItems.size === 0) return;
    const tableLabel = tableLabelFor(selectedInfo.table);
    // Alle ausgewählten Produkte als EIN Request → landen zusammen in einer
    // Bestellung (ein Bon). Eine Menge von z.B. 2 wird in EIGENE Positionen
    // aufgeteilt (2 × quantity:1), damit der Kellner im Cockpit zwei
    // getrennte "1× Döner Teller" sieht statt einer "2× Döner Teller".
    const items: { product_id: number; quantity: number }[] = [];
    for (const [productId, quantity] of newOrderItems) {
      for (let i = 0; i < quantity; i++) items.push({ product_id: productId, quantity: 1 });
    }
    addManualOrder(tableLabel, items);
    setNewOrderOpen(false);
    setNewOrderItems(new Map());
  };

  // Loyalty-Stempel per Kurzcode vergeben (Backend: /admin/loyalty/stamp-manual)
  const submitStamp = async () => {
    const code = stampCode.trim();
    if (code.length < 3 || stampBusy) return;
    setStampBusy(true);
    try {
      const res = await fetch("/admin/loyalty/stamp-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short_code: code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        customer_nickname?: string;
        current_stamps?: number;
        stamps_required?: number;
        reward_redeemed?: boolean;
        reward_name?: string | null;
      };
      if (!res.ok) {
        pushToast(data.error || "Stempel konnte nicht vergeben werden.", "error");
        return;
      }
      const progress =
        data.current_stamps != null && data.stamps_required != null
          ? ` (${data.current_stamps}/${data.stamps_required})`
          : "";
      pushToast(
        data.reward_redeemed
          ? `🎉 Prämie bereit: ${data.reward_name ?? "Belohnung"} — Stempel für ${data.customer_nickname ?? "Kunden"} vergeben`
          : `⭐ Stempel vergeben an ${data.customer_nickname ?? "Kunden"}${progress}`
      );
      setStampOpen(false);
      setStampCode("");
    } catch {
      pushToast("Verbindungsfehler", "error");
    } finally {
      setStampBusy(false);
    }
  };

  const closeCockpit = () => {    setSelectedTable(null);
    setSplitMode(false);
    setSplitSel(new Map());
    setTransferTarget(null);
    setTransferSel(new Map());
  };

  const targetTables = useMemo(() => {
    if (!selectedTable) return [];
    return (live?.tables ?? []).filter((t) => tableLabel(t) !== selectedTable);
  }, [selectedTable, live]);

  // ── Transfer: individuelle Produkte ──
  const toggleTransferItem = (itemId: number, _quantity: number) => {
    if (transferBusy) return;
    const ids = comboGroupIds(itemId);
    setTransferSel((prev) => {
      const next = new Map(prev);
      if (next.has(ids[0])) {
        for (const id of ids) next.delete(id);
      } else {
        for (const id of ids) {
          const m = mergedTableOrder?.items.find((x) => x.id === id);
          if (m) next.set(id, m.quantity); // immer volle Menge
        }
      }
      return next;
    });
  };

  const setTransferQty = (itemId: number, qty: number) => {
    if (transferBusy) return;
    // Kombis sind nicht teilbar — Mengen-Stepper ist für sie deaktiviert
    if (isComboRow(mergedTableOrder?.items.find((x) => x.id === itemId))) return;
    setTransferSel((prev) => {
      const next = new Map(prev);
      next.set(itemId, qty);
      return next;
    });
  };

  const transferItemKeys = (o: LiveOrder): string[] => {
    const keys: string[] = [];
    for (const [itemId, qty] of transferSel) {
      const owner = ownerByItemId.get(itemId) ?? o;
      const it = owner.items.find((x) => x.id === itemId);
      if (!it) continue;
      const noteSlug = (it.note ?? "").replace(/\s+/g, "_");
      const comboId = it.combo_id ?? "";
      const comboInst = it.combo_instance_id ?? "";
      const itemStatus = it.item_status || "pending";
      // Eindeutig pro Zeile (it.id): identische Produkte werden getrennt umgebucht
      keys.push(`${owner.id}_${it.id}_${it.product_id}_${noteSlug}_${itemStatus}_${comboId}_${comboInst}`);
      void qty;
    }
    return keys;
  };

  const transferItemQtys = (o: LiveOrder): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const [itemId, qty] of transferSel) {
      const owner = ownerByItemId.get(itemId) ?? o;
      const it = owner.items.find((x) => x.id === itemId);
      if (!it) continue;
      const noteSlug = (it.note ?? "").replace(/\s+/g, "_");
      const comboId = it.combo_id ?? "";
      const comboInst = it.combo_instance_id ?? "";
      const itemStatus = it.item_status || "pending";
      map[`${owner.id}_${it.id}_${it.product_id}_${noteSlug}_${itemStatus}_${comboId}_${comboInst}`] = qty;
    }
    return map;
  };

  const confirmTransfer = async (o: LiveOrder, targetLabel: string) => {
    const idempotencyKey = beginTransferAction();
    if (!idempotencyKey) {
      pushToast("Umbuchung läuft bereits …", "error");
      return;
    }
    const itemKeys = transferItemKeys(o);
    const itemsMap = transferItemQtys(o);
    if (itemKeys.length === 0) {
      endTransferAction(idempotencyKey);
      pushToast("Bitte zuerst die umzubuchende Produkte auswählen.", "error");
      return;
    }
    // Ein Nutzer-Klick = genau ein Request. Der Server behandelt alle
    // ausgewählten Positionen aus allen Ursprungs-Bestellungen atomar.
    setTransferBusy(true);
    try {
      const ok = await transferOrder(
        o,
        targetLabel,
        itemKeys,
        itemsMap,
        idempotencyKey
      );
      if (ok) {
        setTransferTarget(null);
        setTransferSel(new Map());
      }
    } finally {
      endTransferAction(idempotencyKey);
      setTransferBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stat cards — komplett ausblenden, wenn Umsatz-Anzeige deaktiviert */}
      {showRevenue ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Umsatz heute" value={formatEur(stats?.brutto)} />
          <StatCard label="Bestellungen heute" value={String(stats?.orders_count ?? 0)} />
          <StatCard label="Trinkgeld" value={formatEur(stats?.tip)} />
          <StatCard label="Ø Bon" value={formatEur(stats?.avg_basket)} />
          <StatCard
            label="Server"
            value={live ? (live.server_time || "").slice(0, 16) : "—"}
          />
        </div>
      ) : null}

      {/* Zone filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setZoneFilter("gesamt")}
          className={`rounded-xl px-4 py-2 text-xs font-bold ${
            zoneFilter === "gesamt"
              ? "bg-emerald-600 text-white"
              : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          Gesamt ({zoneCounts.gesamt ?? 0})
        </button>
        <button
          onClick={() => setZoneFilter("aktiv")}
          className={`rounded-xl px-4 py-2 text-xs font-bold ${
            zoneFilter === "aktiv"
              ? "bg-rose-600 text-white"
              : "border border-rose-800 text-rose-300 hover:bg-zinc-800"
          }`}
        >
          Aktiv ({zoneCounts.aktiv ?? 0})
        </button>
        {zones.map((z) => (
          <button
            key={z}
            onClick={() => setZoneFilter(z)}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              zoneFilter === z
                ? "bg-emerald-600 text-white"
                : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {z} ({zoneCounts[z.toLowerCase()] ?? 0})
          </button>
        ))}
      </div>

      {/* Super-Group Legend */}
      {superGroups.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 mb-4 text-xs">
          <span className="text-zinc-400 font-medium">Hauptgruppen:</span>
          {superGroups.map((sg) => (
            <span
              key={sg.id}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: `${sg.color}20`, color: sg.color }}
            >
              <span
                className="material-symbols-outlined text-[12px]"
                style={{ color: sg.color }}
              >
                {sg.icon || "category"}
              </span>
              {sg.name}
            </span>
          ))}
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400"
          >
            <span className="material-symbols-outlined text-[12px]">restaurant</span>
            Sonstiges
          </span>
        </div>
      )}

      {/* ── Service-Rufe — ganz oben unter den Hauptgruppen, sofort sichtbar ── */}
      {(live?.service_calls ?? []).length > 0 ? (
        <div className="mb-4 space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-3">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-amber-300">
            <span className="material-symbols-outlined text-lg">notifications_active</span>
            Service-Rufe ({(live?.service_calls ?? []).length})
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(live?.service_calls ?? []).slice(0, 12).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-zinc-900 px-3 py-2"
                style={{ animation: "pulseAmber 1.2s infinite alternate" }}
              >
                <div className="min-w-0">
                  <span className="block truncate font-bold text-zinc-100">{c.table}</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-amber-300">
                    {c.type === "rechnung" ? "🧾 Rechnung" : c.type === "kohle" ? "💨 Kohle" : "🛎️ Service"}
                  </span>
                  <span className="ml-2 text-[10px] text-zinc-500">{c.timestamp?.slice(11, 16)}</span>
                </div>
                <button
                  onClick={() => serviceErledigt(c)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700"
                >
                  Erledigt
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Tisch-Raster — nach Zone gruppiert (z.B. Drinnen: alle aktiven Tische,
          darunter Draußen: alle aktiven Tische) */}
      {tablesByZone.map(([zone, zoneTables]) => (
        <div key={zone || "__ohne__"} className="mb-6">
          {zone ? (
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {zone}
              <span className="text-zinc-600">
                ({zoneTables.filter((t) => (statusByLabel.get(tableLabel(t))?.status ?? "free") !== "free").length} aktiv)
              </span>
            </h3>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {zoneTables.map((t) => {
          const label = tableLabel(t);
          const info = statusByLabel.get(label);
          const status = info?.status ?? "free";
          const pending = pendingCountFor(label);
          const total = tableTotal(label);
          const isSelected = selectedTable === label;
          const secs = tileSecondsFor(label);
          const timerText =
            secs > 0
              ? `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, "0")}s`
              : "";

          return (
            <button
              key={`${t.number}-${t.zone}`}
              onClick={() => {
                if (selectedTable === label) closeCockpit();
                else setSelectedTable(label);
              }}
              className={`relative flex min-h-[92px] flex-col items-center justify-center rounded-xl border-2 px-2 py-2 font-extrabold text-white shadow-[0_8px_16px_rgba(0,0,0,0.3)] transition-transform active:scale-[0.98] ${
                isSelected ? "outline outline-3 outline-offset-2 outline-indigo-500" : ""
              }`}
              style={statusStyle(status)}
            >
              <span className="flex items-center gap-1.5 text-base sm:text-lg">
                <span className="leading-none">{t.number}</span>
                {t.zone ? (
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide opacity-80">
                    {t.zone}
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wide opacity-80">
                {status === "calling" && info?.call
                  ? info.call.type === "rechnung"
                    ? "🧾 Rechnung!"
                    : info.call.type === "kohle"
                      ? "💨 Kohle!"
                      : "🛎️ Service!"
                  : STATUS_META[status].text}
              </span>
              {pending > 0 ? (
                <span className="text-xs sm:text-sm font-bold">{pending} offen</span>
              ) : total > 0 ? (
                (() => {
                  const disc = discountOf(label);
                  const res = applyDiscount(total, disc);
                  return disc ? (
                    <span className="text-xs sm:text-sm font-semibold opacity-90">
                      <span className="line-through opacity-70">{formatEur(total)}</span>{" "}
                      <span className="text-emerald-300">{formatEur(res.total)}</span>
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold opacity-90">
                      {formatEur(total)}
                    </span>
                  );
                })()
              ) : null}
              {timerText ? (
                <span className="mt-1 rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold">
                  ⏱ {timerText}
                </span>
              ) : null}
              {badgesByTable.get(label) ? (
                <div className="absolute bottom-0 left-0 right-0 flex h-1.5 overflow-hidden rounded-b-xl pointer-events-none">
                  {badgesByTable.get(label)!.map((b) => (
                    <div
                      key={b.id}
                      className="flex-shrink-0"
                      style={{
                        width: `${(b.count / badgesByTable.get(label)!.reduce((s, x) => s + x.count, 0)) * 100}%`,
                        backgroundColor: b.color,
                      }}
                      title={`${b.name}: ${b.count} Artikel`}
                    />
                  ))}
                </div>
              ) : null}
            </button>
          );
            })}
          </div>
        </div>
      ))}
      {filteredTables.length === 0 ? (
        <p className="text-sm text-zinc-500">Keine Tische vorhanden.</p>
      ) : null}

      {/* ── Bottom sheet cockpit ── */}
      {selectedTable && selectedInfo ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeCockpit}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border-t border-zinc-700 bg-zinc-900 p-4 sm:p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-lg font-bold">
                  Tisch {selectedInfo.table?.number ?? selectedTable}
                  {selectedInfo.table?.zone ? (
                    <span className="ml-2 text-sm font-semibold text-zinc-400">
                      {selectedInfo.table.zone}
                    </span>
                  ) : null}
                </h2>
                <p className="text-sm text-zinc-400">
                  Gesamt:{" "}
                  {(() => {
                    const disc = discountOf(activeTableOrders[0]?.table);
                    const t = activeTableOrders.reduce((s, o) => s + (o.total ?? 0), 0);
                    const res = applyDiscount(t, disc);
                    if (disc) {
                      return (
                        <>
                          <span className="font-bold text-zinc-500 line-through">{formatEur(t)}</span>{" "}
                          <span className="font-bold text-emerald-400">{formatEur(res.total)}</span>
                        </>
                      );
                    }
                    return (
                      <span className="font-bold text-emerald-400">
                        {formatEur(t)}
                      </span>
                    );
                  })()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewOrderOpen(true)}
                  className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-bold hover:bg-sky-700 min-h-[44px]"
                >
                  Neue Bestellung
                </button>
                <button
                  onClick={() => {
                    setStampCode("");
                    setStampOpen(true);
                  }}
                  title="Loyalty-Stempel per Kunden-Code vergeben"
                  className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-bold hover:bg-amber-700 min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-base">stars</span>
                  Stempel
                </button>
                <button
                  onClick={closeCockpit}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedCall ? (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
                <div>
                  <span className="font-bold text-amber-300">
                    🔔 {selectedCall.type === "rechnung" ? `${selectedCall.table} wünscht Rechnung` : selectedCall.type}
                  </span>
                  <span className="ml-2 text-xs text-zinc-400">{selectedCall.timestamp}</span>
                </div>
                <button
                  onClick={() => {
                    serviceErledigt(selectedCall);
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700"
                >
                  Ruf erledigt
                </button>
              </div>
            ) : null}

            {activeTableOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">
                Keine offenen Bestellungen auf diesem Tisch.
              </p>
            ) : null}

            <div className="space-y-4">
              {mergedTableOrder
                ? [mergedTableOrder].map((o) => {
                const anyPending = o.items.some(
                  (it) => (it.item_status || "pending") === "pending"
                );
                const selectedInOrder = o.items.filter((it) => multiSelect.has(it.id) && (it.item_status || "pending") === "pending");
                // Serve-View: offene Items leben im "Neue Bestellung"-Block,
                // darunter steht nur noch das bereits Servierte. In Split-/
                // Transfer-Auswahl wird weiterhin alles angezeigt.
                const serveView = !splitMode && transferTarget !== "__picker__";
                return (
                  <div
                    key={o.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      anyPending ? "border-amber-500/40 bg-zinc-950/80" : "border-zinc-800 bg-zinc-950/60"
                    }`}
                  >
                    {/* Bon Header */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-100">Bon #{o.daily_bon_number ?? o.id}</span>
                        {anyPending ? (
                          <span className="animate-pulse rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-zinc-900">
                            NEU
                          </span>
                        ) : null}
                        <span className="text-xs font-medium text-zinc-400">
                          {o.timestamp ? new Date(String(o.timestamp).replace(" ", "T")).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const disc = discountOf(o.table);
                          const t = o.total ?? 0;
                          const res = applyDiscount(t, disc);
                          return disc ? (
                            <>
                              <span className="block text-xs font-bold text-zinc-500 line-through">
                                {formatEur(t)}
                              </span>
                              <span className="text-sm font-black text-emerald-400">
                                {formatEur(res.total)}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-emerald-400">
                              {formatEur(t)}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* ── NEUE BESTELLUNG — immer ganz oben am Bon, sofort erkennbar ── */}
                    {pendingGroups.length > 0 && serveView ? (
                      <div
                        className="mb-4 rounded-xl border-2 border-amber-400 bg-amber-500/10 p-3"
                        style={{ animation: "pulseAmber 1.2s infinite alternate" }}
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-300 sm:text-sm">
                            <span className="material-symbols-outlined text-base">notifications_active</span>
                            Neue Bestellung
                          </span>
                          <button
                            onClick={() => serveItemsBulk(pendingGroups.flatMap((g) => g.entries), `Serviert: ${pendingTotalQty} Artikel`)}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-95 sm:text-sm"
                          >
                            <span className="material-symbols-outlined text-base">done_all</span>
                            Alles servieren ({pendingTotalQty})
                          </button>
                        </div>
                        {(() => {
                          const grouped: {
                            sg: { id: string; name: string; color: string; icon: string };
                            items: (typeof pendingGroups)[number][];
                          }[] = [];
                          const sonstiges: (typeof pendingGroups)[number][] = [];
                          for (const g of pendingGroups) {
                            const sg = superGroupOf(g.entries[0].it);
                            if (!sg) {
                              sonstiges.push(g);
                              continue;
                            }
                            const existing = grouped.find((x) => x.sg.id === sg.id);
                            if (existing) existing.items.push(g);
                            else grouped.push({ sg, items: [g] });
                          }
                          grouped.sort((a, b) => {
                            const idx = (sg: string) => {
                              const i = superGroups.findIndex((s) => String(s.id) === sg);
                              return i === -1 ? 999 : i;
                            };
                            return idx(a.sg.id) - idx(b.sg.id);
                          });
                          if (sonstiges.length > 0) {
                            grouped.push({
                              sg: { id: "sonstiges", name: "Sonstiges", color: "#9ca3af", icon: "restaurant" },
                              items: sonstiges,
                            });
                          }
                          return grouped.map((grp) => (
                            <div key={grp.sg.id} className="mb-2">
                              <div
                                className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                                style={{ color: grp.sg.color }}
                              >
                                <span className="material-symbols-outlined text-sm">{grp.sg.icon}</span>
                                {grp.sg.name}
                                <span className="text-zinc-500">
                                  ({grp.items.reduce((s, x) => s + x.qty, 0)})
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {grp.items.map((g) => (
                                  <li
                                    key={g.key}
                                    className="rounded-lg bg-zinc-900/80 px-3 py-2"
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="min-w-[2.5rem] shrink-0 rounded-md bg-amber-400 px-1.5 py-0.5 text-center text-sm font-black text-zinc-900">
                                        {g.qty}×
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <span className="block text-sm font-bold leading-snug text-zinc-100 break-words">
                                          {g.name}
                                        </span>
                                        {g.note ? (
                                          <span className="mt-0.5 block text-xs leading-snug text-amber-400 break-words">✎ {g.note}</span>
                                        ) : null}
                                        {g.comboName ? (
                                          <span className="mt-0.5 block text-xs text-zinc-500">[Kombi: {g.comboName}]</span>
                                        ) : null}
                                      </div>
                                      <span className="shrink-0 pt-0.5 text-sm font-black text-emerald-400">
                                        {formatEur(g.price * g.qty)}
                                      </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <button
                                        onClick={() => servePendingGroup(g)}
                                        title={`${g.qty}x ${g.name} servieren`}
                                        className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition-all hover:bg-emerald-700 active:scale-95"
                                      >
                                        <span className="material-symbols-outlined text-base">check</span>
                                        <span>Servieren</span>
                                      </button>
                                      <button
                                        onClick={() => cancelPendingGroup(g)}
                                        title={`Storno: ${g.qty}x ${g.name}`}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/40"
                                      >
                                        <span className="material-symbols-outlined text-base">close</span>
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : null}

                    {/* Groups */}
                    {groupItemsBySuperGroup(o).map((group, groupIdx, groups) => {
                      const visibleItems = serveView
                        ? group.items.filter((it) => (it.item_status || "pending") !== "pending")
                        : group.items;
                      if (serveView && visibleItems.length === 0) return null;
                      const pendingInGroup = visibleItems.filter((it) => (it.item_status || "pending") === "pending");
                      const allGroupSelected = pendingInGroup.length > 0 && pendingInGroup.every((it) => multiSelect.has(it.id));
                      return (
                        <div key={group.sg.id} className={`mb-3 ${groupIdx < groups.length - 1 ? "border-b border-zinc-800 pb-3" : ""}`}>
                          {/* Category Header */}
                          <div className="mb-2 flex items-center justify-between rounded-lg px-2 py-1.5" style={{ backgroundColor: group.sg.color + "15" }}>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-1 rounded-full" style={{ backgroundColor: group.sg.color }} />
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: group.sg.color }}>
                                {group.sg.name}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {visibleItems.length} {visibleItems.length === 1 ? "Artikel" : "Artikel"}
                              </span>
                            </div>
                            {pendingInGroup.length > 0 ? (
                              <button
                                onClick={() => selectAllInGroup(pendingInGroup)}
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
                                  allGroupSelected
                                    ? "bg-emerald-600 text-white"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                                }`}
                              >
                                {allGroupSelected ? "Alle abwählen" : "Alle wählen"}
                              </button>
                            ) : null}
                          </div>

                          {/* Items */}
                          <ul className="space-y-1">
                            {visibleItems.map((it, idx) => {
                              const isPending = (it.item_status || "pending") === "pending";
                              const isSelected = multiSelect.has(it.id);
                              const splitChecked = splitSel.has(it.id);
                              const splitQty = splitSel.get(it.id) ?? it.quantity;
                              const transferChecked = transferTarget === "__picker__" && transferSel.has(it.id);
                              const transferQty = transferSel.get(it.id) ?? it.quantity;
                              const selectionActive = splitMode || transferTarget === "__picker__";
                              return (
                                <li
                                  key={it.id || idx}
                                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                                    isSelected && isPending
                                      ? "bg-emerald-500/20 ring-1 ring-emerald-500/50"
                                      : isPending && !selectionActive
                                        ? "bg-amber-500/10"
                                        : (splitMode && splitChecked) || (transferTarget === "__picker__" && transferChecked)
                                          ? "bg-emerald-500/10"
                                          : ""
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <div className="flex-shrink-0">
                                    {splitMode ? (
                                      <input
                                        type="checkbox"
                                        checked={splitChecked}
                                        onChange={() => toggleSplitItem(it.id, it.quantity)}
                                        className="h-4 w-4 accent-emerald-500"
                                      />
                                    ) : transferTarget === "__picker__" ? (
                                      <input
                                        type="checkbox"
                                        checked={transferChecked}
                                        onChange={() => toggleTransferItem(it.id, it.quantity)}
                                        disabled={transferBusy}
                                        className="h-4 w-4 accent-violet-500"
                                      />
                                    ) : isPending ? (
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleMultiSelectItem(it.id)}
                                        title="Auswählen zum Servieren"
                                        className="h-4 w-4 cursor-pointer accent-emerald-500"
                                      />
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={true}
                                        readOnly
                                        title="Serviert"
                                        className="h-4 w-4 accent-emerald-500"
                                      />
                                    )}
                                  </div>

                                  {/* Item Info */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-sm font-bold text-zinc-100">
                                        {it.quantity}×
                                      </span>
                                      <span className="text-sm font-medium text-zinc-200">
                                        {it.name}
                                      </span>
                                    </div>
                                    {it.note ? (
                                      <span className="mt-0.5 block text-xs text-amber-400">
                                        ✎ {it.note}
                                      </span>
                                    ) : null}
                                    {it.extras ? (() => {
                                      let parsed: { name: string; price: number }[] = [];
                                      try { const j = JSON.parse(it.extras); if (Array.isArray(j)) parsed = j; } catch { /* ignore */ }
                                      if (parsed.length === 0) return null;
                                      return (
                                        <span className="mt-0.5 flex flex-wrap gap-1">
                                          {parsed.map((e) => (
                                            <span key={e.name} className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                                              + {e.name}
                                            </span>
                                          ))}
                                        </span>
                                      );
                                    })() : null}
                                    {it.combo_name ? (
                                      <span className="mt-0.5 block text-xs text-zinc-500">
                                        [Kombi: {it.combo_name}]
                                      </span>
                                    ) : null}
                                  </div>

                                  {/* Preis der Position (inkl. Kombi-Logik) */}
                                  <span className="shrink-0 text-sm font-black text-emerald-400">
                                    {formatEur(it.price * it.quantity)}
                                  </span>

                                  {/* Status / Actions */}
                                  <div className="flex shrink-0 items-center gap-2">
                                    {selectionActive && isComboRow(it) ? (
                                      // Kombis sind nur als Ganzes wählbar — kein Mengen-Stepper
                                      <span
                                        title="Kombi wird immer komplett abgerechnet"
                                        className="rounded bg-emerald-900/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300"
                                      >
                                        🔒 Kombi komplett
                                      </span>
                                    ) : selectionActive ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => {
                                            const cur = splitMode ? splitQty : transferQty;
                                            const next = Math.max(1, cur - 1);
                                            if (splitMode) setSplitQty(it.id, next);
                                            else setTransferQty(it.id, next);
                                          }}
                                          className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
                                          disabled={(splitMode ? splitQty : transferQty) <= 1 || (!splitMode && transferBusy)}
                                        >
                                          −
                                        </button>
                                        <span className="w-6 text-center text-xs font-bold">
                                          {splitMode ? splitQty : transferQty}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const cur = splitMode ? splitQty : transferQty;
                                            const next = Math.min(it.quantity, cur + 1);
                                            if (splitMode) setSplitQty(it.id, next);
                                            else setTransferQty(it.id, next);
                                          }}
                                          className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
                                          disabled={(splitMode ? splitQty : transferQty) >= it.quantity || (!splitMode && transferBusy)}
                                        >
                                          +
                                        </button>
                                      </div>
                                    ) : null}
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      isPending ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                                    }`}>
                                      {isPending ? "offen" : "serviert"}
                                    </span>
                     {isPending ? (
                                       <button
                                         onClick={() => cancelItem(ownerOf(o, it), it)}
                                        title="Stornieren"
                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/40"
                                      >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                      </button>
                                    ) : null}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}

                    {/* Action Buttons */}
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-800 pt-3">
                      {selectedInOrder.length > 0 ? (
                        <button
                          onClick={async () => {
                            const sel = o.items
                              .filter((it) => multiSelect.has(it.id) && (it.item_status || "pending") === "pending")
                              .map((it) => ({ o: ownerOf(o, it), it }));
                            await serveItemsBulk(sel);
                            setMultiSelect(new Set());
                          }}
                          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 min-h-[44px]"
                        >
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          {selectedInOrder.length} servieren
                        </button>
                      ) : null}
                      {anyPending ? (
                        <button
                          onClick={() =>
                            serveItemsBulk(
                              activeTableOrders.flatMap((ord) =>
                                ord.items
                                  .filter((it) => (it.item_status || "pending") === "pending")
                                  .map((it) => ({ o: ord, it }))
                              ),
                              "Tisch komplett serviert"
                            )
                          }
                          className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700 min-h-[44px]"
                        >
                          Alle servieren
                        </button>
                      ) : null}
                      {!splitMode ? (
                        <button
                          onClick={() => {
                            setSplitMode(true);
                            setTransferTarget(null);
                          }}
                          className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-bold hover:bg-sky-700 min-h-[44px]"
                        >
                          Teilzahlen
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => confirmSplit(o)}
                            disabled={splitSelectedSum(o) <= 0}
                            className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-bold hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px]"
                          >
                            Ausgewählte kassieren ({formatEur(splitSelectedSum(o))})
                          </button>
                          <button
                            onClick={() => {
                              setSplitMode(false);
                              setSplitSel(new Map());
                            }}
                            className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700 min-h-[44px]"
                          >
                            Abbrechen
                          </button>
                        </>
                      )}
                      {!transferTarget ? (
                        <button
                          onClick={() => {
                            setTransferTarget("__picker__");
                            setSplitMode(false);
                          }}
                          className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold hover:bg-violet-700 min-h-[44px]"
                        >
                          Umbuchen
                        </button>
                      ) : (
                        <button
                          onClick={() => setTransferTarget(null)}
                          disabled={transferBusy}
                          className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px]"
                        >
                          Abbrechen
                        </button>
                      )}
                      <button
                        onClick={payWholeTable}
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold hover:bg-emerald-700 min-h-[44px]"
                      >
                        Tisch abrechnen
                      </button>
                      <button
                        onClick={cancelWholeBon}
                        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold hover:bg-red-700 min-h-[44px]"
                      >
                        Bon stornieren
                      </button>
                    </div>

                    {/* Transfer target picker */}
                    {transferTarget === "__picker__" ? (
                      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                        <p className="mb-1 text-xs sm:text-sm font-bold uppercase tracking-wide text-zinc-400">
                          Bon #{o.daily_bon_number ?? o.id} umbuchen auf:
                        </p>
                        <p className="mb-2 text-[11px] sm:text-xs text-violet-300">
                          {transferSel.size === 0
                            ? "⚠️ Bitte zuerst die umzubuchende Produkte oben auswählen (Checkbox)."
                            : `${transferSel.size} Produkt${transferSel.size === 1 ? "" : "e"} ausgewählt.`}
                        </p>
                        <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
                          {targetTables.map((t) => {
                            const tLabel = tableLabel(t);
                            return (
                              <button
                                key={`${t.number}-${t.zone}`}
                                onClick={() => void confirmTransfer(o, tLabel)}
                                disabled={transferSel.size === 0 || transferBusy}
                                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-3 text-center text-sm sm:text-base font-bold hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-800 min-h-[44px]"
                              >
                                {t.number}
                                {t.zone ? (
                                  <span className="block text-[11px] sm:text-xs font-medium text-zinc-400">
                                    {t.zone}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                          {targetTables.length === 0 ? (
                            <p className="col-span-full text-xs sm:text-sm text-zinc-500">
                              Keine anderen Tische vorhanden.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
                : null}
            </div>
          </div>
        </>
      ) : null}

      {/* Neue Bestellung Modal */}
      {newOrderOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setNewOrderOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-t border-zinc-700 bg-zinc-900 p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Neue Bestellung</h2>
                <p className="text-xs text-zinc-400">
                  {newOrderItems.size} {newOrderItems.size === 1 ? "Produkt" : "Produkte"} ausgewählt
                </p>
              </div>
              <button
                onClick={() => { setNewOrderOpen(false); setNewOrderItems(new Map()); setOrderSearch(""); }}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700"
              >
                ✕
              </button>
            </div>

            {/* Suche */}
            <div className="relative mb-3">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-zinc-500">
                search
              </span>
              <input
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Produkt suchen…"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-10 pr-8 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
              {orderSearch ? (
                <button
                  onClick={() => setOrderSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-300"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              ) : null}
            </div>

            {/* Products: erst Kategorien, beim Antippen klappen die Produkte auf */}
            <div className="mb-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
              {(() => {
                const q = orderSearch.trim().toLowerCase();

                // Suchmodus: flache Liste aller passenden Produkte
                if (q) {
                  const matches = products.filter(
                    (p) => p.is_available !== false && p.name.toLowerCase().includes(q)
                  );
                  if (matches.length === 0) {
                    return <p className="py-4 text-center text-sm text-zinc-500">Keine Produkte gefunden.</p>;
                  }
                  const renderRow = (p: (typeof products)[number]) => {
                    const isSelected = newOrderItems.has(p.id);
                    const qty = newOrderItems.get(p.id) ?? 1;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isSelected ? "bg-emerald-500/20 ring-1 ring-emerald-500/50" : "hover:bg-zinc-800/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleNewOrderItem(p.id)}
                          className="h-4 w-4 flex-shrink-0 accent-emerald-500"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                          <span className="ml-2 text-xs text-zinc-500">{formatEur(p.price)}</span>
                          <span className="ml-2 text-[10px] text-zinc-600">{p.category}</span>
                        </div>
                        {isSelected ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setNewOrderItemQty(p.id, qty - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{qty}</span>
                            <button
                              onClick={() => setNewOrderItemQty(p.id, qty + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700"
                            >
                              +
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  };
                  return (
                    <div className="space-y-1">
                      {matches.map(renderRow)}
                    </div>
                  );
                }

                // Group products by category
                const grouped = new Map<string, typeof products>();
                for (const p of products) {
                  if (p.is_available === false) continue;
                  const cat = p.category || "Sonstiges";
                  if (!grouped.has(cat)) grouped.set(cat, []);
                  grouped.get(cat)!.push(p);
                }
                const selectedCountInCat = (catProducts: typeof products) =>
                  catProducts.reduce((s, p) => s + (newOrderItems.has(p.id) ? 1 : 0), 0);
                return Array.from(grouped.entries()).map(([catName, catProducts]) => {
                  const isOpen = openOrderCats.has(catName);
                  const selCount = selectedCountInCat(catProducts);
                  return (
                  <div key={catName} className="rounded-lg border border-zinc-800 bg-zinc-900/60">
                    {/* Category Header (toggle) */}
                    <button
                      onClick={() =>
                        setOpenOrderCats((prev) => {
                          const next = new Set(prev);
                          if (next.has(catName)) next.delete(catName);
                          else next.add(catName);
                          return next;
                        })
                      }
                      className="flex w-full items-center gap-2 px-3 py-3 text-left hover:bg-zinc-800/50"
                    >
                      <div className="h-4 w-1 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        {catName}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {catProducts.length} {catProducts.length === 1 ? "Artikel" : "Artikel"}
                      </span>
                      {selCount > 0 ? (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
                          {selCount}
                        </span>
                      ) : null}
                      <span
                        className={`material-symbols-outlined ml-auto text-zinc-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {/* Products */}
                    {isOpen ? (
                    <div className="space-y-1 border-t border-zinc-800 p-1.5">
                      {catProducts.map((p) => {
                        const isSelected = newOrderItems.has(p.id);
                        const qty = newOrderItems.get(p.id) ?? 1;
                        return (
                          <div
                            key={p.id}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                              isSelected ? "bg-emerald-500/20 ring-1 ring-emerald-500/50" : "hover:bg-zinc-800/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleNewOrderItem(p.id)}
                              className="h-4 w-4 flex-shrink-0 accent-emerald-500"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                              <span className="ml-2 text-xs text-zinc-500">{formatEur(p.price)}</span>
                            </div>
                            {isSelected ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setNewOrderItemQty(p.id, qty - 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center text-sm font-bold">{qty}</span>
                                <button
                                  onClick={() => setNewOrderItemQty(p.id, qty + 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700"
                                >
                                  +
                                </button>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    ) : null}
                  </div>
                  );
                });
              })()}
            </div>

            {/* Summary & Submit */}
            {newOrderItems.size > 0 ? (
              <div className="mb-3 rounded-lg bg-zinc-800/50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Gesamt:</span>
                  <span className="font-bold text-emerald-400">
                    {formatEur(
                      Array.from(newOrderItems.entries()).reduce((sum, [pid, qty]) => {
                        const p = products.find((pr) => pr.id === pid);
                        return sum + (p ? p.price * qty : 0);
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                onClick={submitNewOrder}
                disabled={newOrderItems.size === 0 || !selectedInfo?.table}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px]"
              >
                {newOrderItems.size} {newOrderItems.size === 1 ? "Produkt" : "Produkte"} hinzufügen
              </button>
              <button
                onClick={() => { setNewOrderOpen(false); setNewOrderItems(new Map()); setOrderSearch(""); }}
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700 min-h-[44px]"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </>
      )}

      {/* Stempel vergeben Modal (Loyalty) */}
      {stampOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setStampOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-2xl border-t border-zinc-700 bg-zinc-900 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
                <span className="material-symbols-outlined text-amber-400">stars</span>
                Stempel vergeben
              </h2>
              <button
                onClick={() => setStampOpen(false)}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700"
              >
                ✕
              </button>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-zinc-400">
              Kunde öffnet seine Wallet/App und zeigt den Stempelcode. Code eingeben →
              der Stempel landet direkt auf seiner Karte.
            </p>
            <input
              autoFocus
              value={stampCode}
              onChange={(e) => setStampCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && stampCode.trim().length >= 3 && !stampBusy) void submitStamp();
              }}
              placeholder="z.B. A7K2"
              maxLength={12}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-center font-mono text-xl font-black tracking-[0.3em] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => void submitStamp()}
                disabled={stampCode.trim().length < 3 || stampBusy}
                className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px]"
              >
                {stampBusy ? "Wird vergeben…" : "Stempel geben"}
              </button>
              <button
                onClick={() => setStampOpen(false)}
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700 min-h-[44px]"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}