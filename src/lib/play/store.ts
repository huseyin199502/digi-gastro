// Play World — Session-Speicher (Postgres via Prisma, lean per Raw-SQL).
// N Spieler (Seats 1..N), Bots, Host-Start. Tabellen werden auto-erstellt.

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_GAME,
  GameId,
  Seat,
  advanceRealtime,
  applyMove,
  botMove,
  gameMeta,
  initData,
  isGameId,
  sanitize,
  scoreFor,
} from "./games";

export interface PlayPlayer {
  id: string;
  name: string;
  seat: Seat;
  table: string | null;
  joinedAt: number;
  isBot?: boolean;
}

export interface PlayState {
  game: GameId;
  players: PlayPlayer[];
  turn: Seat;
  status: "lobby" | "playing" | "finished";
  winner: Seat | "draw" | null;
  data: Record<string, unknown>;
  rematch: string[];
  startedAt: number;
  moves: number;
  score: number | null;
  recordBroken: boolean;
  hostId: string;
}

export interface PlaySession {
  id: string;
  tenant_slug: string;
  game: string;
  room_code: string;
  status: string;
  state: PlayState;
  created_at: string;
  updated_at: string;
}

const BOT_NAMES = ["Bot Max", "Bot Leyla", "Bot Emre", "Bot Nina", "Bot Deniz", "Bot Aylin", "Bot Can"];

let ensured = false;

async function ensureTables(): Promise<void> {
  if (ensured) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS play_sessions (
      id          TEXT PRIMARY KEY,
      tenant_slug VARCHAR(255) NOT NULL,
      game        VARCHAR(40)  NOT NULL,
      room_code   VARCHAR(8)   NOT NULL UNIQUE,
      status      VARCHAR(20)  NOT NULL DEFAULT 'lobby',
      state       JSONB        NOT NULL DEFAULT '{}'::jsonb,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_play_sessions_tenant_code ON play_sessions (tenant_slug, room_code)`,
  );
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS play_highlights (
      id          SERIAL PRIMARY KEY,
      tenant_slug VARCHAR(255) NOT NULL,
      name        VARCHAR(24)  NOT NULL,
      game        VARCHAR(40),
      text        VARCHAR(140),
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_play_highlights_tenant ON play_highlights (tenant_slug, id DESC)`,
  );
  await prisma.$executeRawUnsafe(`ALTER TABLE play_highlights ADD COLUMN IF NOT EXISTS score INT`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS play_records (
      tenant_slug VARCHAR(255) NOT NULL,
      game        VARCHAR(40)  NOT NULL,
      best_score  INT          NOT NULL,
      best_name   VARCHAR(24)  NOT NULL,
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      PRIMARY KEY (tenant_slug, game)
    )`);
  ensured = true;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(len = 4): string {
  let s = "";
  for (let i = 0; i < len; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}
function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
}
function parseState(raw: unknown): PlayState {
  if (typeof raw === "string") return JSON.parse(raw) as PlayState;
  return raw as PlayState;
}
function normalizeName(name: unknown, fallback: string): string {
  const n = String(name ?? "").trim().slice(0, 24);
  return n.length > 0 ? n : fallback;
}
async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = randomCode();
    const rows = (await prisma.$queryRawUnsafe(`SELECT 1 FROM play_sessions WHERE room_code = $1 LIMIT 1`, code)) as unknown[];
    if (rows.length === 0) return code;
  }
  return randomCode(6);
}

export async function createSession(
  slug: string,
  gameRaw: unknown,
  name: unknown,
  table: unknown,
): Promise<{ code: string; playerId: string; seat: Seat; game: GameId; playerCount: number; maxPlayers: number }> {
  await ensureTables();
  const game: GameId = isGameId(gameRaw) ? gameRaw : DEFAULT_GAME;
  const meta = gameMeta(game);
  const id = randomId();
  const code = await uniqueCode();
  const player: PlayPlayer = {
    id,
    name: normalizeName(name, "Gast 1"),
    seat: 1,
    table: table != null ? String(table) : null,
    joinedAt: Date.now(),
  };
  const state: PlayState = {
    game,
    players: [player],
    turn: 1,
    status: "lobby",
    winner: null,
    data: initData(game, 1),
    rematch: [],
    startedAt: 0,
    moves: 0,
    score: null,
    recordBroken: false,
    hostId: id,
  };
  await prisma.$executeRawUnsafe(
    `INSERT INTO play_sessions (id, tenant_slug, game, room_code, status, state)
     VALUES ($1, $2, $3, $4, 'lobby', $5::jsonb)`,
    id, slug, game, code, JSON.stringify(state),
  );
  return { code, playerId: id, seat: 1, game, playerCount: 1, maxPlayers: meta.maxPlayers };
}

export async function joinSession(
  slug: string,
  code: unknown,
  name: unknown,
  table: unknown,
): Promise<{ code: string; playerId: string; seat: Seat; game: GameId; playerCount: number; maxPlayers: number }> {
  await ensureTables();
  const norm = String(code ?? "").toUpperCase().trim();
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT * FROM play_sessions WHERE tenant_slug = $1 AND room_code = $2 LIMIT 1`,
    slug, norm,
  )) as unknown[];
  const row = rows[0] as { id: string; room_code: string; state: unknown } | undefined;
  if (!row) throw new Error("NOT_FOUND");

  const state = parseState(row.state);
  const meta = gameMeta(state.game);
  if (state.status !== "lobby") throw new Error("STARTED");
  if (state.players.length >= meta.maxPlayers) throw new Error("FULL");

  const id = randomId();
  const seat = state.players.length + 1;
  const player: PlayPlayer = {
    id,
    name: normalizeName(name, `Gast ${seat}`),
    seat,
    table: table != null ? String(table) : null,
    joinedAt: Date.now(),
  };
  state.players.push(player);
  state.hostId = state.hostId ?? state.players[0].id;

  await prisma.$executeRawUnsafe(
    `UPDATE play_sessions SET state = $1::jsonb, updated_at = NOW() WHERE id = $2`,
    JSON.stringify(state), row.id,
  );
  return { code: row.room_code, playerId: id, seat, game: state.game, playerCount: state.players.length, maxPlayers: meta.maxPlayers };
}

