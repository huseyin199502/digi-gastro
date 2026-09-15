// digi-gastro Play World — Colyseus Raum: Ludo (Mensch ärgere dich nicht).
// Host-autoritativ: Der Host (erster Client) simuliert das Spiel inkl. Bots und
// verteilt den Zustand. Gäste senden nur Intents (roll/select) an den Host.
//
// Server-Autorität für Lobby/Start: Host startet, Server-Countdown, dann
// synchroner Start für alle.
import { Room, type Client } from "colyseus";
import { Schema, defineTypes } from "@colyseus/schema";
import { acquireRoomCode, releaseRoomCode } from "../lib/roomCode";
import { PRE_START_COUNTDOWN_MS, safeString, type LobbyPhase } from "../lib/lobby";

class LudoLobbyState extends Schema {
  hostId = "";
  started = false;
  players = 0;
  phase: LobbyPhase = "lobby";
  countdownEndsAt = 0;
  code = "";
}
defineTypes(LudoLobbyState, {
  hostId: "string",
  started: "boolean",
  players: "number",
  phase: "string",
  countdownEndsAt: "number",
  code: "string",
});

interface StartConfig {
  playerCount: number;
  aiPlayers: string[];
  names: string[];
}

export class LudoRoom extends Room<{ state: LudoLobbyState }> {
  maxClients = 4;
  private startConfig: StartConfig | null = null;
  private names = new Map<string, string>();

  onCreate(options: { mode?: string } = {}) {
    this.setState(new LudoLobbyState());
    try {
      this.roomId = acquireRoomCode();
    } catch {
      /* Fallback auf Colyseus-ID. */
    }
    this.state.code = this.roomId;
    // Per Code erstellte Räume sind privat (kein Auffüllen durch `public`).
    if (options?.mode === "create") void this.setPrivate(true);

    // Host verteilt den Spielzustand an alle anderen.
    this.onMessage("state", (client: Client, msg: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      if (this.state.phase === "lobby") return;
      this.broadcast("state", msg, { except: client });
    });

    // Gäste schicken Intents; der Server leitet sie nur an den Host weiter.
    this.onMessage("intent", (client: Client, msg: unknown) => {
      if (client.sessionId === this.state.hostId) return;
      if (this.state.phase === "lobby") return;
      const host = this.clients.find((c) => c.sessionId === this.state.hostId);
      if (host) host.send("intent", { ...(msg as Record<string, unknown>), from: client.sessionId });
    });

    // Host startet das Spiel: Server-Countdown, dann Start an ALLE.
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
        this.broadcast("start", this.startConfig);
      }, PRE_START_COUNTDOWN_MS);
    });

    // Gäste können eine neue Runde anfragen; der Host startet sie.
    this.onMessage("restart", (client: Client) => {
      if (client.sessionId === this.state.hostId) return;
      if (this.state.phase === "lobby") return;
      const host = this.clients.find((c) => c.sessionId === this.state.hostId);
      if (host) host.send("restart", { from: client.sessionId });
    });

    // Nach dem Join fragt der Client aktiv an: garantiert Rolle/Roster/Start
    // (Broadcasts direkt beim Join können sonst vor der Handler-Registrierung eintreffen).
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
    const m = (msg ?? {}) as { playerCount?: unknown; aiPlayers?: unknown; names?: unknown };
    const playerCount = Math.max(2, Math.min(4, Math.floor(Number(m.playerCount)) || 4));
    const aiPlayers = Array.isArray(m.aiPlayers)
      ? (m.aiPlayers as unknown[]).map((v) => safeString(v, "", 24)).filter(Boolean).slice(0, 4)
      : [];
    const names = Array.isArray(m.names)
      ? (m.names as unknown[]).map((v) => safeString(v, "Gast", 20)).slice(0, 4)
      : [];
    return { playerCount, aiPlayers, names };
  }

  onJoin(client: Client, options: { name?: string }) {
    // Kein Beitritt mitten im Spiel (Lobby-Bindung).
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
