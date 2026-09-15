// digi-gastro Play World — Colyseus Raum: 3D-Kart (Ghost-Karts + Lobby).
//
// Autoritätsmodell: Die Clients bleiben für ihre EIGENE Position zuständig
// (Arcade-Racer, kein Server-Rewind). Der Server ist aber die Autorität für
// Lobby, Start, Runden-Fortschritt, Zielreihenfolge und Nachrichten-Rate:
//   - `finished`/`place` werden serverseitig vergeben (Ziel-Reihenfolge),
//   - `lap` muss plausibel und monoton steigen,
//   - `pos` wird gedrosselt und nur während `playing` akzeptiert,
//   - Item-Nutzung (`use`) wird auf bekannte Items begrenzt und gedrosselt,
//   - Beitritt ist nur in der Lobby möglich (kein Join mitten im Rennen).
//
// Kurze Raum-Codes entstehen durch das Überschreiben von `this.roomId` in
// `onCreate()` (siehe lib/roomCode.ts).
import { Room, type Client } from "colyseus";
import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
import { acquireRoomCode, releaseRoomCode } from "../lib/roomCode";
import {
  PRE_START_COUNTDOWN_MS,
  RateLimiter,
  clamp,
  safeString,
  type LobbyPhase,
} from "../lib/lobby";

const MAX_LAPS = 20;
const DEFAULT_LAPS = 3;
const MAX_RACE_TIME_MS = 3 * 60 * 60 * 1000;

// Bekannte, schädliche Items (Client sendet nur diese).
const HARMFUL_ITEMS = new Set([
  "greenShell",
  "redShell",
  "blueShell",
  "banana",
  "fakeBox",
  "bomb",
  "lightning",
]);

class NetKart extends Schema {
  id = "";
  name = "";
  color = "#f43f5e";
  x = 0;
  y = 0;
  z = 0;
  angleY = 0;
  lap = 0;
  finished = false;
  time = 0;
  place = 0;
  ready = false;
}
defineTypes(NetKart, {
  id: "string",
  name: "string",
  color: "string",
  x: "number",
  y: "number",
  z: "number",
  angleY: "number",
  lap: "number",
  finished: "boolean",
  time: "number",
  place: "number",
  ready: "boolean",
});

class Kart3dState extends Schema {
  players = new MapSchema<NetKart>();
  hostId = "";
  phase: LobbyPhase = "lobby";
  countdownEndsAt = 0;
  startedAt = 0;
  code = "";
  trackId = "";
  laps = DEFAULT_LAPS;
}
defineTypes(Kart3dState, {
  players: { map: NetKart },
  hostId: "string",
  phase: "string",
  countdownEndsAt: "number",
  startedAt: "number",
  code: "string",
  trackId: "string",
  laps: "number",
});

interface StartConfig {
  trackId: string;
  characterId: string;
  difficulty: string;
  laps: number;
}

export class Kart3dRoom extends Room<{ state: Kart3dState }> {
  maxClients = 12;

  private finishedCount = 0;
  private readonly posLimiter = new RateLimiter(24);
  private readonly useLimiter = new RateLimiter(300);
  // Server-seitige Runden-Plausibilität: lap darf nur schrittweise und nicht
  // schneller als eine Mindest-Rundendauer steigen (verhindert Sofort-Finish).
  private readonly lastLap = new Map<string, { lap: number; at: number }>();

  private static readonly MIN_LAP_MS = 6000;

