"use client";

// ──────────────────────────────────────────────────────────────────
// Etappe 8 — Personal-Tab im Admin-Dashboard.
// Port der Legacy-Ansichten "Personal / Schichten / Urlaub" (admin.html)
// auf die vorhandenen /admin/api/personal/* Routen.
// ──────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  hourly_rate: number;
  weekly_target_hours: number;
  contract_type: string | null;
  active: boolean;
  color: string | null;
}

interface Shift {
  id: number;
  staff_id: number;
  staff_name: string | null;
  role: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  hourly_rate: number;
  status: string | null;
  position_label: string | null;
  notes: string | null;
  duration_hours?: number;
  labor_cost?: number;
}

interface TimeOffRequest {
  id: number;
  staff_id: number;
  staff_name: string | null;
  start_date: string;
  end_date: string;
  request_type: string | null;
  reason: string | null;
  status: string;
  created_at: string | null;
}

interface Toast {
  id: number;
  msg: string;
  kind: "success" | "error";
}

const ROLE_LABELS: Record<string, string> = {
  koch: "Koch",
  kellner: "Kellner",
  bar: "Bar",
  spuelkraft: "Spülkraft",
  manag: "Management",
  chef: "Chef",
};

function roleLabel(r: string): string {
  return ROLE_LABELS[r] ?? r;
}

function formatEur(n: number | null | undefined): string {
  return `${(n ?? 0).toFixed(2)} €`;
}

function fmtDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function weekStart(d: Date): Date {
  const day = (d.getDay() + 6) % 7; // Monday = 0
  const s = new Date(d);
  s.setDate(s.getDate() - day);
  return s;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export default function PersonalTab({ pushToast }: { pushToast: (m: string, k?: Toast["kind"]) => void }) {
  const [section, setSection] = useState<"mitarbeiter" | "schichten" | "urlaub">("mitarbeiter");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Personal</h2>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "mitarbeiter", label: "Mitarbeiter" },
            { id: "schichten", label: "Schichten" },
            { id: "urlaub", label: "Urlaub / Freizeit" },
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

      {section === "mitarbeiter" ? (
        <StaffSection busy={busy} setBusy={setBusy} pushToast={pushToast} />
      ) : section === "schichten" ? (
        <ShiftsSection busy={busy} setBusy={setBusy} pushToast={pushToast} />
      ) : (
        <TimeOffSection busy={busy} setBusy={setBusy} pushToast={pushToast} />
      )}
    </div>
  );
}

// ─────────────────────────── Mitarbeiter ───────────────────────────

