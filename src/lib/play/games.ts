// Play World — Spiel-Registry, Regeln, Bot-Logik und Realtime-Ticks.
// Server-autoritativ; unterstützt 2–N Spieler.

export type GameId =
  | "getfour" | "tictactoe" | "nim" | "memory" | "kniffel"
  | "ludo" | "pickup" | "towers" | "liars";
export type Seat = number; // 1-basiert
export type GameMode = "turn" | "realtime";

export interface GameMeta {
  id: GameId;
  name: string;
  emoji: string;
  tagline: string;
  minPlayers: number;
  maxPlayers: number;
  bots: boolean;
  ready: boolean;
  mode: GameMode;
}

export const GAMES: GameMeta[] = [
  { id: "getfour", name: "Vier gewinnt", emoji: "🔴", tagline: "4 in einer Reihe", minPlayers: 2, maxPlayers: 2, bots: true, ready: true, mode: "turn" },
  { id: "tictactoe", name: "Tic-Tac-Toe", emoji: "❌", tagline: "3 in einer Reihe", minPlayers: 2, maxPlayers: 2, bots: true, ready: true, mode: "turn" },
  { id: "nim", name: "Elf", emoji: "🪵", tagline: "Nimm 1–3 – wer zuletzt nimmt, gewinnt", minPlayers: 2, maxPlayers: 8, bots: true, ready: true, mode: "turn" },
  { id: "ludo", name: "Mensch ärgere dich nicht", emoji: "🎲", tagline: "Alle Figuren nach Hause", minPlayers: 2, maxPlayers: 4, bots: true, ready: true, mode: "turn" },
  { id: "memory", name: "Memory", emoji: "🃏", tagline: "Finde die Paare", minPlayers: 2, maxPlayers: 6, bots: true, ready: true, mode: "turn" },
  { id: "towers", name: "Turm-Titan", emoji: "🏗️", tagline: "Stapel den höchsten Turm", minPlayers: 2, maxPlayers: 6, bots: true, ready: true, mode: "turn" },
  { id: "kniffel", name: "Würfel-Poker", emoji: "🎲", tagline: "Kniffel über 13 Runden", minPlayers: 2, maxPlayers: 6, bots: true, ready: true, mode: "turn" },
  { id: "pickup", name: "Schnapp!", emoji: "⚡", tagline: "Wer tippt am schnellsten?", minPlayers: 2, maxPlayers: 8, bots: true, ready: true, mode: "realtime" },
  { id: "liars", name: "Lügen-Dice", emoji: "🎲", tagline: "Bluffen & bieten", minPlayers: 2, maxPlayers: 8, bots: true, ready: true, mode: "turn" },
];

export const DEFAULT_GAME: GameId = "getfour";

export const SEAT_COLORS = [
  "bg-rose-500", "bg-amber-400", "bg-sky-400", "bg-emerald-400",
  "bg-violet-400", "bg-pink-400", "bg-lime-500", "bg-orange-400",
];

export function isGameId(v: unknown): v is GameId {
  return GAMES.some((g) => g.id === v);
}
export function gameMeta(id: GameId): GameMeta {
  return GAMES.find((g) => g.id === id) ?? GAMES[0];
}

export interface ApplyResult {
  data: Record<string, unknown>;
  done: Seat | "draw" | null;
  keepTurn?: boolean;
  nextSeat?: Seat;
}

// ───────────────────────────── GetFour (2P) ─────────────────────────────
const GF_ROWS = 6;
const GF_COLS = 7;

