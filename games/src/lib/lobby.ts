// digi-gastro Play World — gemeinsame Lobby-/Start-Parameter.
// Einheitliches Protokoll für alle Räume (Kart, Ludo, Quiz, Board):
//
//   state.phase            'lobby' | 'countdown' | 'playing' | 'finished'
//   state.hostId           sessionId des Hosts (erster Client)
//   state.code             kurzer Raum-Code (= room.roomId)
//   state.countdownEndsAt  epoch ms während des Countdowns, sonst 0
//   client -> server       'start' (nur Host) mit optionaler Config
//   server -> client       'go'    wenn der Countdown abgelaufen ist
//   server -> client       'start' mit der Config (Quiz/Ludo/Board)
//
// Hinweis: Ein späterer Join während Countdown/Spiel wird abgelehnt, damit
// Rennen/Partien nicht mitten im Spiel aufgefüllt werden.

export type LobbyPhase = "lobby" | "countdown" | "playing" | "finished";

/** Dauer des vorgeschalteten Countdowns vor dem eigentlichen Spielstart. */
export const PRE_START_COUNTDOWN_MS = 4000;

/** Obergrenze akzeptierter Client-Options-Werte. */
export const MAX_NAME_LENGTH = 20;
export const MAX_OPTION_STRING = 64;

/** Stellt sicher, dass ein Wert eine endliche Zahl ist. */
export function finiteOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Begrenzt eine Zahl auf [min, max]; ungültige Werte werden auf min gesetzt. */
export function clamp(value: unknown, min: number, max: number): number {
  const n = finiteOr(value, min);
  return n < min ? min : n > max ? max : n;
}

/** Kürzt und säubert einen String aus Client-Options. */
export function safeString(value: unknown, fallback: string, max = MAX_OPTION_STRING): string {
  const s = typeof value === "string" ? value.trim() : "";
  return (s.length > 0 ? s : fallback).slice(0, max);
}

/**
 * Einfacher, serverseitiger Token-Bucket pro Client.
 * Verhindert Nachrichten-Fluten (z. B. `pos` mit 1000 Hz).
 */
export class RateLimiter {
  private readonly entries = new Map<string, number>();
  constructor(
    private readonly minIntervalMs: number,
    private readonly bucketSize: number = 8,
  ) {}

  /** true = erlaubt, false = gedrosselt. */
  allow(key: string, now = Date.now()): boolean {
    const last = this.entries.get(key) ?? 0;
    if (now - last < this.minIntervalMs) return false;
    this.entries.set(key, now);
    // Buchhaltung begrenzen, damit die Map nicht unbegrenzt wächst.
    if (this.entries.size > this.bucketSize * 256) {
      this.entries.clear();
    }
    return true;
  }

  forget(key: string): void {
    this.entries.delete(key);
  }
}