/** Host fügt einen Bot hinzu (nur in der Lobby). */
export async function addBot(slug: string, code: unknown, requesterId: unknown): Promise<PlayState> {
  const session = await getSession(slug, code);
  if (!session) throw new Error("NOT_FOUND");
  const st = session.state;
  const meta = gameMeta(st.game);
  if (st.status !== "lobby") throw new Error("STARTED");
  if (st.hostId !== requesterId) throw new Error("NOT_HOST");
  if (st.players.length >= meta.maxPlayers) throw new Error("FULL");

  const seat = st.players.length + 1;
  st.players.push({
    id: `bot-${randomId()}`,
    name: BOT_NAMES[(seat - 1) % BOT_NAMES.length],
    seat,
    table: null,
    joinedAt: Date.now(),
    isBot: true,
  });
  session.state = st;
  await save(session);
  return st;
}

/** Host entfernt einen Bot wieder (nur in der Lobby). */
export async function removeBot(slug: string, code: unknown, requesterId: unknown, botId: unknown): Promise<PlayState> {
  const session = await getSession(slug, code);
  if (!session) throw new Error("NOT_FOUND");
  const st = session.state;
  if (st.status !== "lobby") throw new Error("STARTED");
  if (st.hostId !== requesterId) throw new Error("NOT_HOST");
  const bot = st.players.find((p) => p.id === botId && p.isBot);
  if (!bot) throw new Error("NOT_FOUND");
  st.players = st.players.filter((p) => p.id !== botId);
  st.players.forEach((p, i) => { p.seat = (i + 1) as Seat; });
  session.state = st;
  await save(session);
  return st;
}

