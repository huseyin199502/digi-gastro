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
  serveItem: (o: LiveOrder, it: LiveItem) => void;
  serveAllOrder: (o: LiveOrder) => void;
  cancelItem: (o: LiveOrder, it: LiveItem) => void;
  cancelOrder: (o: LiveOrder) => void;
  payOrder: (o: LiveOrder) => void;
  splitPay: (o: LiveOrder, items: LiveItem[]) => void;
  transferOrder: (o: LiveOrder, targetLabel: string, itemKeys?: string[], itemsMap?: Record<string, number>) => void;
  serviceErledigt: (c: ServiceCall) => void;
  addManualOrder: (tableLabel: string, productId: number, quantity: number) => void;
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
    serveItem,
    serveAllOrder,
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
    showRevenue = true,
  } = props;

  const [splitMode, setSplitMode] = useState(false);
  const [splitSel, setSplitSel] = useState<Map<number, number>>(new Map());
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  const [transferSel, setTransferSel] = useState<Map<number, number>>(new Map());
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newOrderItems, setNewOrderItems] = useState<Map<number, number>>(new Map()); // productId -> quantity
  const [multiSelect, setMultiSelect] = useState<Set<number>>(new Set());

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

  // Super-group badges per table
  const badgesByTable = useMemo(() => {
    const map = new Map<string, SuperGroupBadge[]>();
    if (!live) return map;
    for (const t of live.tables ?? []) {
      const label = tableLabel(t);
      const orders = (live?.orders ?? []).filter((o) => o.table === label);
      if (orders.length > 0) {
        map.set(label, computeSuperGroupBadges(orders, products, categories, superGroups));
      }
    }
    return map;
  }, [live, products, categories, superGroups]);

  const toggleSplitItem = (itemId: number, quantity: number) => {
    setSplitSel((prev) => {
      const next = new Map(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.set(itemId, quantity);
      return next;
    });
  };

  const setSplitQty = (itemId: number, qty: number) => {
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
    splitPay(o, items);
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

  const serveSelectedItems = async (order: LiveOrder) => {
    const items = order.items.filter((it) => multiSelect.has(it.id) && (it.item_status || "pending") === "pending");
    for (const it of items) {
      await serveItem(order, it);
    }
    setMultiSelect(new Set());
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
    for (const [productId, qty] of newOrderItems) {
      addManualOrder(tableLabel, productId, qty);
    }
    setNewOrderOpen(false);
    setNewOrderItems(new Map());
  };

  const closeCockpit = () => {
    setSelectedTable(null);
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
  const toggleTransferItem = (itemId: number, quantity: number) => {
    setTransferSel((prev) => {
      const next = new Map(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.set(itemId, quantity);
      return next;
    });
  };

  const setTransferQty = (itemId: number, qty: number) => {
    setTransferSel((prev) => {
      const next = new Map(prev);
      next.set(itemId, qty);
      return next;
    });
  };

  const transferItemKeys = (o: LiveOrder): string[] => {
    const keys: string[] = [];
    for (const [itemId, qty] of transferSel) {
      const it = o.items.find((x) => x.id === itemId);
      if (!it) continue;
      const noteSlug = (it.note ?? "").replace(/\s+/g, "_");
      const comboId = it.combo_id ?? "";
      const comboInst = it.combo_instance_id ?? "";
      const itemStatus = it.item_status || "pending";
      keys.push(`${o.id}_${it.product_id}_${noteSlug}_${itemStatus}_${comboId}_${comboInst}`);
      void qty;
    }
    return keys;
  };

  const transferItemQtys = (o: LiveOrder): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const [itemId, qty] of transferSel) {
      const it = o.items.find((x) => x.id === itemId);
      if (!it) continue;
      const noteSlug = (it.note ?? "").replace(/\s+/g, "_");
      const comboId = it.combo_id ?? "";
      const comboInst = it.combo_instance_id ?? "";
      const itemStatus = it.item_status || "pending";
      map[`${o.id}_${it.product_id}_${noteSlug}_${itemStatus}_${comboId}_${comboInst}`] = qty;
    }
    return map;
  };

  const confirmTransfer = (o: LiveOrder, targetLabel: string) => {
    const keys = transferItemKeys(o);
    if (keys.length === 0) {
      pushToast("Bitte zuerst die umzubuchende Produkte auswählen.", "error");
      return;
    }
    transferOrder(o, targetLabel, keys, transferItemQtys(o));
    setTransferTarget(null);
    setTransferSel(new Map());
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {showRevenue ? (
          <StatCard label="Umsatz heute" value={formatEur(stats?.brutto)} />
        ) : null}
        <StatCard label="Bestellungen heute" value={String(stats?.orders_count ?? 0)} />
        {showRevenue ? (
          <StatCard label="Trinkgeld" value={formatEur(stats?.tip)} />
        ) : null}
        {showRevenue ? (
          <StatCard label="Ø Bon" value={formatEur(stats?.avg_basket)} />
        ) : null}
        <StatCard
          label="Server"
          value={live ? (live.server_time || "").slice(0, 16) : "—"}
        />
      </div>

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

      {/* Tisch-Raster (sortiert nach Nummer) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filteredTables.map((t) => {
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
                {status === "calling" ? "🔔 Ruf" : STATUS_META[status].text}
              </span>
              {pending > 0 ? (
                <span className="text-xs sm:text-sm font-bold">{pending} offen</span>
              ) : total > 0 ? (
                <span className="text-xs sm:text-sm font-semibold opacity-90">
                  {formatEur(total)}
                </span>
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
        {filteredTables.length === 0 ? (
          <p className="col-span-full text-sm text-zinc-500">Keine Tische vorhanden.</p>
        ) : null}
      </div>

      {/* Service calls */}
      <h3 className="text-lg font-bold">Service-Rufe</h3>
      <div className="space-y-2">
        {(live?.service_calls ?? []).slice(0, 12).map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3"
          >
            <div>
              <span className="font-semibold">{c.table}</span>
              <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                {c.type}
              </span>
              <span className="ml-2 text-xs text-zinc-500">{c.timestamp}</span>
            </div>
            <button
              onClick={() => serviceErledigt(c)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700"
            >
              Erledigt
            </button>
          </div>
        ))}
        {(live?.service_calls ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">Keine Service-Rufe.</p>
        ) : null}
      </div>

      {/* ── Bottom sheet cockpit ── */}
      {selectedTable && selectedInfo ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeCockpit}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border-t border-zinc-700 bg-zinc-900 p-4 sm:p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
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
                  <span className="font-bold text-emerald-400">
                    {formatEur(activeTableOrders.reduce((s, o) => s + (o.total ?? 0), 0))}
                  </span>
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
                  <span className="font-bold text-amber-300">🔔 {selectedCall.type}</span>
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
              {sortedTableOrders.map((o) => {
                const anyPending = o.items.some(
                  (it) => (it.item_status || "pending") === "pending"
                );
                const selectedInOrder = o.items.filter((it) => multiSelect.has(it.id) && (it.item_status || "pending") === "pending");
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
                      <span className="font-semibold text-emerald-400">
                        {formatEur(o.total)}
                      </span>
                    </div>

                    {/* Groups */}
                    {groupItemsBySuperGroup(o).map((group, groupIdx, groups) => {
                      const pendingInGroup = group.items.filter((it) => (it.item_status || "pending") === "pending");
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
                                {group.items.length} {group.items.length === 1 ? "Artikel" : "Artikel"}
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
                            {group.items.map((it, idx) => {
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

                                  {/* Status / Actions */}
                                  <div className="flex shrink-0 items-center gap-2">
                                    {selectionActive ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => {
                                            const cur = splitMode ? splitQty : transferQty;
                                            const next = Math.max(1, cur - 1);
                                            if (splitMode) setSplitQty(it.id, next);
                                            else setTransferQty(it.id, next);
                                          }}
                                          className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
                                          disabled={(splitMode ? splitQty : transferQty) <= 1}
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
                                          disabled={(splitMode ? splitQty : transferQty) >= it.quantity}
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
                                        onClick={() => cancelItem(o, it)}
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
                          onClick={() => serveSelectedItems(o)}
                          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 min-h-[44px]"
                        >
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          {selectedInOrder.length} servieren
                        </button>
                      ) : null}
                      {anyPending ? (
                        <button
                          onClick={() => serveAllOrder(o)}
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
                          className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700 min-h-[44px]"
                        >
                          Abbrechen
                        </button>
                      )}
                      <button
                        onClick={() => {
                          payOrder(o);
                          closeCockpit();
                        }}
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold hover:bg-emerald-700 min-h-[44px]"
                      >
                        Alles bezahlen
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Bon #${o.id} komplett stornieren?`)) {
                            cancelOrder(o);
                            closeCockpit();
                          }
                        }}
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
                                onClick={() => {
                                  confirmTransfer(o, tLabel);
                                }}
                                disabled={transferSel.size === 0}
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
              })}
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
                onClick={() => { setNewOrderOpen(false); setNewOrderItems(new Map()); }}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700"
              >
                ✕
              </button>
            </div>

            {/* Products grouped by category */}
            <div className="mb-4 max-h-[50vh] space-y-4 overflow-y-auto pr-1">
              {(() => {
                // Group products by category
                const grouped = new Map<string, typeof products>();
                for (const p of products) {
                  if (p.is_available === false) continue;
                  const cat = p.category || "Sonstiges";
                  if (!grouped.has(cat)) grouped.set(cat, []);
                  grouped.get(cat)!.push(p);
                }
                return Array.from(grouped.entries()).map(([catName, catProducts]) => (
                  <div key={catName}>
                    {/* Category Header */}
                    <div className="mb-2 flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2">
                      <div className="h-4 w-1 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        {catName}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {catProducts.length} {catProducts.length === 1 ? "Artikel" : "Artikel"}
                      </span>
                    </div>
                    {/* Products */}
                    <div className="space-y-1">
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
                  </div>
                ));
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
                onClick={() => { setNewOrderOpen(false); setNewOrderItems(new Map()); }}
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-zinc-700 min-h-[44px]"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}