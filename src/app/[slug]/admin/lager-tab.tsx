"use client";

// ──────────────────────────────────────────────────────────────────
// Etappe 8 — Lager-Tab im Admin-Dashboard.
// Übersicht (Dashboard) + Artikelverwaltung mit Transaktionen auf Basis
// der /admin/api/lager/* Routen.
// ──────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";

interface LowStockItem {
  id: number;
  name: string;
  current_stock: number;
  min_stock: number;
  base_unit: string;
  reorder_qty: number | null;
}

interface RecentTransaction {
  id: number;
  stock_item_id: number;
  type: string;
  quantity: number;
  reason: string | null;
  created_at: string | null;
}

interface LagerDashboard {
  total_items: number;
  total_value: number;
  low_stock_count: number;
  low_stock_items: LowStockItem[];
  recent_transactions: RecentTransaction[];
}

interface StockItem {
  id: number;
  name: string;
  sku: string | null;
  category_id: number | null;
  supplier_id: number | null;
  current_stock: number;
  min_stock: number;
  max_stock: number | null;
  reorder_qty: number | null;
  base_unit: string;
  purchase_unit: string | null;
  purchase_to_base_factor: number;
  avg_cost: number;
  last_purchase_price: number | null;
  product_id: number | null;
  active: boolean;
  is_low_stock: boolean;
  stock_value: number;
}

interface Toast {
  id: number;
  msg: string;
  kind: "success" | "error";
}

const TXN_LABELS: Record<string, string> = {
  in: "Eingang",
  out: "Ausgang",
  waste: "Verbrauch / Schwund",
  adjustment: "Korrektur",
};

function formatEur(n: number | null | undefined): string {
  return `${(n ?? 0).toFixed(2)} €`;
}

function fmtDate(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export default function LagerTab({ pushToast }: { pushToast: (m: string, k?: Toast["kind"]) => void }) {
  const [section, setSection] = useState<"uebersicht" | "artikel">("uebersicht");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Lager &amp; Inventar</h2>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "uebersicht", label: "Übersicht" },
            { id: "artikel", label: "Artikel" },
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
        <OverviewSection />
      ) : (
        <ItemsSection busy={busy} setBusy={setBusy} pushToast={pushToast} />
      )}
    </div>
  );
}

// ─────────────────────────── Übersicht ───────────────────────────