/** Host startet das Spiel; Bots füllen optional auf die Mindestzahl auf. */
export async function startSession(slug: string, code: unknown, requesterId: unknown): Promise<PlayState> {
  const session = await getSession(slug, code);
  if (!session) throw new Error("NOT_FOUND");
  const st = session.state;
  const meta = gameMeta(st.game);
  if (st.hostId !== requesterId) throw new Error("NOT_HOST");

  const humans = st.players.filter((p) => !p.isBot).length;
  if (humans === 0) throw new Error("NO_PLAYERS");
  // Falls weniger als Minimum: Bots ergänzen (für Solo vs. Bot).
  while (st.players.length < meta.minPlayers) {
    const seat = st.players.length + 1;
    st.players.push({
      id: `bot-${randomId()}`,
      name: BOT_NAMES[(seat - 1) % BOT_NAMES.length],
      seat,
      table: null,
      joinedAt: Date.now(),
      isBot: true,
    });
  }
  if (st.players.length < meta.minPlayers) throw new Error("NOT_ENOUGH");

  st.status = "playing";
  st.turn = 1;
  st.winner = null;
  st.data = initData(st.game, st.players.length);
  st.rematch = [];
  st.startedAt = Date.now();
  st.moves = 0;
  st.score = null;
  st.recordBroken = false;

  session.state = st;
  if (gameMeta(st.game).mode === "realtime") {
    const res = advanceRealtime(st.game, st.data, Date.now(), st.players.length, st.players.filter((p) => p.isBot).map((p) => p.seat));
    st.data = res.data;
    if (res.done !== null) {
      st.status = "finished";
      st.winner = res.done;
      await finishAndRecord(slug, st);
    }
  } else {
    await runBots(session, slug);
  }
  await save(session);
  return session.state;
}

