// digi-gastro Play World — Colyseus Raum: Quiz Show.
// Host-autoritativ: Der Host (erster Client) stellt die Fragen, wertet Antworten
// und verteilt den Zustand. Gäste senden nur Antwort-Intents.
import { Room, type Client } from "colyseus";
import { Schema, defineTypes } from "@colyseus/schema";

class QuizState extends Schema {
  hostId = "";
  started = false;
  players = 0;
}
defineTypes(QuizState, {
  hostId: "string",
  started: "boolean",
  players: "number",
});

interface StartConfig {
  ids: string[];
  names: string[];
}

export class QuizRoom extends Room<{ state: QuizState }> {
  maxClients = 8;
  private startConfig: StartConfig | null = null;
  private names = new Map<string, string>();

  onCreate() {
    this.setState(new QuizState());

    this.onMessage("state", (client: Client, msg: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      this.broadcast("state", msg, { except: client });
    });

    // Personalisierter Zustand (z. B. Lügen-Dice: nur eigene Würfel sichtbar).
    this.onMessage("stateFor", (client: Client, msg: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      const m = msg as { to?: string; state?: unknown };
      const target = this.clients.find((c) => c.sessionId === m?.to);
      if (target) target.send("state", m?.state);
    });

    this.onMessage("intent", (client: Client, msg: unknown) => {
      if (client.sessionId === this.state.hostId) return;
      const host = this.clients.find((c) => c.sessionId === this.state.hostId);
      if (host) host.send("intent", { ...(msg as Record<string, unknown>), from: client.sessionId });
    });

    this.onMessage("start", (client: Client, msg: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      this.startConfig = msg as StartConfig;
      this.state.started = true;
      this.broadcast("start", msg, { except: client });
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
      if (this.startConfig) client.send("start", this.startConfig);
    });
  }

  onJoin(client: Client, options: { name?: string }) {
    if (!this.state.hostId) this.state.hostId = client.sessionId;
    this.names.set(client.sessionId, String(options?.name ?? "Gast").slice(0, 20));
    this.state.players = this.clients.length;
    client.send("role", {
      isHost: client.sessionId === this.state.hostId,
      hostId: this.state.hostId,
    });
    if (this.startConfig) client.send("start", this.startConfig);
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

  private broadcastRoster() {
    this.broadcast("roster", {
      ids: this.clients.map((c) => c.sessionId),
      names: this.clients.map((c) => this.names.get(c.sessionId) ?? "Gast"),
    });
  }
}
