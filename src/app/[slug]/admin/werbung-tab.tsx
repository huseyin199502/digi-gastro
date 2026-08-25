"use client";

import { useCallback, useEffect, useState } from "react";

interface AdBanner {
  id: number;
  company_name: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  target_url: string | null;
  placement: string;
  status: string;
  start_at: string | null;
  end_at: string | null;
  priority: number;
  impressions: number;
  clicks: number;
  created_at: string;
}

const PLACEMENTS = [
  { value: "menu_mid", label: "Speisekarte (Mitte)" },
  { value: "landing", label: "Willkommen-Seite" },
  { value: "cart", label: "Warenkorb" },
  { value: "thankyou", label: "Bestell-Bestätigung" },
];

const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none";
const btnCls =
  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50";

export default function WerbungTab() {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<AdBanner> | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/admin/ads");
      const data = await res.json();
      if (data.success) setBanners(data.banners);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const to = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(to);
  }, [load]);

  const flash = (kind: "ok" | "err", text: string) => {
    setNote({ kind, text });
    setTimeout(() => setNote(null), 3000);
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      const method = editing.id ? "PUT" : "POST";
      const res = await fetch("/admin/ads", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (data.success) {
        flash("ok", editing.id ? "Aktualisiert." : "Erstellt.");
        setEditing(null);
        await load();
      } else {
        flash("err", data.detail || "Fehler");
      }
    } catch {
      flash("err", "Netzwerkfehler.");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Banner wirklich löschen?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/admin/ads?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        flash("ok", "Gelöscht.");
        await load();
      } else {
        flash("err", data.detail || "Fehler");
      }
    } catch {
      flash("err", "Netzwerkfehler.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (b: AdBanner) => {
    const newStatus = b.status === "active" ? "paused" : "active";
    setBusy(true);
    try {
      await fetch("/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, status: newStatus }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const duplicate = async (b: AdBanner) => {
    setBusy(true);
    try {
      const res = await fetch("/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: b.company_name,
          title: b.title,
          subtitle: b.subtitle,
          image_url: b.image_url,
          target_url: b.target_url,
          placement: b.placement,
          priority: b.priority,
          status: b.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        flash("ok", `"${b.company_name}" dupliziert.`);
        await load();
      } else {
        flash("err", data.detail || "Fehler");
      }
    } catch {
      flash("err", "Netzwerkfehler.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-zinc-400">Lade Werbung…</div>;
  }

  return (
    <div className="space-y-6">
      {note ? (
        <div
          className={`rounded-lg border p-3 text-sm ${
            note.kind === "ok"
              ? "border-green-800 bg-green-950/40 text-green-300"
              : "border-red-800 bg-red-950/40 text-red-300"
          }`}
        >
          {note.text}
        </div>
      ) : null}

      {/* Neues Banner anlegen / Bearbeiten */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-400">
          {editing?.id ? "Banner bearbeiten" : "Neues Werbebanner"}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Firmenname *</label>
            <input
              className={inputCls}
              value={editing?.company_name ?? ""}
              onChange={(e) => setEditing((p) => ({ ...p, company_name: e.target.value }))}
              placeholder="z.B. Taxi Müller"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Titel *</label>
            <input
              className={inputCls}
              value={editing?.title ?? ""}
              onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
              placeholder="z.B. 20% Rabatt"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Untertitel</label>
            <input
              className={inputCls}
              value={editing?.subtitle ?? ""}
              onChange={(e) => setEditing((p) => ({ ...p, subtitle: e.target.value || null }))}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Bild-URL</label>
            <input
              className={inputCls}
              value={editing?.image_url ?? ""}
              onChange={(e) => setEditing((p) => ({ ...p, image_url: e.target.value || null }))}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Link-URL (Klick)</label>
            <input
              className={inputCls}
              value={editing?.target_url ?? ""}
              onChange={(e) => setEditing((p) => ({ ...p, target_url: e.target.value || null }))}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Platzierung</label>
            <select
              className={inputCls}
              value={editing?.placement ?? "menu_mid"}
              onChange={(e) => setEditing((p) => ({ ...p, placement: e.target.value }))}
            >
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Priorität (0 = Standard)</label>
            <input
              type="number"
              className={inputCls}
              value={editing?.priority ?? 0}
              onChange={(e) => setEditing((p) => ({ ...p, priority: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Status</label>
            <select
              className={inputCls}
              value={editing?.status ?? "active"}
              onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="active">Aktiv</option>
              <option value="paused">Pausiert</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Gültig ab</label>
            <input
              type="datetime-local"
              className={inputCls}
              value={editing?.start_at ? editing.start_at.slice(0, 16) : ""}
              onChange={(e) => setEditing((p) => ({ ...p, start_at: e.target.value || null }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Gültig bis</label>
            <input
              type="datetime-local"
              className={inputCls}
              value={editing?.end_at ? editing.end_at.slice(0, 16) : ""}
              onChange={(e) => setEditing((p) => ({ ...p, end_at: e.target.value || null }))}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            disabled={busy || !editing?.company_name?.trim() || !editing?.title?.trim()}
            onClick={() => void save()}
            className={`${btnCls} bg-emerald-600 text-white hover:bg-emerald-500`}
          >
            {busy ? "Speichert…" : editing?.id ? "Aktualisieren" : "Erstellen"}
          </button>
          {editing ? (
            <button
              onClick={() => setEditing(null)}
              className={`${btnCls} border border-zinc-700 text-zinc-300 hover:bg-zinc-800`}
            >
              Abbrechen
            </button>
          ) : null}
        </div>
      </section>

      {/* Banner-Liste */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
          Bestehende Banner ({banners.length})
        </h2>

        {banners.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Noch keine Banner angelegt. Erstelle das erste Werbebanner für dein Restaurant.
          </p>
        ) : (
          <div className="space-y-3">
            {banners.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-800/30 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        b.status === "active" ? "bg-emerald-400" : "bg-zinc-500"
                      }`}
                    />
                    <span className="text-sm font-bold text-zinc-100 truncate">
                      {b.company_name}: {b.title}
                    </span>
                    {b.subtitle ? (
                      <span className="text-xs text-zinc-500 truncate hidden sm:inline">— {b.subtitle}</span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
                    <span>Platz: {PLACEMENTS.find((p) => p.value === b.placement)?.label ?? b.placement}</span>
                    <span>Prio: {b.priority}</span>
                    <span>👁 {b.impressions}</span>
                    <span>🖱 {b.clicks}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => void toggle(b)}
                    disabled={busy}
                    className={`${btnCls} border text-xs ${
                      b.status === "active"
                        ? "border-emerald-700 text-emerald-400 hover:bg-emerald-950"
                        : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {b.status === "active" ? "Aktiv" : "Pausiert"}
                  </button>
                  <button
                    onClick={() => setEditing(b)}
                    disabled={busy}
                    className={`${btnCls} border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs`}
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => void duplicate(b)}
                    disabled={busy}
                    className={`${btnCls} border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs`}
                  >
                    Duplizieren
                  </button>
                  <button
                    onClick={() => void del(b.id)}
                    disabled={busy}
                    className={`${btnCls} border border-red-800 text-red-400 hover:bg-red-950 text-xs`}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