function OverviewSection() {
  const [data, setData] = useState<LagerDashboard | null>(null);

  useEffect(() => {
    const to = window.setTimeout(() => {
      void (async () => {
        try {
          const r = await fetch("/admin/api/lager/dashboard");
          if (r.ok) setData(await r.json());
        } catch {
          /* ignore */
        }
      })();
    }, 0);
    return () => window.clearTimeout(to);
  }, []);

  if (!data) return <p className="text-sm text-zinc-500">Wird geladen…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs text-zinc-400">Artikel aktiv</p>
          <p className="mt-1 text-xl font-bold">{data.total_items}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs text-zinc-400">Lagerwert</p>
          <p className="mt-1 text-xl font-bold">{formatEur(data.total_value)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs text-zinc-400">Niedrigbestand</p>
          <p className={`mt-1 text-xl font-bold ${data.low_stock_count > 0 ? "text-red-400" : ""}`}>
            {data.low_stock_count}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-bold">Niedrigbestand</h3>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            {data.low_stock_items.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0"
              >
                <div>
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-xs text-zinc-500">
                    Bestand {i.current_stock} {i.base_unit} · Mindest {i.min_stock} · Nachbestellung{" "}
                    {i.reorder_qty ?? "—"}
                  </p>
                </div>
                <span className="rounded-full bg-red-900/50 px-2 py-0.5 text-xs font-bold text-red-300">
                  niedrig
                </span>
              </div>
            ))}
            {data.low_stock_items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500">Keine Artikel im Niedrigbestand.</p>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold">Letzte Transaktionen</h3>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            {data.recent_transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0"
              >
                <span>
                  <span className={t.quantity >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {t.quantity >= 0 ? `+${t.quantity}` : t.quantity}
                  </span>{" "}
                  · {TXN_LABELS[t.type] ?? t.type}
                  {t.reason ? ` — ${t.reason}` : ""}
                </span>
                <span className="text-xs text-zinc-500">#{t.stock_item_id} · {fmtDate(t.created_at)}</span>
              </div>
            ))}
            {data.recent_transactions.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500">Keine Transaktionen.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Artikel ───────────────────────────

function ItemsSection(props: {
  busy: boolean;
  setBusy: (b: boolean) => void;
  pushToast: (m: string, k?: Toast["kind"]) => void;
}) {
  const { busy, setBusy, pushToast } = props;
  const [items, setItems] = useState<StockItem[]>([]);
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);

  // Add form
  const [name, setName] = useState("");
  const [baseUnit, setBaseUnit] = useState("Stk");
  const [currentStock, setCurrentStock] = useState("0");
  const [costPerUnit, setCostPerUnit] = useState("0");
  const [minStock, setMinStock] = useState("0");

  const load = useCallback(async () => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (lowOnly) q.set("low_stock_only", "true");
    const s = q.toString();
    try {
      const r = await fetch(`/admin/api/lager/items${s ? `?${s}` : ""}`);
      if (r.ok) {
        const j = await r.json();
        setItems(j.items ?? []);
      }
    } catch {
      /* ignore */
    }
  }, [search, lowOnly]);

  useEffect(() => {
    const to = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(to);
  }, [load]);

  const addItem = async () => {
    if (!name.trim()) {
      pushToast("Name angeben", "error");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/admin/api/lager/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          base_unit: baseUnit,
          current_stock: Number(currentStock) || 0,
          cost_per_unit: Number(costPerUnit) || 0,
          min_stock: Number(minStock) || 0,
        }),
      });
      if (r.ok) {
        pushToast("Artikel angelegt");
        setName("");
        setCurrentStock("0");
        await load();
      } else {
        const j = await r.json().catch(() => ({}));
        pushToast(String(j.detail ?? "Fehler beim Anlegen"), "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const bookTransaction = async (item: StockItem, type: "in" | "out" | "waste") => {
    const raw = window.prompt(
      `${TXN_LABELS[type]} für "${item.name}" — Menge in ${item.base_unit}:`,
      type === "in" ? String(item.reorder_qty ?? 10) : "1"
    );
    if (raw == null) return;
    const qty = Number(raw);
    if (!Number.isFinite(qty) || qty <= 0) {
      pushToast("Ungültige Menge", "error");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/admin/api/lager/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_item_id: item.id,
          type,
          quantity: qty,
          unit_cost: type === "in" ? item.last_purchase_price ?? item.avg_cost : 0,
          reason: type === "in" ? "Wareneingang" : type === "waste" ? "Verbrauch / Schwund" : "Warenausgang",
        }),
      });
      if (r.ok) {
        const j = await r.json();
        pushToast(`${TXN_LABELS[type]} gebucht — neuer Bestand ${j.new_stock}`);
        await load();
      } else {
        const j = await r.json().catch(() => ({}));
        pushToast(String(j.detail ?? "Fehler"), "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteItem = async (item: StockItem) => {
    if (!window.confirm(`"${item.name}" wirklich löschen?`)) return;
    setBusy(true);
    try {
      const r = await fetch(`/admin/api/lager/items/${item.id}`, { method: "DELETE" });
      if (r.ok) {
        pushToast("Artikel gelöscht");
        await load();
      } else {
        const j = await r.json().catch(() => ({}));
        pushToast(String(j.detail ?? "Fehler beim Löschen"), "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Add item form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="mb-3 font-bold">Artikel anlegen</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="z. B. Cola 1L"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Einheit</label>
              <input
                value={baseUnit}
                onChange={(e) => setBaseUnit(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Initialbestand</label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Einzelpreis (€)</label>
              <input
                type="number"
                step="0.01"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Mindestbestand</label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            onClick={() => void addItem()}
            disabled={busy}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? "…" : "Anlegen"}
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="lg:col-span-2">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Artikel suchen…"
          />
          <button
            onClick={() => setLowOnly((v) => !v)}
            className={`rounded-lg px-3 py-2 text-xs font-bold ${
              lowOnly
                ? "bg-red-600 text-white"
                : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Nur Niedrigbestand
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {i.name}
                  {i.is_low_stock ? (
                    <span className="ml-2 rounded-full bg-red-900/50 px-2 py-0.5 text-xs font-bold text-red-300">
                      niedrig
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-zinc-500">
                  Bestand{" "}
                  <span className={i.is_low_stock ? "font-bold text-red-400" : ""}>
                    {i.current_stock} {i.base_unit}
                  </span>{" "}
                  · Mindest {i.min_stock} · {formatEur(i.avg_cost)}/Stk · Wert {formatEur(i.stock_value)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => void bookTransaction(i, "in")}
                  disabled={busy}
                  className="rounded-lg bg-emerald-600/80 px-2.5 py-1 text-xs font-bold hover:bg-emerald-600 disabled:opacity-50"
                >
                  + Eingang
                </button>
                <button
                  onClick={() => void bookTransaction(i, "out")}
                  disabled={busy}
                  className="rounded-lg bg-amber-600/80 px-2.5 py-1 text-xs font-bold hover:bg-amber-600 disabled:opacity-50"
                >
                  − Ausgang
                </button>
                <button
                  onClick={() => void bookTransaction(i, "waste")}
                  disabled={busy}
                  className="rounded-lg bg-zinc-700 px-2.5 py-1 text-xs font-semibold hover:bg-zinc-600 disabled:opacity-50"
                >
                  Schwund
                </button>
                <button
                  onClick={() => void deleteItem(i)}
                  disabled={busy}
                  className="rounded-lg border border-red-800/60 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-950/40 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-500">Keine Artikel gefunden.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}