function gfWin(board: number[][], row: number, col: number, seat: Seat): boolean {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (const s of [1, -1] as const) {
      let r = row + dr * s;
      let c = col + dc * s;
      while (r >= 0 && r < GF_ROWS && c >= 0 && c < GF_COLS && board[r][c] === seat) { count++; r += dr * s; c += dc * s; }
    }
    if (count >= 4) return true;
  }
  return false;
}
function gfWouldWin(board: number[][], col: number, seat: Seat): boolean {
  const b = board.map((r) => [...r]);
  let row = -1;
  for (let r = GF_ROWS - 1; r >= 0; r--) if (b[r][col] === 0) { b[r][col] = seat; row = r; break; }
  return row >= 0 && gfWin(b, row, col, seat);
}
function gfInit(): Record<string, unknown> {
  return { board: Array.from({ length: GF_ROWS }, () => Array(GF_COLS).fill(0)) };
}
function gfApply(data: Record<string, unknown>, move: { col?: unknown }, seat: Seat): ApplyResult {
  const board = (data.board as number[][]).map((r) => [...r]);
  const col = Number(move.col);
  if (!Number.isInteger(col) || col < 0 || col >= GF_COLS) throw new Error("INVALID");
  let row = -1;
  for (let r = GF_ROWS - 1; r >= 0; r--) if (board[r][col] === 0) { board[r][col] = seat; row = r; break; }
  if (row < 0) throw new Error("INVALID");
  const win = gfWin(board, row, col, seat);
  return { data: { ...data, board, last: { row, col } }, done: win ? seat : board[0].every((c) => c !== 0) ? "draw" : null };
}

// ──────────────────────────── Tic-Tac-Toe (2P) ────────────────────────────
const TTT_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
function tttInit(): Record<string, unknown> { return { board: Array(9).fill(0) }; }
function tttApply(data: Record<string, unknown>, move: { cell?: unknown }, seat: Seat): ApplyResult {
  const board = [...(data.board as number[])];
  const cell = Number(move.cell);
  if (!Number.isInteger(cell) || cell < 0 || cell > 8 || board[cell] !== 0) throw new Error("INVALID");
  board[cell] = seat;
  const win = TTT_LINES.some((l) => l.every((i) => board[i] === seat));
  return { data: { board, last: cell }, done: win ? seat : board.every((c) => c !== 0) ? "draw" : null };
}

// ──────────────────────────────── Nim (2–8) ────────────────────────────────
function nimInit(): Record<string, unknown> { return { stones: 11, maxTake: 3, last: null }; }
function nimApply(data: Record<string, unknown>, move: { take?: unknown }, seat: Seat): ApplyResult {
  const take = Number(move.take);
  const stones = Number(data.stones);
  if (!Number.isInteger(take) || take < 1 || take > Number(data.maxTake) || take > stones) throw new Error("INVALID");
  const left = stones - take;
  return { data: { ...data, stones: left, last: take }, done: left === 0 ? seat : null };
}

// ────────────────────────────── Memory (2–6) ──────────────────────────────
export const MEM_EMOJI = ["🍒", "🍋", "🍇", "🍉", "🥝", "🍑", "🍌", "🍊"];
function memInit(playerCount: number): Record<string, unknown> {
  const deck: number[] = [];
  for (let i = 0; i < 8; i++) deck.push(i, i);
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return { deck, matched: Array(16).fill(false), revealed: [] as number[], scores: Array(playerCount).fill(0), lastReveal: null };
}
function memApply(data: Record<string, unknown>, move: { index?: unknown }, seat: Seat, playerCount: number): ApplyResult {
  const deck = data.deck as number[];
  const matched = [...(data.matched as boolean[])];
  let revealed = [...(data.revealed as number[])];
  const scores = [...(data.scores as number[])] as number[];
  const index = Number(move.index);
  if (!Number.isInteger(index) || index < 0 || index >= deck.length || matched[index]) throw new Error("INVALID");
  if (revealed.length >= 2) revealed = [];
  if (revealed.length === 0) return { data: { ...data, revealed: [index], lastReveal: { indices: [index], match: null } }, done: null, keepTurn: true };
  const first = revealed[0];
  if (first === index) throw new Error("INVALID");
  const match = deck[first] === deck[index];
  if (match) { matched[first] = true; matched[index] = true; scores[seat - 1] = (scores[seat - 1] ?? 0) + 1; }
  let done: Seat | "draw" | null = null;
  if (matched.every(Boolean)) {
    const max = Math.max(...scores.slice(0, playerCount));
    done = scores.slice(0, playerCount).filter((s) => s === max).length > 1 ? "draw" : scores.indexOf(max) + 1;
  }
  return { data: { ...data, matched, scores, revealed: match ? [] : [first, index], lastReveal: { indices: [first, index], match } }, done, keepTurn: match };
}

