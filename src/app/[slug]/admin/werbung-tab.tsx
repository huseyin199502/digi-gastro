"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const [search, setSearch] = useState("");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [onlyActive, setOnlyActive] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const seededRef = useRef(false);

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

  // Beim ersten Laden: Gruppen mit aktiven Bannern automatisch ausklappen,
  // pausierte Gruppen bleiben zu.
  useEffect(() => {
    if (seededRef.current || banners.length === 0) return;
    seededRef.current = true;
    setExpanded(
      new Set(
        banners
          .filter((b) => b.status === "active")
          .map((b) => b.company_name || "Ohne Namen"),
      ),
    );
  }, [banners]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return banners.filter((b) => {
      if (placementFilter !== "all" && b.placement !== placementFilter) return false;
      if (onlyActive && b.status !== "active") return false;
      if (!q) return true;
      return (
        b.company_name.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        (b.subtitle ?? "").toLowerCase().includes(q)
      );
    });
  }, [banners, search, placementFilter, onlyActive]);

  const groups = useMemo(() => {
    const map = new Map<string, AdBanner[]>();
    for (const b of filtered) {
      const key = b.company_name || "Ohne Namen";
      const arr = map.get(key);
      if (arr) arr.push(b);
      else map.set(key, [b]);
    }
    return Array.from(map.entries())
      .map(([name, items]) => ({
        name,
        items,
        impressions: items.reduce((s, i) => s + i.impressions, 0),
        clicks: items.reduce((s, i) => s + i.clicks, 0),
        hasActive: items.some((i) => i.status === "active"),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [filtered]);

  const toggleGroup = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

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
      const res = await fetch(`/admin/ads/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        flash("ok", "Gelöscht.");
        await load();
      } else {
        flash("err", data?.detail || "Fehler beim Löschen.");
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

  const toggleGroupStatus = async (items: AdBanner[]) => {
    const newStatus = items.some((i) => i.status === "active") ? "paused" : "active";
    setBusy(true);
    try {
      await Promise.all(
        items.map((b) =>
          fetch("/admin/ads", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: b.id, status: newStatus }),
          }),
        ),
      );
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

      {/* Banner-Liste — nach Firma gruppiert & einklappbar */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
          Bestehende Banner ({filtered.length}
          {filtered.length !== banners.length ? ` von ${banners.length}` : ""})
        </h2>

        {banners.length > 0 ? (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1">
              <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-lg text-zinc-500">
                search
              </span>
              <input
                className={`${inputCls} pl-9`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Firma oder Titel suchen…"
              />
            </div>
            <select
              className={`${inputCls} w-auto`}
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
            >
              <option value="all">Alle Platzierungen</option>
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 px-1 text-xs font-semibold text-zinc-400">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
                className="h-4 w-4 accent-emerald-500"
              />
              Nur aktive
            </label>
          </div>
        ) : null}

        {banners.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Noch keine Banner angelegt. Erstelle das erste Werbebanner für dein Restaurant.
          </p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-zinc-500">Keine Banner für diesen Filter gefunden.</p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => {
              const isOpen = expanded.has(g.name);
              return (
                <div
                  key={g.name}
                  className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800/20"
                >
                  <div className="flex items-center transition-colors hover:bg-zinc-800/60">
                    <button
                      onClick={() => toggleGroup(g.name)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          g.hasActive ? "bg-emerald-400" : "bg-zinc-500"
                        }`}
                      />
                      <span className="truncate text-sm font-bold text-zinc-100">{g.name}</span>
                      <span className="shrink-0 rounded-full bg-zinc-700/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-300">
                        {g.items.length} Banner
                      </span>
                      <span className="ml-auto hidden shrink-0 items-center gap-3 text-xs text-zinc-500 sm:flex">
                        <span title="Impressions">👁 {g.impressions}</span>
                        <span title="Klicks">🖱 {g.clicks}</span>
                      </span>
                      <span
                        className={`material-symbols-outlined shrink-0 text-lg text-zinc-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    <button
                      onClick={() => void toggleGroupStatus(g.items)}
                      disabled={busy}
                      title={
                        g.hasActive
                          ? `Alle ${g.items.length} Banner pausieren`
                          : `Alle ${g.items.length} Banner aktivieren`
                      }
                      className={`mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
                        g.hasActive
                          ? "border-emerald-700 text-emerald-400 hover:bg-emerald-950"
                          : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {g.hasActive ? "pause" : "play_arrow"}
                      </span>
                    </button>
                  </div>

                  {isOpen ? (
                    <div className="space-y-1.5 border-t border-zinc-800 p-2">
                      {g.items.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-3 rounded-lg bg-zinc-900/60 px-3 py-2"
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              b.status === "active" ? "bg-emerald-400" : "bg-zinc-500"
                            }`}
                          />
                          <span className="hidden w-40 shrink-0 truncate text-xs text-zinc-400 md:block">
                            {PLACEMENTS.find((p) => p.value === b.placement)?.label ?? b.placement}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-zinc-100">
                              {b.title}
                            </div>
                            {b.subtitle ? (
                              <div className="truncate text-xs text-zinc-500">{b.subtitle}</div>
                            ) : null}
                          </div>
                          <div className="hidden shrink-0 items-center gap-3 text-xs text-zinc-500 lg:flex">
                            <span title="Priorität">P{b.priority}</span>
                            <span title="Impressions">👁 {b.impressions}</span>
                            <span title="Klicks">🖱 {b.clicks}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => void toggle(b)}
                              disabled={busy}
                              title={b.status === "active" ? "Pausieren" : "Aktivieren"}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
                                b.status === "active"
                                  ? "border-emerald-700 text-emerald-400 hover:bg-emerald-950"
                                  : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                              }`}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {b.status === "active" ? "pause" : "play_arrow"}
                              </span>
                            </button>
                            <button
                              onClick={() => setEditing(b)}
                              disabled={busy}
                              title="Bearbeiten"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => void duplicate(b)}
                              disabled={busy}
                              title="Duplizieren"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-lg">content_copy</span>
                            </button>
                            <button
                              onClick={() => void del(b.id)}
                              disabled={busy}
                              title="Löschen"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-800 text-red-400 transition-colors hover:bg-red-950 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
