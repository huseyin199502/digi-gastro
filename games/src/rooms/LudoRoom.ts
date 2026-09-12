// digi-gastro Play World — Colyseus Raum: Ludo (Mensch ärgere dich nicht).
// Host-autoritativ: Der Host (erster Client) simuliert das Spiel inkl. Bots und
// verteilt den Zustand. Gäste senden nur Intents (roll/select) an den Host.
import { Room, type Client } from "colyseus";
import { Schema, defineTypes } from "@colyseus/schema";

class LudoState extends Schema {
  hostId = "";
  started = false;
  players = 0;
}
defineTypes(LudoState, {
  hostId: "string",
  started: "boolean",
  players: "number",
});

interface StartConfig {
  playerCount: number;
  aiPlayers: string[];
  names: string[];
}

export class LudoRoom extends Room<{ state: LudoState }> {
  maxClients = 4;
  private startConfig: StartConfig | null = null;
  private names = new Map<string, string>();

  onCreate() {
    this.setState(new LudoState());

    // Host verteilt den Spielzustand an alle anderen.
    this.onMessage("state", (client: Client, msg: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      this.broadcast("state", msg, { except: client });
    });

    // Gäste schicken Intents; der Server leitet sie nur an den Host weiter.
    this.onMessage("intent", (client: Client, msg: unknown) => {
      if (client.sessionId === this.state.hostId) return;
      const host = this.clients.find((c) => c.sessionId === this.state.hostId);
      if (host) host.send("intent", { ...(msg as Record<string, unknown>), from: client.sessionId });
    });

    // Host startet das Spiel und teilt die Konfiguration.
    this.onMessage("start", (client: Client, msg: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      this.startConfig = msg as StartConfig;
      this.state.started = true;
      this.broadcast("start", msg, { except: client });
    });

    // Gäste können eine neue Runde anfragen; der Host startet sie.
    this.onMessage("restart", (client: Client) => {
      if (client.sessionId === this.state.hostId) return;
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