// ──────────────────── Würfel-Poker / Kniffel (2–6) ────────────────────
export const KNIFFEL_CATEGORIES = ["Eins", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Dreierpasch", "Viererpasch", "Full House", "Kleine Straße", "Große Straße", "Kniffel", "Chance"];
function knRoll(dice: number[], held: boolean[]): number[] { return dice.map((d, i) => (held[i] ? d : 1 + Math.floor(Math.random() * 6))); }
export function kniffelScore(dice: number[], cat: number): number {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
  const sum = dice.reduce((a, b) => a + b, 0);
  if (cat >= 0 && cat <= 5) return counts[cat + 1] * (cat + 1);
  if (cat === 6) return counts.some((c) => c >= 3) ? sum : 0;
  if (cat === 7) return counts.some((c) => c >= 4) ? sum : 0;
  if (cat === 8) return counts.some((c) => c === 3) && counts.some((c) => c === 2) ? 25 : 0;
  if (cat === 9) { const v = new Set(dice); return [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]].some((s) => s.every((x) => v.has(x))) ? 30 : 0; }
  if (cat === 10) { const v = new Set(dice); return [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]].some((s) => s.every((x) => v.has(x))) ? 40 : 0; }
  if (cat === 11) return counts.some((c) => c === 5) ? 50 : 0;
  return sum;
}
function knInit(playerCount: number): Record<string, unknown> {
  return { dice: [0, 0, 0, 0, 0], held: [false, false, false, false, false], rollsLeft: 3, hasRolled: false, scores: Array.from({ length: playerCount }, () => Array(13).fill(0)), filled: Array.from({ length: playerCount }, () => Array(13).fill(false)) };
}
function knApply(data: Record<string, unknown>, move: { roll?: unknown; hold?: unknown; category?: unknown }, seat: Seat, playerCount: number): ApplyResult {
  let dice = [...(data.dice as number[])];
  const held = [...(data.held as boolean[])];
  let rollsLeft = Number(data.rollsLeft);
  let hasRolled = Boolean(data.hasRolled);
  const scores = (data.scores as number[][]).map((r) => [...r]);
  const filled = (data.filled as boolean[][]).map((r) => [...r]);
  if (move.roll) {
    if (rollsLeft <= 0) throw new Error("INVALID");
    dice = knRoll(dice, hasRolled ? held : [false, false, false, false, false]);
    hasRolled = true; rollsLeft -= 1;
    return { data: { ...data, dice, held, rollsLeft, hasRolled }, done: null, keepTurn: true };
  }
  if (typeof move.hold === "number") {
    if (!hasRolled) throw new Error("INVALID");
    const i = move.hold;
    if (i < 0 || i > 4) throw new Error("INVALID");
    held[i] = !held[i];
    return { data: { ...data, held }, done: null, keepTurn: true };
  }
  if (typeof move.category === "number") {
    const c = move.category;
    if (!hasRolled || c < 0 || c > 12 || filled[seat - 1][c]) throw new Error("INVALID");
    scores[seat - 1][c] = kniffelScore(dice, c);
    filled[seat - 1][c] = true;
    let done: Seat | "draw" | null = null;
    if (filled.every((row) => row.every(Boolean))) {
      const totals = scores.slice(0, playerCount).map((r) => r.reduce((a, b) => a + b, 0));
      const max = Math.max(...totals);
      done = totals.filter((t) => t === max).length > 1 ? "draw" : totals.indexOf(max) + 1;
    }
    return { data: { ...data, dice: [0, 0, 0, 0, 0], held: [false, false, false, false, false], rollsLeft: 3, hasRolled: false, scores, filled }, done, keepTurn: false };
  }
  throw new Error("INVALID");
}

