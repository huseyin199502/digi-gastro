// digi-gastro Play World — Colyseus Raum: 3D-Kart-Relay (Ghost-Karts).
// Die Clients sind autoritativ für ihre eigene Position; der Server verteilt sie.
import { Room, type Client } from "colyseus";
import { Schema, MapSchema, defineTypes } from "@colyseus/schema";

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
});

class Kart3dState extends Schema {
  players = new MapSchema<NetKart>();
}
defineTypes(Kart3dState, { players: { map: NetKart } });

export class Kart3dRoom extends Room<{ state: Kart3dState }> {
  maxClients = 12;

  onCreate() {
    this.setState(new Kart3dState());
    this.onMessage("pos", (client: Client, msg: Record<string, unknown>) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      if (typeof msg.x === "number") p.x = msg.x;
      if (typeof msg.y === "number") p.y = msg.y;
      if (typeof msg.z === "number") p.z = msg.z;
      if (typeof msg.angleY === "number") p.angleY = msg.angleY;
      if (typeof msg.lap === "number") p.lap = msg.lap;
      if (typeof msg.finished === "boolean") p.finished = msg.finished;
      if (typeof msg.time === "number") p.time = msg.time;
    });
    // Item-Nutzung an alle anderen weiterleiten (für Treffer bei Mitspielern).
    this.onMessage("use", (client: Client, msg: unknown) => {
      this.broadcast("use", msg, { except: client });
    });
    // Pause/aufräumen nach Inaktivität nicht nötig; Client verlässt beim Schließen.
  }

  onJoin(client: Client, options: { name?: string; color?: string }) {
    const p = new NetKart();
    p.id = client.sessionId;
    p.name = String(options?.name ?? "Gast").slice(0, 20);
    p.color = String(options?.color ?? "#f43f5e");
    this.state.players.set(client.sessionId, p);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}