  onCreate(options: { mode?: string } = {}) {
    this.setState(new Kart3dState());
    // Kurzer, eindeutiger Raum-Code (Web-Store-Client zeigt `room.roomId`).
    try {
      this.roomId = acquireRoomCode();
    } catch {
      /* Fallback: Colyseus-generierte ID beibehalten. */
    }
    this.state.code = this.roomId;
    // Per Code erstellte Räume sind privat: öffentliches Matchmaking (`public`)
    // darf sie nicht auffüllen, Beitritt per Code (joinById) bleibt möglich.
    if (options?.mode === "create") void this.setPrivate(true);

    // Host startet das Rennen (nur in der Lobby, nur einmal).
    this.onMessage("start", (client: Client, msg: Record<string, unknown>) => {
      if (client.sessionId !== this.state.hostId) return;
      if (this.state.phase !== "lobby") return;
      const cfg = this.validateConfig(msg);
      this.state.trackId = cfg.trackId;
      this.state.laps = cfg.laps;
      this.state.phase = "countdown";
      this.state.countdownEndsAt = Date.now() + PRE_START_COUNTDOWN_MS;
      // Clients bauen in der Countdown-Zeit die Strecke auf.
      this.broadcast("prepare", cfg);
      this.clock.setTimeout(() => {
        if (this.state.phase !== "countdown") return;
        this.state.phase = "playing";
        this.state.countdownEndsAt = 0;
        this.state.startedAt = Date.now();
        for (const p of this.state.players.values()) p.ready = false;
        this.lastLap.clear();
        this.finishedCount = 0;
        // Synchroner Start für alle (Clients starten ihre 3-2-1-Sequenz bei GO).
        this.broadcast("go", cfg);
      }, PRE_START_COUNTDOWN_MS);
    });

    // „Strecke fertig aufgebaut" → für den synchronen Start.
    this.onMessage("ready", (client: Client) => {
      const p = this.state.players.get(client.sessionId);
      if (p) p.ready = true;
    });

    // Zurück in die Lobby (Rematch) – nur Host, nur nach dem Rennen.
    this.onMessage("rematch", (client: Client) => {
      if (client.sessionId !== this.state.hostId) return;
      if (this.state.phase !== "playing" && this.state.phase !== "finished") return;
      this.resetToLobby();
    });

    // Positionen (gedrosselt, nur während des Rennens, plausibel begrenzt).
    this.onMessage("pos", (client: Client, msg: Record<string, unknown>) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      if (this.state.phase !== "playing") return;
      if (!this.posLimiter.allow(client.sessionId)) return;
      if (typeof msg?.x === "number") p.x = clamp(msg.x, -4000, 4000);
      if (typeof msg?.y === "number") p.y = clamp(msg.y, -200, 400);
      if (typeof msg?.z === "number") p.z = clamp(msg.z, -4000, 4000);
      if (typeof msg?.angleY === "number") p.angleY = clamp(msg.angleY, -100, 100);

      // Fortschritt: monoton, max. eine Runde pro Mindest-Rundendauer.
      if (typeof msg?.lap === "number") {
        const lap = clamp(Math.floor(msg.lap), 0, this.state.laps);
        const now = Date.now();
        const last = this.lastLap.get(client.sessionId);
        if (lap > p.lap) {
          const since = last ? last.at : this.state.startedAt;
          const elapsedOk = since > 0 && now - since >= Kart3dRoom.MIN_LAP_MS;
          if (lap <= p.lap + 1 && elapsedOk) {
            p.lap = lap;
            this.lastLap.set(client.sessionId, { lap, at: now });
          }
        }
      }
      if (p.finished) return;

      // Ziel nur akzeptieren, wenn der Client die Runden wirklich gefahren ist.
      if (msg?.finished === true && p.lap >= this.state.laps) {
        p.finished = true;
        p.time = clamp(msg.time, 0, MAX_RACE_TIME_MS);
        p.place = ++this.finishedCount;
        if (
          [...this.state.players.values()].every((x) => x.finished) &&
          this.state.phase === "playing"
        ) {
          this.state.phase = "finished";
        }
      }
    });

    // Item-Nutzung: nur bekannte Items, gedrosselt, roh weiterleiten.
    this.onMessage("use", (client: Client, msg: Record<string, unknown>) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      if (this.state.phase !== "playing") return;
      if (!this.useLimiter.allow(client.sessionId)) return;
      const item = typeof msg?.item === "string" ? msg.item : "";
      if (!HARMFUL_ITEMS.has(item)) return;
      const payload = {
        item,
        x: clamp(msg?.x, -4000, 4000),
        z: clamp(msg?.z, -4000, 4000),
        from: client.sessionId,
      };
      this.broadcast("use", payload, { except: client });
    });
  }

  private resetToLobby(): void {
    this.state.phase = "lobby";
    this.state.countdownEndsAt = 0;
    this.state.startedAt = 0;
    this.finishedCount = 0;
    this.lastLap.clear();
    for (const p of this.state.players.values()) {
      p.lap = 0;
      p.finished = false;
      p.time = 0;
      p.place = 0;
      p.ready = false;
    }
  }

  private validateConfig(msg: Record<string, unknown> | undefined): StartConfig {    const m = msg ?? {};
    const rawLaps = Number(m.laps);
    return {
      trackId: safeString(m.trackId, "", 32),
      characterId: safeString(m.characterId, "", 32),
      difficulty: safeString(m.difficulty, "normal", 16),
      laps: Number.isFinite(rawLaps) ? clamp(Math.floor(rawLaps), 1, MAX_LAPS) : DEFAULT_LAPS,
    };
  }

  onJoin(client: Client, options: { name?: string; color?: string }) {
    // Kein Beitritt mitten im Rennen: Lobby-Bindung.
    if (this.state.phase !== "lobby") {
      client.send("lobby:closed", { reason: "Das Rennen läuft bereits." });
      try {
        client.leave(4000);
      } catch {
        /* ignore */
      }
      return;
    }
    const p = new NetKart();
    p.id = client.sessionId;
    p.name = safeString(options?.name, "Gast", 20);
    p.color = safeString(options?.color, "#f43f5e", 16);
    this.state.players.set(client.sessionId, p);
    if (!this.state.hostId) this.state.hostId = client.sessionId;
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    this.posLimiter.forget(client.sessionId);
    this.useLimiter.forget(client.sessionId);
    this.lastLap.delete(client.sessionId);
    // Host migriert auf den nächsten verbliebenen Spieler.
    if (client.sessionId === this.state.hostId) {
      const next = this.state.players.keys().next();
      this.state.hostId = next.done ? "" : next.value;
    }
  }

  onDispose() {
    releaseRoomCode(this.state.code);
  }
}