// ───────────── Mensch ärgere dich nicht / Ludo (2–4) ─────────────
const LUDO_START = [0, 10, 20, 30];
const LUDO_TRACK = 40;
const LUDO_GOAL = 44;

function ludoInit(playerCount: number): Record<string, unknown> {
  return {
    pieces: Array.from({ length: playerCount }, () => [-1, -1, -1, -1]),
    dice: null,
    last: null,
  };
}
function ludoLegal(pieces: number[][], seat: number, die: number, playerCount: number): number[] {
  const own = pieces[seat - 1];
  const res: number[] = [];
  for (let i = 0; i < 4; i++) {
    const p = own[i];
    if (p === LUDO_GOAL) continue;
    if (p === -1) { if (die === 6) res.push(i); continue; }
    const np = p + die;
    if (np > LUDO_GOAL) continue;
    if (np <= 39) {
      const abs = (LUDO_START[seat - 1] + np) % LUDO_TRACK;
      let opp = 0;
      for (let s = 0; s < playerCount; s++) {
        if (s === seat - 1) continue;
        for (const op of pieces[s]) if (op >= 0 && op <= 39 && (LUDO_START[s] + op) % LUDO_TRACK === abs) opp++;
      }
      if (opp >= 2) continue; // Blockade
    }
    res.push(i);
  }
  return res;
}
function ludoApply(data: Record<string, unknown>, move: Record<string, unknown>, seat: Seat, playerCount: number): ApplyResult {
  const pieces = (data.pieces as number[][]).map((r) => [...r]);
  if (move.roll) {
    if (data.dice !== null) throw new Error("INVALID");
    const die = 1 + Math.floor(Math.random() * 6);
    const legal = ludoLegal(pieces, seat, die, playerCount);
    if (legal.length === 0) return { data: { ...data, dice: null, last: { roll: die, pass: true } }, done: null, keepTurn: false };
    return { data: { ...data, dice: die, last: { roll: die } }, done: null, keepTurn: true };
  }
  const die = data.dice as number | null;
  if (die === null) throw new Error("INVALID");
  const i = Number(move.piece);
  const legal = ludoLegal(pieces, seat, die, playerCount);
  if (!legal.includes(i)) throw new Error("INVALID");
  const own = pieces[seat - 1];
  const p = own[i];
  const np = p === -1 ? 0 : p + die;
  let captured = false;
  if (np <= 39) {
    const abs = (LUDO_START[seat - 1] + np) % LUDO_TRACK;
    for (let s = 0; s < playerCount; s++) {
      if (s === seat - 1) continue;
      pieces[s] = pieces[s].map((op) => (op >= 0 && op <= 39 && (LUDO_START[s] + op) % LUDO_TRACK === abs ? (captured = true, -1) : op));
    }
  }
  own[i] = np;
  const done = own.every((x) => x === LUDO_GOAL) ? seat : null;
  const again = (die === 6 || captured) && !done;
  return { data: { ...data, pieces, dice: null, last: { piece: i, to: np, captured } }, done, keepTurn: again };
}

// ───────────────────────── Turm-Titan (2–6) ─────────────────────────
const TOWERS_TURNS = 8;
function towersInit(playerCount: number): Record<string, unknown> {
  return {
    heights: Array(playerCount).fill(0),
    widths: Array(playerCount).fill(1),
    scores: Array(playerCount).fill(0),
    active: Array(playerCount).fill(true),
    taken: Array(playerCount).fill(0),
    last: null,
  };
}
function towersApply(data: Record<string, unknown>, move: { offset?: unknown }, seat: Seat, playerCount: number): ApplyResult {
  const heights = [...(data.heights as number[])];
  const widths = [...(data.widths as number[])];
  const scores = [...(data.scores as number[])];
  const active = [...(data.active as boolean[])];
  const taken = [...(data.taken as number[])];
  const i = seat - 1;
  if (!active[i] || taken[i] >= TOWERS_TURNS) throw new Error("INVALID");
  const err = Math.min(1, Math.abs(Number(move.offset) || 0));
  taken[i] += 1;
  if (err > 0.85) {
    active[i] = false; // Turm eingestürzt
  } else {
    heights[i] += 1;
    widths[i] = Math.max(0.12, widths[i] * (1 - err * 0.8));
    scores[i] += Math.round((1 - err) * 100);
    if (taken[i] >= TOWERS_TURNS) active[i] = false;
  }
  const anyActive = active.some(Boolean);
  let done: Seat | "draw" | null = null;
  if (!anyActive) {
    const top = scores.slice(0, playerCount);
    const max = Math.max(...top);
    done = top.filter((s) => s === max).length > 1 ? "draw" : scores.indexOf(max) + 1;
  }
  return { data: { ...data, heights, widths, scores, active, taken, last: { seat, err } }, done, keepTurn: false, };
}

