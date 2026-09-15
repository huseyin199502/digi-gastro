// digi-gastro Play World — Colyseus Raum: Quiz Show (und 3D-Brettspiele).
// Host-autoritativ: Der Host (erster Client) stellt die Fragen, wertet Antworten
// und verteilt den Zustand. Gäste senden nur Antwort-Intents.
//
// Der Server ist Autorität für Lobby und Start: Der Host startet, der Server
// führt einen sichtbaren Countdown aus und startet dann ALLE gleichzeitig.
import { Room, type Client } from "colyseus";
import { Schema, defineTypes } from "@colyseus/schema";
import { acquireRoomCode, releaseRoomCode } from "../lib/roomCode";
import { PRE_START_COUNTDOWN_MS, safeString, type LobbyPhase } from "../lib/lobby";

class SharedLobbyState extends Schema {
  hostId = "";
  started = false;
  players = 0;
  phase: LobbyPhase = "lobby";
  countdownEndsAt = 0;
  code = "";
}
defineTypes(SharedLobbyState, {
  hostId: "string",
  started: "boolean",
  players: "number",
  phase: "string",
  countdownEndsAt: "number",
  code: "string",
});

interface StartConfig {
  ids: string[];
  names: string[];
  order?: number[];
}

export class QuizRoom extends Room<{ state: SharedLobbyState }> {
  maxClients = 8;
  private startConfig: StartConfig | null = null;
  private names = new Map<string, string>();

  onCreate(options: { mode?: string } = {}) {
    this.setState(new SharedLobbyState());
    try {
      this.roomId = acquireRoomCode();
    } catch {
      /* Fallback auf Colyseus-ID. */
    }
    this.state.code = this.roomId;
    // Per Code erstellte Räume sind privat (kein Auffüllen durch `public`).
    if (options?.mode === "create") void this.setPrivate(true);

    this.onMessage("state", (client: Client, msg: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      if (this.state.phase === "lobby") return;
      this.broadcast("state", msg, { except: client });
    });

    // Personalisierter Zustand (z. B. Lügen-Dice: nur eigene Würfel sichtbar).
    this.onMessage("stateFor", (client: Client, msg: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      if (this.state.phase === "lobby") return;
      const m = msg as { to?: string; state?: unknown };
      const target = this.clients.find((c) => c.sessionId === m?.to);
      if (target) target.send("state", m?.state);
    });

    this.onMessage("intent", (client: Client, msg: unknown) => {
      if (client.sessionId === this.state.hostId) return;
      if (this.state.phase === "lobby") return;
      const host = this.clients.find((c) => c.sessionId === this.state.hostId);
      if (host) host.send("intent", { ...(msg as Record<string, unknown>), from: client.sessionId });
    });

    this.onMessage("start", (client: Client, msg: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      if (this.state.phase !== "lobby") return;
      this.startConfig = this.normalizeConfig(msg);
      this.state.phase = "countdown";
      this.state.countdownEndsAt = Date.now() + PRE_START_COUNTDOWN_MS;
      this.clock.setTimeout(() => {
        if (this.state.phase !== "countdown") return;
        this.state.started = true;
        this.state.phase = "playing";
        this.state.countdownEndsAt = 0;
        // Start an ALLE – auch an den Host (kein lokaler Start mehr).
        this.broadcast("start", this.startConfig);
      }, PRE_START_COUNTDOWN_MS);
    });

    // Handshake nach Join: garantiert Rolle/Roster/Start.
    this.onMessage("hello", (client: Client) => {
      client.send("role", {
        isHost: client.sessionId === this.state.hostId,
        hostId: this.state.hostId,
      });
      client.send("roster", {
        ids: this.clients.map((c) => c.sessionId),
        names: this.clients.map((c) => this.names.get(c.sessionId) ?? "Gast"),
      });
      if (this.startConfig && this.state.phase === "playing") {
        client.send("start", this.startConfig);
      }
    });
  }

  private normalizeConfig(msg: unknown): StartConfig {
    const m = (msg ?? {}) as { ids?: unknown; names?: unknown; order?: unknown };
    const ids = Array.isArray(m.ids)
      ? (m.ids as unknown[]).map((v) => safeString(v, "", 64)).filter(Boolean).slice(0, this.maxClients)
      : [];
    const names = Array.isArray(m.names)
      ? (m.names as unknown[]).map((v) => safeString(v, "Gast", 24)).slice(0, this.maxClients)
      : [];
    const order = Array.isArray(m.order)
      ? (m.order as unknown[]).map((v) => Math.floor(Number(v))).filter((n) => Number.isFinite(n)).slice(0, 16)
      : undefined;
    return { ids, names, order };
  }

  onJoin(client: Client, options: { name?: string }) {
    // Kein Beitritt mitten im Spiel (Lobby-Bindung) – Chaos vermeiden.
    if (this.state.phase !== "lobby") {
      client.send("lobby:closed", { reason: "Das Spiel läuft bereits." });
      try {
        client.leave(4000);
      } catch {
        /* ignore */
      }
      return;
    }
    if (!this.state.hostId) this.state.hostId = client.sessionId;
    this.names.set(client.sessionId, safeString(options?.name, "Gast", 20));
    this.state.players = this.clients.length;
    client.send("role", {
      isHost: client.sessionId === this.state.hostId,
      hostId: this.state.hostId,
    });
    this.broadcastRoster();
  }

  onLeave(client: Client) {
    this.names.delete(client.sessionId);
    const remaining = this.clients.filter((c) => c.sessionId !== client.sessionId);
    if (client.sessionId === this.state.hostId) {
      const next = remaining[0];
      this.state.hostId = next?.sessionId ?? "";
      if (next) next.send("role", { isHost: true, hostId: this.state.hostId });
    }
    this.state.players = remaining.length;
    this.broadcastRoster();
  }

  onDispose() {
    releaseRoomCode(this.state.code);
  }

  private broadcastRoster() {
    this.broadcast("roster", {
      ids: this.clients.map((c) => c.sessionId),
      names: this.clients.map((c) => this.names.get(c.sessionId) ?? "Gast"),
    });
  }
}
