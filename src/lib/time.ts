// Berlin-time helper — ported from legacy get_berlin_now() (main.py).
// Manual CET/CEST switch computation, identical to the FastAPI implementation.

export const DAYS_NAMES = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
] as const;

export const DAYS_ABBR = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

export function getBerlinNow(): Date {
  const utcNow = new Date();
  const year = utcNow.getUTCFullYear();

  // Last Sunday of March at 01:00 UTC → CEST starts.
  // getUTCDay(): 0=Sonntag … 6=Samstag → Rückwärts bis Sonntag = getUTCDay() Tage.
  const march31 = new Date(Date.UTC(year, 2, 31, 1, 0, 0));
  const cestStart = new Date(march31.getTime() - march31.getUTCDay() * 86400000);
  // Last Sunday of October at 01:00 UTC → CEST ends
  const october31 = new Date(Date.UTC(year, 9, 31, 1, 0, 0));
  const cestEnd = new Date(october31.getTime() - october31.getUTCDay() * 86400000);

  const isCest = utcNow >= cestStart && utcNow < cestEnd;
  const offsetHours = isCest ? 2 : 1;
  return new Date(utcNow.getTime() + offsetHours * 3600 * 1000);
}

/** "HH:MM" in Berlin time */
export function berlinTimeStr(date: Date = getBerlinNow()): string {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes()
  ).padStart(2, "0")}`;
}

/** "HH:MM:SS" in Berlin time — legacy service_calls timestamp format */
export function berlinClockStr(date: Date = getBerlinNow()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(date.getUTCHours())}:${p(date.getUTCMinutes())}:${p(
    date.getUTCSeconds()
  )}`;
}

/** 0=Montag … 6=Sonntag (JS getUTCDay(): 0=Sunday → shift) */
export function berlinWeekdayIndex(date: Date = getBerlinNow()): number {
  return (date.getUTCDay() + 6) % 7;
}

/** Possible day names for "today" — legacy stores both abbreviations and full names */
export function possibleDaysToday(date: Date = getBerlinNow()): string[] {
  const idx = berlinWeekdayIndex(date);
  return [DAYS_ABBR[idx], DAYS_NAMES[idx]];
}

/** "2026-08-18 14:05:33" — legacy timestamp format used in orders/audit_log */
export function berlinTimestamp(date: Date = getBerlinNow()): string {
  const d = date;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(
    d.getUTCDate()
  )} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

/** "2026-08-18" — legacy bon_date format */
export function berlinDateStr(date: Date = getBerlinNow()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(
    date.getUTCDate()
  )}`;
}