// ────────────────────────── Schnapp! / PickUp (realtime, 2–8) ──────────────────────────
const PICKUP_DURATION = 40000;
const PICKUP_COUNT = 18;
const PICKUP_GAP = 1900;

function pickupInit(playerCount: number): Record<string, unknown> {
  return { phase: "waiting", startAt: 0, endAt: 0, targets: [] as unknown[], scores: Array(playerCount).fill(0), last: null };
}
function pickupPlan(now: number): Record<string, unknown> {
  const startAt = now + 3000;
  const targets = Array.from({ length: PICKUP_COUNT }, (_, i) => ({
    id: i,
    x: 8 + Math.random() * 84,
    y: 12 + Math.random() * 76,
    at: startAt + i * PICKUP_GAP,
    win: null as number | null,
  }));
  return { phase: "live", startAt, endAt: startAt + PICKUP_DURATION, targets, scores: null, last: null };
}
function pickupApply(data: Record<string, unknown>, move: { target?: unknown }, seat: Seat): ApplyResult {
  if (data.phase !== "live") throw new Error("INVALID");
  const targets = data.targets as { id: number; at: number; win: number | null }[];
  const scores = [...(data.scores as number[])];
  const id = Number(move.target);
  const t = targets.find((x) => x.id === id);
  if (!t || t.win !== null || Date.now() < t.at) throw new Error("INVALID");
  t.win = seat;
  scores[seat - 1] += 1;
  return { data: { ...data, targets, scores, last: id }, done: null };
}
/** Realtime-Tick: plant Runde / beendet sie / lässt Bots tippen. */
export function advanceRealtime(game: GameId, data: Record<string, unknown>, now: number, playerCount: number, botSeats: number[]): { data: Record<string, unknown>; done: Seat | "draw" | null; changed: boolean } {
  if (game !== "pickup") return { data, done: null, changed: false };
  let d = data;
  let changed = false;
  if (d.phase === "waiting") {
    d = { ...pickupPlan(now), scores: Array(playerCount).fill(0) };
    changed = true;
  }
  const targets = d.targets as { id: number; at: number; win: number | null }[];
  const scores = [...(d.scores as number[])];
  // Bots tippen (verzögert, etwas ungenau)
  for (const b of botSeats) {
    for (const t of targets) {
      if (t.win !== null) continue;
      if (now < t.at) break;
      if (now - t.at > 700 && Math.random() < 0.18) {
        t.win = b;
        scores[b - 1] += 1;
        d.last = t.id;
        changed = true;
      }
    }
  }
  let done: Seat | "draw" | null = null;
  if (d.phase === "live" && now >= (d.endAt as number)) {
    d = { ...d, phase: "done" };
    changed = true;
    const max = Math.max(...scores.slice(0, playerCount));
    done = scores.slice(0, playerCount).filter((s) => s === max).length > 1 ? "draw" : scores.indexOf(max) + 1;
  }
  if (changed) d = { ...d, targets, scores };
  return { data: d, done, changed };
}

