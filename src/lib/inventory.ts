import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════════════════
// Hilfsfunktionen für Personal-Planung & Lagerverwaltung
// Port aus modules_personal_inventory.py (Helper _parse_date/_parse_time/
// _shift_to_dict/_validate_arbzg)
// ═══════════════════════════════════════════════════════════════════════

/** Legacy _parse_date: "YYYY-MM-DD" → Date (UTC Mitternacht), Fallback heute. */
export function parseDateStr(s: unknown): Date {
  const str = String(s ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(`${str}T00:00:00.000Z`);
  }
  const now = new Date();
  return new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

/** Legacy _parse_time: "HH:MM" → Date (1970-01-01, UTC), Fallback 00:00. */
export function parseTimeStr(s: unknown): Date {
  const str = String(s ?? "").trim();
  if (/^\d{2}:\d{2}$/.test(str)) {
    return new Date(`1970-01-01T${str}:00.000Z`);
  }
  return new Date("1970-01-01T00:00:00.000Z");
}

export function formatTime(d: Date | null): string | null {
  if (!d) return null;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

export interface ShiftDict {
  id: number;
  staff_id: number;
  staff_name: string | null;
  role: string;
  shift_date: string | null;
  start_time: string | null;
  end_time: string | null;
  break_minutes: number;
  hourly_rate: number;
  status: string | null;
  position_label: string | null;
  notes: string | null;
  duration_hours?: number;
  labor_cost?: number;
}

// Legacy _shift_to_dict (inkl. Overnight-Duration)
export function shiftToDict(
  shift: {
    id: number;
    staff_id: number;
    role: string;
    shift_date: Date | null;
    start_time: Date | null;
    end_time: Date | null;
    break_minutes: number | null;
    hourly_rate: unknown;
    status: string | null;
    position_label: string | null;
    notes: string | null;
  },
  staffName: string | null = null
): ShiftDict {
  const d: ShiftDict = {
    id: shift.id,
    staff_id: shift.staff_id,
    staff_name: staffName,
    role: shift.role,
    shift_date: formatDate(shift.shift_date),
    start_time: formatTime(shift.start_time),
    end_time: formatTime(shift.end_time),
    break_minutes: shift.break_minutes ?? 0,
    hourly_rate: Number(shift.hourly_rate ?? 0),
    status: shift.status,
    position_label: shift.position_label,
    notes: shift.notes,
  };
  if (shift.start_time && shift.end_time) {
    let totalMinutes =
      (shift.end_time.getTime() - shift.start_time.getTime()) / 60000;
    if (totalMinutes <= 0) totalMinutes += 24 * 60; // overnight
    const workedMinutes = totalMinutes - (shift.break_minutes ?? 0);
    d.duration_hours = Math.round((workedMinutes / 60) * 100) / 100;
    d.labor_cost =
      Math.round((workedMinutes / 60) * Number(shift.hourly_rate ?? 0) * 100) /
      100;
  }
  return d;
}

function shiftMinutes(start: Date, end: Date): { startMin: number; endMin: number } {
  const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
  let endMin = end.getUTCHours() * 60 + end.getUTCMinutes();
  if (endMin <= startMin) endMin += 24 * 60; // overnight
  return { startMin, endMin };
}

// Legacy _validate_arbzg: ArbZG-Compliance-Prüfung, gibt Warnungen zurück.
export async function validateArbzg(
  tenantSlug: string,
  staffId: number,
  shiftDate: Date,
  startTime: Date,
  endTime: Date,
  breakMin: number,
  excludeShiftId: number | null = null
): Promise<string[]> {
  const warnings: string[] = [];
  try {
    const { startMin, endMin } = shiftMinutes(startTime, endTime);
    const shiftDuration = (endMin - startMin) / 60 - breakMin / 60;

    // 1. Tagesarbeitszeit (§3): max 10h
    if (shiftDuration > 10) {
      warnings.push(
        `⚠ §3 ArbZG: Schicht dauert ${shiftDuration.toFixed(1)}h (max 10h/Tag erlaubt)`
      );
    } else if (shiftDuration > 8) {
      warnings.push(
        `⚠ §3 ArbZG: Schicht dauert ${shiftDuration.toFixed(1)}h (über 8h, nur ausnahmsweise erlaubt)`
      );
    }

    // 2. Ruhezeit (§5): 11h zwischen Schichten + Überlappungsprüfung
    const prevDay = new Date(shiftDate.getTime() - 24 * 3600 * 1000);
    const others = await prisma.shift.findMany({
      where: {
        tenant_slug: tenantSlug,
        staff_id: staffId,
        shift_date: { in: [prevDay, shiftDate] },
        status: { not: "cancelled" },
        ...(excludeShiftId != null ? { id: { not: excludeShiftId } } : {}),
      },
    });
    for (const other of others) {
      if (!other.start_time || !other.end_time || !other.shift_date) continue;
      const o = shiftMinutes(other.start_time, other.end_time);
      const isPrevDay =
        other.shift_date.toISOString().slice(0, 10) ===
        prevDay.toISOString().slice(0, 10);
      const isSameDay =
        other.shift_date.toISOString().slice(0, 10) ===
        shiftDate.toISOString().slice(0, 10);

      if (isPrevDay) {
        // Gap zwischen Ende der Vortags-Schicht und Beginn dieser Schicht
        const gap = (startMin + 24 * 60 - o.endMin) / 60;
        if (gap > 0 && gap < 11) {
          warnings.push(
            `⚠ §5 ArbZG: Nur ${gap.toFixed(1)}h Ruhe seit letzter Schicht (min 11h erforderlich)`
          );
        }
      }
      if (isSameDay) {
        // Überlappung prüfen
        if (!(endMin <= o.startMin || startMin >= o.endMin)) {
          warnings.push("⚠ Überlappung mit bestehender Schicht am selben Tag");
        }
      }
    }

    // 3. Pausen (§4): >6h = 30min, >9h = 45min
    const totalDuration = (endMin - startMin) / 60;
    if (totalDuration > 9 && breakMin < 45) {
      warnings.push(
        `⚠ §4 ArbZG: Bei ${totalDuration.toFixed(1)}h Arbeitszeit sind 45min Pause erforderlich (aktuell ${breakMin}min)`
      );
    } else if (totalDuration > 6 && breakMin < 30) {
      warnings.push(
        `⚠ §4 ArbZG: Bei ${totalDuration.toFixed(1)}h Arbeitszeit sind 30min Pause erforderlich (aktuell ${breakMin}min)`
      );
    }
  } catch (e) {
    console.log(`[ArbZG] Validation error: ${e}`);
  }
  return warnings;
}