function StaffSection(props: {
  busy: boolean;
  setBusy: (b: boolean) => void;
  pushToast: (m: string, k?: Toast["kind"]) => void;
}) {
  const { busy, setBusy, pushToast } = props;
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("kellner");
  const [pin, setPin] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/admin/api/personal/staff");
      if (r.ok) {
        const j = await r.json();
        setStaff(j.staff ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const to = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(to);
  }, [load]);

  const addStaff = async () => {
    if (!name.trim() || !pin.trim()) {
      pushToast("Name und PIN angeben", "error");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: name.trim(), role, pin: pin.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        pushToast(`Mitarbeiter ${j.name ?? name.trim()} angelegt`);
        setName("");
        setPin("");
        await load();
      } else {
        pushToast(String(j.detail ?? "Fehler beim Anlegen"), "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteStaff = async (m: StaffMember) => {
    const pinCode = window.prompt(`PIN-Code von "${m.name}" zum Löschen eingeben:`);
    if (!pinCode) return;
    if (!window.confirm(`"${m.name}" mit PIN ${pinCode} wirklich löschen?`)) return;
    setBusy(true);
    try {
      const r = await fetch(`/admin/staff-loeschen/${encodeURIComponent(pinCode)}`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (r.ok) {
        pushToast(`Mitarbeiter mit PIN ${pinCode} gelöscht`);
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
      {/* Add form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="mb-3 font-bold">Mitarbeiter anlegen</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="z. B. Max Muster"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Rolle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            >
              {Object.entries(ROLE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">PIN-Code</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="z. B. 1234"
            />
          </div>
          <button
            onClick={() => void addStaff()}
            disabled={busy}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? "…" : "Anlegen"}
          </button>
        </div>
      </div>

      {/* Staff list */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 lg:col-span-2">
        <h3 className="border-b border-zinc-800 bg-zinc-900/60 px-4 py-3 font-bold">
          Mitarbeiter ({staff.length})
        </h3>
        {staff.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: m.color ?? "#3f3f46", color: "#fff" }}
              >
                {m.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs text-zinc-500">
                  {roleLabel(m.role)} · {formatEur(m.hourly_rate)}/h · Ziel {m.weekly_target_hours}h/Woche
                  {m.active ? "" : " · inaktiv"}
                </p>
              </div>
            </div>
            <button
              onClick={() => void deleteStaff(m)}
              disabled={busy}
              className="rounded-lg border border-red-800/60 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 disabled:opacity-50"
            >
              Löschen
            </button>
          </div>
        ))}
        {staff.length === 0 ? (
          <p className="px-4 py-6 text-sm text-zinc-500">Keine Mitarbeiter angelegt.</p>
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────── Schichten ───────────────────────────

function ShiftsSection(props: {
  busy: boolean;
  setBusy: (b: boolean) => void;
  pushToast: (m: string, k?: Toast["kind"]) => void;
}) {
  const { busy, setBusy, pushToast } = props;
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => weekStart(new Date()));

  // Add-shift form
  const [staffId, setStaffId] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");
  const [breakMin, setBreakMin] = useState("30");
  const [warnings, setWarnings] = useState<string[]>([]);

  const weekEndDate = addDays(weekStartDate, 6);

  const load = useCallback(async () => {
    const q = new URLSearchParams({
      start_date: isoDate(weekStartDate),
      end_date: isoDate(weekEndDate),
    });
    try {
      const [sr, shr] = await Promise.all([
        fetch("/admin/api/personal/staff"),
        fetch(`/admin/api/personal/shifts?${q.toString()}`),
      ]);
      if (sr.ok) {
        const j = await sr.json();
        setStaff(j.staff ?? []);
      }
      if (shr.ok) {
        const j = await shr.json();
        setShifts(j.shifts ?? []);
      }
    } catch {
      /* ignore */
    }
  }, [weekStartDate, weekEndDate]);

  useEffect(() => {
    const to = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(to);
  }, [load]);

  const addShift = async () => {
    if (!staffId || !shiftDate) {
      pushToast("Mitarbeiter und Datum angeben", "error");
      return;
    }
    setBusy(true);
    setWarnings([]);
    try {
      const r = await fetch("/admin/api/personal/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: Number(staffId),
          role: staff.find((s) => s.id === Number(staffId))?.role ?? "kellner",
          shift_date: shiftDate,
          start_time: startTime,
          end_time: endTime,
          break_minutes: Number(breakMin) || 0,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        pushToast("Schicht angelegt");
        if (Array.isArray(j.warnings) && j.warnings.length > 0) {
          setWarnings(j.warnings.map(String));
        }
        setShiftDate("");
        await load();
      } else {
        pushToast(String(j.detail ?? "Fehler beim Anlegen"), "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    setBusy(true);
    try {
      const r = await fetch("/admin/api/personal/shifts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: isoDate(weekStartDate),
          end_date: isoDate(weekEndDate),
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        pushToast(`Schichten veröffentlicht (${j.published_count ?? 0})`);
        await load();
      } else {
        pushToast(String(j.detail ?? "Fehler beim Veröffentlichen"), "error");
      }
    } catch {
      pushToast("Netzwerkfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const groupByDay = useCallback(() => {
    const map = new Map<string, Shift[]>();
    for (const s of shifts) {
      const list = map.get(s.shift_date) ?? [];
      list.push(s);
      map.set(s.shift_date, list);
    }
    return map;
  }, [shifts]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Add shift form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="mb-3 font-bold">Schicht anlegen</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Mitarbeiter</label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            >
              <option value="">— auswählen —</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({roleLabel(s.role)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Datum</label>
            <input
              type="date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Beginn</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Ende</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Pause (Minuten)</label>
            <input
              type="number"
              value={breakMin}
              onChange={(e) => setBreakMin(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => void addShift()}
            disabled={busy}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? "…" : "Schicht anlegen"}
          </button>
          {warnings.length > 0 ? (
            <div className="rounded-lg border border-amber-700/60 bg-amber-950/30 p-3 text-xs text-amber-300">
              {warnings.map((w, i) => (
                <p key={i}>⚠ {w}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Week view */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 lg:col-span-2">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-3">
          <button
            onClick={() => setWeekStartDate(addDays(weekStartDate, -7))}
            className="rounded-lg border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800"
          >
            ← Vorwoche
          </button>
          <h3 className="font-bold">
            Woche {fmtDate(isoDate(weekStartDate))} – {fmtDate(isoDate(weekEndDate))}
          </h3>
          <button
            onClick={() => setWeekStartDate(addDays(weekStartDate, 7))}
            className="rounded-lg border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800"
          >
            Nächste →
          </button>
        </div>

        {Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i)).map((day) => {
          const key = isoDate(day);
          const list = groupByDay().get(key) ?? [];
          return (
            <div key={key} className="border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 last:border-0">
              <p className="mb-2 text-xs font-bold text-zinc-400">
                {fmtDate(key)}
              </p>
              {list.length === 0 ? (
                <p className="text-sm text-zinc-600">Keine Schichten.</p>
              ) : (
                list.map((s) => (
                  <div
                    key={s.id}
                    className="mb-1.5 flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 text-sm"
                  >
                    <span>
                      <span className="font-semibold">{s.staff_name ?? `#${s.staff_id}`}</span>
                      <span className="text-zinc-500">
                        {" "}
                        · {s.start_time}–{s.end_time}
                        {s.break_minutes ? ` (${s.break_minutes}′ Pause)` : ""} · {roleLabel(s.role)}
                      </span>
                    </span>
                    <span className="flex items-center gap-3 text-xs">
                      <span className="text-zinc-400">
                        {s.duration_hours ?? "?"}h · {formatEur(s.labor_cost)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-bold ${
                          s.status === "published"
                            ? "bg-emerald-900/60 text-emerald-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {s.status === "published" ? "veröffentlicht" : "Entwurf"}
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>
          );
        })}

        <div className="bg-zinc-900/60 px-4 py-3">
          <button
            onClick={() => void publish()}
            disabled={busy}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
          >
            Schichten veröffentlichen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Urlaub / Freizeit ───────────────────────────

function TimeOffSection(props: {
  busy: boolean;
  setBusy: (b: boolean) => void;
  pushToast: (m: string, k?: Toast["kind"]) => void;
}) {
  const { busy, setBusy, pushToast } = props;
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/admin/api/personal/time-off");
      if (r.ok) {
        const j = await r.json();
        setRequests(j.requests ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const to = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(to);
  }, [load]);

  const decide = async (id: number, action: "approve" | "deny") => {
    setBusy(true);
    try {
      const r = await fetch(`/admin/api/personal/time-off/${id}/${action}`, { method: "POST" });
      if (r.ok) {
        pushToast(action === "approve" ? "Antrag genehmigt" : "Antrag abgelehnt");
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

  const typeLabel: Record<string, string> = {
    vacation: "Urlaub",
    sick: "Krankheit",
    day_off: "Freizeitausgleich",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <h3 className="border-b border-zinc-800 bg-zinc-900/60 px-4 py-3 font-bold">
        Anträge ({requests.length})
      </h3>
      {requests.map((r) => (
        <div
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm last:border-0"
        >
          <div>
            <p className="font-semibold">
              {r.staff_name ?? `#${r.staff_id}`} · {typeLabel[r.request_type ?? ""] ?? r.request_type ?? "Antrag"}
            </p>
            <p className="text-xs text-zinc-500">
              {fmtDate(r.start_date)} bis {fmtDate(r.end_date)}
              {r.reason ? ` — ${r.reason}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {r.status === "pending" ? (
              <>
                <button
                  onClick={() => void decide(r.id, "approve")}
                  disabled={busy}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Genehmigen
                </button>
                <button
                  onClick={() => void decide(r.id, "deny")}
                  disabled={busy}
                  className="rounded-lg border border-red-800/60 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 disabled:opacity-50"
                >
                  Ablehnen
                </button>
              </>
            ) : (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  r.status === "approved"
                    ? "bg-emerald-900/60 text-emerald-300"
                    : r.status === "denied"
                      ? "bg-red-900/50 text-red-300"
                      : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {r.status === "approved" ? "genehmigt" : r.status === "denied" ? "abgelehnt" : r.status}
              </span>
            )}
          </div>
        </div>
      ))}
      {requests.length === 0 ? (
        <p className="px-4 py-6 text-sm text-zinc-500">Keine Urlaubsanträge.</p>
      ) : null}
    </div>
  );
}