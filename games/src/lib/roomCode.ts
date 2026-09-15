// digi-gastro Play World — kurze, eindeutige Raum-Codes.
// Colyseus erlaubt das Überschreiben von `room.roomId` in `onCreate()`
// (siehe @colyseus/core Room.ts: "You may replace this.roomId during onCreate()").
// Dadurch funktionieren create/joinById unverändert, nur die Codes sind kurz.

// Ohne I/O/0/1/L, um Verwechslungen beim Abtippen zu vermeiden.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const DEFAULT_LENGTH = 4;

// Alle im Prozess bereits vergebenen Codes. Der Games-Server läuft als ein
// Prozess/Container (docker-compose: games), daher ist das ausreichend.
const inUse = new Set<string>();

function randomCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/** Reserviert einen kurzen, im Prozess eindeutigen Raum-Code. */
export function acquireRoomCode(length = DEFAULT_LENGTH): string {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const code = randomCode(length);
    if (!inUse.has(code)) {
      inUse.add(code);
      return code;
    }
  }
  // Sehr unwahrscheinlicher Fallback: etwas länger versuchen.
  for (;;) {
    const code = randomCode(length + 2);
    if (!inUse.has(code)) {
      inUse.add(code);
      return code;
    }
  }
}

/** Gibt einen Code wieder frei (bei Raum-Dispose). */
export function releaseRoomCode(code: string): void {
  if (code) inUse.delete(code);
}

/** Prüft, ob ein Code dem erwarteten Format entspricht (Client-Eingabe). */
export function isValidRoomCodeFormat(code: string): boolean {
  if (typeof code !== "string") return false;
  const upper = code.trim().toUpperCase();
  if (upper.length < 3 || upper.length > 8) return false;
  for (const ch of upper) {
    if (!ALPHABET.includes(ch)) return false;
  }
  return true;
}