export async function getSession(slug: string, code: unknown): Promise<PlaySession | null> {
  await ensureTables();
  const norm = String(code ?? "").toUpperCase().trim();
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT * FROM play_sessions WHERE tenant_slug = $1 AND room_code = $2 LIMIT 1`,
    slug, norm,
  )) as unknown[];
  const row = rows[0] as (Omit<PlaySession, "state"> & { state: unknown }) | undefined;
  if (!row) return null;
  return { ...row, state: parseState(row.state) };
}

export function toView(state: PlayState, viewerSeat?: number): PlayState {
  return { ...state, data: sanitize(state.game, state.data, viewerSeat) };
}

/** Sicht für einen bestimmten Spieler (verdeckte Infos, z. B. Lügen-Dice). */
export function viewFor(state: PlayState, playerId: unknown): PlayState {
  const seat = state.players.find((p) => p.id === playerId)?.seat;
  return toView(state, seat);
}

async function save(session: PlaySession): Promise<void> {
  await prisma.$executeRawUnsafe(
    `UPDATE play_sessions SET state = $1::jsonb, status = $2, updated_at = NOW() WHERE id = $3`,
    JSON.stringify(session.state), session.state.status, session.id,
  );
}

async function finishAndRecord(slug: string, st: PlayState): Promise<void> {
  if (st.winner === null) {
    st.score = null;
    st.recordBroken = false;
    return;
  }
  const winner = st.winner;
  const elapsed = Math.max(1, Math.round((Date.now() - (st.startedAt || Date.now())) / 1000));
  const score = scoreFor(st.game, st.data, winner, elapsed);
  st.score = score;
  st.recordBroken = false;
  if (score != null && winner !== "draw") {
    const winnerName = st.players.find((p) => p.seat === winner)?.name ?? "Gast";
    const rec = await getRecord(slug, st.game);
    if (!rec || score > rec.best_score) {
      await saveRecord(slug, st.game, score, winnerName);
      await insertHighlight(slug, winnerName, st.game, `Neuer Rekord: ${score} Punkte`, score);
      st.recordBroken = true;
    }
  }
}

/** Lässt Bots spielen, bis ein Mensch dran ist oder das Spiel endet. */
async function runBots(session: PlaySession, slug: string): Promise<void> {
  let guard = 0;
  while (session.state.status === "playing" && guard++ < 300) {
    const st = session.state;
    const playerCount = st.players.length;
    const current = st.players.find((p) => p.seat === st.turn);
    if (!current || !current.isBot) break;
    const opps = st.players.filter((p) => p.seat !== current.seat).map((p) => p.seat);
    const move = botMove(st.game, st.data, current.seat, playerCount, opps);
    if (!move) break;
    const res = applyMove(st.game, st.data, move, current.seat, playerCount);
    st.data = res.data;
    st.moves += 1;
    if (res.done !== null) {
      st.status = "finished";
      st.winner = res.done;
      await finishAndRecord(slug, st);
    } else if (!res.keepTurn) {
      st.turn = res.nextSeat ?? ((current.seat % playerCount) + 1);
    }
  }
}

export async function makeMove(slug: string, code: unknown, playerId: unknown, move: unknown): Promise<PlayState> {
  const session = await getSession(slug, code);
  if (!session) throw new Error("NOT_FOUND");
  const st = session.state;
  if (st.status !== "playing") throw new Error("NOT_PLAYING");

  const player = st.players.find((p) => p.id === playerId);
  if (!player || player.isBot) throw new Error("NOT_PLAYER");
  const mode = gameMeta(st.game).mode;
  if (mode === "turn" && player.seat !== st.turn) throw new Error("NOT_TURN");

  const playerCount = st.players.length;
  const res = applyMove(st.game, st.data, move, player.seat, playerCount);
  st.data = res.data;
  st.moves += 1;
  if (res.done !== null) {
    st.status = "finished";
    st.winner = res.done;
    await finishAndRecord(slug, st);
  } else if (mode === "turn" && !res.keepTurn) {
    st.turn = res.nextSeat ?? ((player.seat % playerCount) + 1);
  }

  // Bots sind (im rundenbasierten Modus) ggf. als Nächstes dran.
  if (mode === "turn" && st.status === "playing") await runBots(session, slug);

  session.state = st;
  await save(session);
  return session.state;
}

/** Realtime-Tick beim Abrufen (plant Runde, beendet sie, Bots tippen). */
export async function advanceSession(slug: string, code: unknown): Promise<PlaySession | null> {
  const session = await getSession(slug, code);
  if (!session) return null;
  const st = session.state;
  if (st.status === "playing" && gameMeta(st.game).mode === "realtime") {
    const res = advanceRealtime(st.game, st.data, Date.now(), st.players.length, st.players.filter((p) => p.isBot).map((p) => p.seat));
    if (res.changed) {
      st.data = res.data;
      if (res.done !== null) {
        st.status = "finished";
        st.winner = res.done;
        await finishAndRecord(slug, st);
      }
      session.state = st;
      await save(session);
    }
  }
  return session;
}

export async function requestRematch(slug: string, code: unknown, playerId: unknown): Promise<PlayState> {
  const session = await getSession(slug, code);
  if (!session) throw new Error("NOT_FOUND");
  const st = session.state;
  const player = st.players.find((p) => p.id === playerId);
  if (!player) throw new Error("NOT_PLAYER");
  if (!st.rematch.includes(String(playerId))) st.rematch.push(String(playerId));

  const humans = st.players.filter((p) => !p.isBot);
  if (st.rematch.length >= humans.length) {
    st.data = initData(st.game, st.players.length);
    st.status = "playing";
    st.turn = 1;
    st.winner = null;
    st.rematch = [];
    st.startedAt = Date.now();
    st.moves = 0;
    st.score = null;
    st.recordBroken = false;
    await runBots(session, slug);
  }
  session.state = st;
  await save(session);
  return session.state;
}

export async function leaveSession(slug: string, code: unknown, playerId: unknown): Promise<void> {
  const session = await getSession(slug, code);
  if (!session) return;
  const st = session.state;
  st.players = st.players.filter((p) => p.id !== playerId);
  st.players.forEach((p, i) => { p.seat = (i + 1) as Seat; });
  if (!st.players.some((p) => !p.isBot) || st.players.length === 0) {
    // Raum ist effektiv leer → löschen
    await prisma.$executeRawUnsafe(`DELETE FROM play_sessions WHERE id = $1`, session.id);
    return;
  }
  if (!st.players.some((p) => p.id === st.hostId)) {
    st.hostId = st.players.find((p) => !p.isBot)?.id ?? st.players[0].id;
  }
  st.status = "lobby";
  st.turn = 1;
  st.winner = null;
  st.data = initData(st.game, st.players.length);
  st.rematch = [];
  st.startedAt = 0;
  st.moves = 0;
  st.score = null;
  st.recordBroken = false;
  session.state = st;
  await save(session);
}

// ───────────────────────────── Highlights & Rekorde ─────────────────────────────
export interface Highlight {
  id: number;
  name: string;
  game: string | null;
  text: string | null;
  score: number | null;
  created_at: string;
}

export interface PlayRecord {
  game: string;
  best_score: number;
  best_name: string;
  updated_at: string;
}

export async function listHighlights(slug: string, limit = 30): Promise<Highlight[]> {
  await ensureTables();
  return (await prisma.$queryRawUnsafe(
    `SELECT id, name, game, text, score, created_at FROM play_highlights
      WHERE tenant_slug = $1 ORDER BY id DESC LIMIT $2`,
    slug, Math.min(Math.max(limit, 1), 100),
  )) as Highlight[];
}

export async function insertHighlight(slug: string, name: string, game: GameId, text: string, score: number): Promise<void> {
  await ensureTables();
  await prisma.$executeRawUnsafe(
    `INSERT INTO play_highlights (tenant_slug, name, game, text, score) VALUES ($1, $2, $3, $4, $5)`,
    slug, normalizeName(name, "Gast"), game, String(text).trim().slice(0, 140) || null, score,
  );
}

export async function getRecord(slug: string, game: GameId): Promise<PlayRecord | null> {
  await ensureTables();
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT game, best_score, best_name, updated_at FROM play_records WHERE tenant_slug = $1 AND game = $2 LIMIT 1`,
    slug, game,
  )) as PlayRecord[];
  return rows[0] ?? null;
}