// ─────────────────── Lügen-Dice / Perudo (2–8) ───────────────────
const LIARS_DICE_START = 5;
function liarsReroll(counts: number[], alive: boolean[]): number[][] {
  return counts.map((c, i) => (alive[i] ? Array.from({ length: Math.max(0, c) }, () => 1 + Math.floor(Math.random() * 6)) : []));
}
function liarsInit(playerCount: number): Record<string, unknown> {
  const counts = Array(playerCount).fill(LIARS_DICE_START);
  const alive = Array(playerCount).fill(true);
  return { counts, alive, dice: liarsReroll(counts, alive), bid: null, last: null };
}
function liarsTotal(dice: number[][], alive: boolean[], face: number): number {
  let n = 0;
  for (let i = 0; i < dice.length; i++) { if (!alive[i]) continue; n += dice[i].filter((d) => d === face).length; }
  return n;
}
function liarsNextAlive(alive: boolean[], from: number): number {
  for (let k = 1; k <= alive.length; k++) { const s = ((from - 1 + k) % alive.length) + 1; if (alive[s - 1]) return s; }
  return from;
}
function liarsApply(data: Record<string, unknown>, move: Record<string, unknown>, seat: Seat, _playerCount: number): ApplyResult {
  const counts = [...(data.counts as number[])];
  const alive = [...(data.alive as boolean[])];
  let dice = (data.dice as number[][]).map((r) => [...r]);
  const bid = data.bid as { seat: number; qty: number; face: number } | null;
  if (!alive[seat - 1]) throw new Error("INVALID");

  if (move.bid && typeof move.bid === "object") {
    const b = move.bid as { qty?: unknown; face?: unknown };
    const qty = Number(b.qty);
    const face = Number(b.face);
    if (!Number.isInteger(qty) || qty < 1 || qty > 60 || !Number.isInteger(face) || face < 1 || face > 6) throw new Error("INVALID");
    if (bid) {
      const higher = qty > bid.qty || (qty === bid.qty && face > bid.face);
      if (!higher) throw new Error("INVALID");
    }
    const newBid = { seat, qty, face };
    return { data: { ...data, bid: newBid, last: { type: "bid", bid: newBid } }, done: null, keepTurn: false };
  }

  if (move.challenge) {
    if (!bid) throw new Error("INVALID");
    const total = liarsTotal(dice, alive, bid.face);
    const bidTrue = total >= bid.qty;
    const loser = bidTrue ? seat : bid.seat;
    counts[loser - 1] -= 1;
    if (counts[loser - 1] <= 0) { counts[loser - 1] = 0; alive[loser - 1] = false; }
    const revealed = dice.map((r) => [...r]);
    const last = { type: "challenge", bid, total, loser, revealed };
    const aliveSeats = alive.filter(Boolean).length;
    if (aliveSeats <= 1) {
      const winner = alive.findIndex(Boolean) + 1;
      return { data: { ...data, counts, alive, dice, bid: null, last }, done: winner, keepTurn: false };
    }
    dice = liarsReroll(counts, alive);
    const nextSeat = alive[loser - 1] ? loser : liarsNextAlive(alive, loser);
    return { data: { ...data, counts, alive, dice, bid: null, last }, done: null, nextSeat };
  }
  throw new Error("INVALID");
}

// ───────────────────────────── Dispatch ─────────────────────────────
export function initData(game: GameId, playerCount: number): Record<string, unknown> {
  switch (game) {
    case "getfour": return gfInit();
    case "tictactoe": return tttInit();
    case "nim": return nimInit();
    case "memory": return memInit(playerCount);
    case "kniffel": return knInit(playerCount);
    case "ludo": return ludoInit(playerCount);
    case "towers": return towersInit(playerCount);
    case "pickup": return pickupInit(playerCount);
    case "liars": return liarsInit(playerCount);
    default: return gfInit();
  }
}

export function applyMove(game: GameId, data: Record<string, unknown>, move: unknown, seat: Seat, playerCount: number): ApplyResult {
  const m = (move ?? {}) as Record<string, unknown>;
  switch (game) {
    case "getfour": return gfApply(data, m, seat);
    case "tictactoe": return tttApply(data, m, seat);
    case "nim": return nimApply(data, m, seat);
    case "memory": return memApply(data, m, seat, playerCount);
    case "kniffel": return knApply(data, m, seat, playerCount);
    case "ludo": return ludoApply(data, m, seat, playerCount);
    case "towers": return towersApply(data, m, seat, playerCount);
    case "pickup": return pickupApply(data, m, seat);
    case "liars": return liarsApply(data, m, seat, playerCount);
    default: throw new Error("INVALID");
  }
}

