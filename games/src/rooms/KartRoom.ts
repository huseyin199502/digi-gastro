// digi-gastro Play World — Colyseus Raum: Kart-Rennen (server-autoritativ).
import { Room, type Client } from "colyseus";
import { Schema, MapSchema, defineTypes } from "@colyseus/schema";

const W = 600;
const H = 460;
const LAPS = 3;
const MAXSPEED = 210;
const TURN = 3.0;

const TRACK = [
  { x: 120, y: 80 }, { x: 480, y: 80 }, { x: 545, y: 150 }, { x: 545, y: 320 },
  { x: 480, y: 390 }, { x: 120, y: 390 }, { x: 55, y: 320 }, { x: 55, y: 150 },
];

const BOT_COLORS = ["#38bdf8", "#f59e0b", "#34d399"];
const BOT_NAMES = ["Bot Blitz", "Bot Turbo", "Bot Nitro"];

class KartPlayer extends Schema {
  id = "";
  name = "";
  color = "#f43f5e";
  x = 120;
  y = 90;
  angle = 0;
  speed = 0;
  lap = 1;
  next = 1;
  finished = false;
  time = 0;
  bot = false;
  skill = 1;
  // Nicht synchronisiert (nur Server):
  left = false;
  right = false;
}
defineTypes(KartPlayer, {
  id: "string",
  name: "string",
  color: "string",
  x: "number",
  y: "number",
  angle: "number",
  speed: "number",
  lap: "number",
  next: "number",
  finished: "boolean",
  time: "number",
  bot: "boolean",
  skill: "number",
});

class KartState extends Schema {
  players = new MapSchema<KartPlayer>();
  startedAt = 0;
  raceOver = false;
}
defineTypes(KartState, {
  players: { map: KartPlayer },
  startedAt: "number",
  raceOver: "boolean",
});

export class KartRoom extends Room<{ state: KartState }> {
  maxClients = 8;

  onCreate() {
    this.setState(new KartState());
    this.state.startedAt = Date.now();
    this.setSimulationInterval((dt) => this.tick(dt), 1000 / 30);

    this.onMessage("input", (client: Client, msg: { left?: boolean; right?: boolean }) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      p.left = !!msg?.left;
      p.right = !!msg?.right;
    });

    // Nach kurzer Wartezeit Bots auffüllen (damit auch Solo Spaß macht).
    this.clock.setTimeout(() => this.fillBots(4), 1500);
  }

  onJoin(client: Client, options: { name?: string; color?: string }) {
    const p = new KartPlayer();
    p.id = client.sessionId;
    p.name = String(options?.name ?? "Gast").slice(0, 20);
    p.color = String(options?.color ?? "#f43f5e");
    const n = this.state.players.size;
    p.x = 120 + (n % 3) * 12;
    p.y = 90 - Math.floor(n / 3) * 16;
    this.state.players.set(client.sessionId, p);
    if (this.state.startedAt === 0) this.state.startedAt = Date.now();
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  private fillBots(target: number) {
    let i = 0;
    while (this.state.players.size < target) {
      const bot = new KartPlayer();
      bot.id = `bot-${i}`;
      bot.name = BOT_NAMES[i % BOT_NAMES.length];
      bot.color = BOT_COLORS[i % BOT_COLORS.length];
      bot.bot = true;
      bot.skill = 0.97 + (i % 3) * 0.04;
      bot.x = 110 + i * 10;
      bot.y = 70;
      this.state.players.set(bot.id, bot);
      i++;
      if (i > 6) break;
    }
  }

  private step(dt: number, p: KartPlayer) {
    if (p.finished) return;
    if (p.bot) {
      const wp = TRACK[p.next % TRACK.length];
      const want = Math.atan2(wp.y - p.y, wp.x - p.x);
      let diff = ((want - p.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      diff = Math.max(-1, Math.min(1, diff * 2));
      p.angle += diff * TURN * 0.7 * dt;
      p.speed = Math.min(MAXSPEED * p.skill, p.speed + 140 * dt);
    } else {
      const steer = (p.right ? 1 : 0) - (p.left ? 1 : 0);
      p.angle += steer * TURN * dt;
      p.speed = Math.min(MAXSPEED, p.speed + 150 * dt);
    }
    p.x += Math.cos(p.angle) * p.speed * dt;
    p.y += Math.sin(p.angle) * p.speed * dt;
    // Streckenbegrenzung (nicht aus dem Bild fahren)
    if (p.x < 18) { p.x = 18; p.speed *= 0.5; }
    if (p.x > W - 18) { p.x = W - 18; p.speed *= 0.5; }
    if (p.y < 18) { p.y = 18; p.speed *= 0.5; }
    if (p.y > H - 18) { p.y = H - 18; p.speed *= 0.5; }
    const wp = TRACK[p.next];
    const d = Math.hypot(p.x - wp.x, p.y - wp.y);
    if (d < 46) {
      p.next = (p.next + 1) % TRACK.length;
      if (p.next === 1 && p.lap < LAPS + 1) p.lap += 1;
    }
    if (p.lap > LAPS) {
      p.finished = true;
      p.time = Date.now() - this.state.startedAt;
      p.speed = 0;
    }
  }

  private tick(dt: number) {
    const s = Math.min(0.05, dt / 1000);
    for (const p of this.state.players.values()) this.step(s, p);
    if (!this.state.raceOver) {
      const all = [...this.state.players.values()];
      if (all.length > 0 && all.every((p) => p.finished)) this.state.raceOver = true;
    }
  }
}

export { W, H };