export async function saveRecord(slug: string, game: GameId, score: number, name: string): Promise<void> {
  await ensureTables();
  await prisma.$executeRawUnsafe(
    `INSERT INTO play_records (tenant_slug, game, best_score, best_name, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (tenant_slug, game)
     DO UPDATE SET best_score = EXCLUDED.best_score, best_name = EXCLUDED.best_name, updated_at = NOW()`,
    slug, game, score, normalizeName(name, "Gast"),
  );
}

export async function listRecords(slug: string): Promise<PlayRecord[]> {
  await ensureTables();
  return (await prisma.$queryRawUnsafe(
    `SELECT game, best_score, best_name, updated_at FROM play_records WHERE tenant_slug = $1 ORDER BY best_score DESC`,
    slug,
  )) as PlayRecord[];
}

export interface ScoreResult {
  record: boolean;
  best: number;
  previousBest: number | null;
}

// Allgemeiner Highscore für ALLE Spiele (auch die eigenständigen 3D-Spiele,
// die ihr Ergebnis per postMessage melden). Höhere Punktzahl = besser.
export async function recordGameScore(
  slug: string,
  game: string,
  name: string,
  score: number,
): Promise<ScoreResult> {
  await ensureTables();
  const g = String(game).slice(0, 40);
  const s = Math.max(0, Math.round(Number(score) || 0));
  const rec = await getRecord(slug, g as GameId);
  const previousBest = rec ? rec.best_score : null;
  if (!rec || s > rec.best_score) {
    await saveRecord(slug, g as GameId, s, name);
    await insertHighlight(slug, name, g as GameId, `Neuer Rekord: ${s} Punkte`, s);
    return { record: true, best: s, previousBest };
  }
  return { record: false, best: rec.best_score, previousBest };
}