export function scoreFor(game: GameId, data: Record<string, unknown>, winner: Seat | "draw", elapsedSec: number): number | null {
  if (winner === "draw") return null;
  if (game === "memory") { const s = (data.scores as number[]) ?? []; return Math.max(0, Number(s[winner - 1]) || 0) * 100; }
  if (game === "kniffel") { const s = (data.scores as number[][]) ?? []; return (s[winner - 1] ?? []).reduce((a, b) => a + b, 0); }
  if (game === "towers") { const s = (data.scores as number[]) ?? []; return Math.max(0, Number(s[winner - 1]) || 0); }
  if (game === "pickup") { const s = (data.scores as number[]) ?? []; return Math.max(0, Number(s[winner - 1]) || 0) * 100; }
  if (game === "liars") { const c = (data.counts as number[]) ?? []; return Math.max(0, Number(c[winner - 1]) || 0) * 100 + 200; }
  const speed = Math.max(0, 300 - Math.min(300, Math.round(elapsedSec)));
  return 100 + speed;
}

export function sanitize(game: GameId, data: Record<string, unknown>, viewerSeat?: number): Record<string, unknown> {
  if (game === "liars") {
    const dice = (data.dice as number[][]) ?? [];
    const seat = viewerSeat ?? 0;
    const counts = (data.counts as number[]) ?? [];
    return {
      counts: data.counts,
      alive: data.alive,
      bid: data.bid,
      last: data.last,
      totalDice: counts.reduce((a, b) => a + b, 0),
      myDice: seat >= 1 ? (dice[seat - 1] ?? []) : [],
    };
  }
  if (game !== "memory") return data;
  const deck = data.deck as number[];
  const matched = data.matched as boolean[];
  const revealed = data.revealed as number[];
  const cards = deck.map((v, i) => (matched[i] || revealed.includes(i) ? v : null));
  return { cards, matched, revealed, scores: data.scores, lastReveal: data.lastReveal };
}

// ───────────────────────────── Bot-Logik ─────────────────────────────
export function botMove(game: GameId, data: Record<string, unknown>, seat: Seat, playerCount: number, opponentSeats: number[]): Record<string, unknown> | null {
  switch (game) {
    case "getfour": {
      const board = data.board as number[][];
      const cols = Array.from({ length: GF_COLS }, (_, i) => i).filter((c) => board[0][c] === 0);
      if (!cols.length) return null;
      for (const c of cols) if (gfWouldWin(board, c, seat)) return { col: c };
      for (const opp of opponentSeats) for (const c of cols) if (gfWouldWin(board, c, opp)) return { col: c };
      return { col: [3, 2, 4, 1, 5, 0, 6].find((c) => cols.includes(c)) ?? cols[0] };
    }
    case "tictactoe": {
      const board = [...(data.board as number[])];
      const win = (b: number[], p: number) => TTT_LINES.some((l) => l.every((i) => b[i] === p));
      const empty = board.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
      if (!empty.length) return null;
      for (const i of empty) { board[i] = seat; const w = win(board, seat); board[i] = 0; if (w) return { cell: i }; }
      for (const opp of opponentSeats) for (const i of empty) { board[i] = opp; const w = win(board, opp); board[i] = 0; if (w) return { cell: i }; }
      if (board[4] === 0) return { cell: 4 };
      const corners = [0, 2, 6, 8].filter((i) => board[i] === 0);
      if (corners.length) return { cell: corners[Math.floor(Math.random() * corners.length)] };
      return { cell: empty[Math.floor(Math.random() * empty.length)] };
    }
    case "nim": {
      const stones = Number(data.stones); const maxTake = Number(data.maxTake);
      const mod = stones % (maxTake + 1);
      return { take: Math.max(1, mod === 0 ? 1 : Math.min(mod, stones)) };
    }
    case "memory": {
      const matched = data.matched as boolean[]; const revealed = data.revealed as number[];
      const hidden = matched.map((m, i) => (m ? -1 : i)).filter((i) => i >= 0);
      if (!hidden.length) return null;
      if (revealed.length === 1) { const o = hidden.filter((i) => i !== revealed[0]); return { index: (o.length ? o : hidden)[Math.floor(Math.random() * (o.length || hidden.length))] }; }
      return { index: hidden[Math.floor(Math.random() * hidden.length)] };
    }
    case "kniffel": {
      const dice = data.dice as number[]; const held = data.held as boolean[];
      const rollsLeft = Number(data.rollsLeft); const hasRolled = Boolean(data.hasRolled);
      const filled = data.filled as boolean[][];
      if (!hasRolled) return { roll: true };
      if (rollsLeft > 0) {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
        let bestVal = 1, bestCount = 0;
        for (let v = 1; v <= 6; v++) if (counts[v] > bestCount) { bestCount = counts[v]; bestVal = v; }
        const desired = dice.map((d) => d === bestVal);
        const mismatch = desired.findIndex((want, i) => want !== held[i]);
        if (mismatch >= 0) return { hold: mismatch };
        if (bestCount < 3) return { roll: true };
      }
      const row = filled[seat - 1];
      let bestCat = 0, bestScore = -1;
      for (let c = 0; c < 13; c++) { if (row[c]) continue; const s = kniffelScore(dice, c); if (s > bestScore) { bestScore = s; bestCat = c; } }
      return { category: bestCat };
    }
    case "ludo": {
      const pieces = data.pieces as number[][];
      if (data.dice === null) return { roll: true };
      const die = Number(data.dice);
      const legal = ludoLegal(pieces, seat, die, playerCount);
      if (!legal.length) return null;
      const own = pieces[seat - 1];
      // Priorität: schlagen > rausziehen > weiteste Figur
      let best = legal[0];
      let bestScore = -Infinity;
      for (const i of legal) {
        const p = own[i];
        const np = p === -1 ? 0 : p + die;
        let sc = np;
        if (np <= 39) {
          const abs = (LUDO_START[seat - 1] + np) % LUDO_TRACK;
          for (const opp of opponentSeats) for (const op of pieces[opp - 1]) {
            if (op >= 0 && op <= 39 && (LUDO_START[opp - 1] + op) % LUDO_TRACK === abs) sc += 1000;
          }
        }
        if (p === -1) sc += 500;
        if (sc > bestScore) { bestScore = sc; best = i; }
      }
      return { piece: best };
    }
    case "towers": {
      // möglichst zentral setzen (kleiner Fehler)
      return { offset: Math.random() * 0.16 };
    }
    case "pickup":
      return null; // Bots tippen im Realtime-Tick
    case "liars": {
      const own = ((data.dice as number[][])?.[seat - 1] ?? []) as number[];
      const bid = data.bid as { seat: number; qty: number; face: number } | null;
      const counts = (data.counts as number[]) ?? [];
      const totalDice = counts.reduce((a, b) => a + b, 0);
      if (!bid) {
        const c = [0, 0, 0, 0, 0, 0, 0];
        for (const d of own) c[d] = (c[d] ?? 0) + 1;
        let face = 1, best = 0;
        for (let f = 1; f <= 6; f++) if (c[f] > best) { best = c[f]; face = f; }
        return { bid: { qty: Math.max(1, best), face } };
      }
      const ownCount = own.filter((d) => d === bid.face).length;
      const expected = ownCount + (totalDice - own.length) / 6;
      if (bid.qty > expected + 1) return { challenge: true };
      if (bid.face < 6) return { bid: { qty: bid.qty, face: bid.face + 1 } };
      return { bid: { qty: bid.qty + 1, face: 1 } };
    }
    default:
      return null;
  }
}
