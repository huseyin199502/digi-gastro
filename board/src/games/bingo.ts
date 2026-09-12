/**
 * Bingo (75-Ball, 5×5 mit freiem Feld) — Host zieht Zahlen.
 * Gleichzeitig für alle Spieler, mit Bots.
 */
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import type { GameCtx, GameInstance, GameModule, Player } from '../core/types';

const COLS = [['B', 1, 15], ['I', 16, 30], ['N', 31, 45], ['G', 46, 60], ['O', 61, 75]] as const;
const DRAW_INTERVAL = 3.6;

interface BingoState {
  phase: 'play' | 'done';
  drawn: number[];
  last: number | null;
  cards: Record<string, number[]>;
  marked: Record<string, number[]>;
  winner: string | null;
  drawSeq: number;
  log: string;
}

function makeCard(): number[] {
  const card: number[] = new Array(25).fill(0);
  COLS.forEach(([, lo, hi], c) => {
    const pool: number[] = [];
    for (let n = lo; n <= hi; n++) pool.push(n);
    for (let r = 0; r < 5; r++) {
      const k = Math.floor(Math.random() * pool.length);
      card[r * 5 + c] = pool.splice(k, 1)[0];
    }
  });
  card[12] = 0; // free
  return card;
}

function lineWin(marked: Set<number>, card: number[]): boolean {
  const has = (n: number) => n === 0 || marked.has(n);
  for (let r = 0; r < 5; r++) if ([0, 1, 2, 3, 4].every((c) => has(card[r * 5 + c]!))) return true;
  for (let c = 0; c < 5; c++) if ([0, 1, 2, 3, 4].every((r) => has(card[r * 5 + c]!))) return true;
  if ([0, 1, 2, 3, 4].every((i) => has(card[i * 5 + i]!))) return true;
  if ([0, 1, 2, 3, 4].every((i) => has(card[i * 5 + (4 - i)]!))) return true;
  return false;
}

export const bingoModule: GameModule = {
  id: 'bingo',
  title: 'Bingo',
  minPlayers: 2,
  maxPlayers: 8,
  create(ctx: GameCtx): GameInstance {
    return new BingoGame(ctx);
  },
};

class BingoGame implements GameInstance {
  private ctx: GameCtx;
  private header: Text;
  private cage: THREE.Group;
  private balls: THREE.Mesh[] = [];
  private players: Player[] = [];
  private timer = 0;
  private shownWinner = false;
  private started = false;

  private state: BingoState = {
    phase: 'play', drawn: [], last: null, cards: {}, marked: {}, winner: null, drawSeq: 0, log: 'Bereit',
  };

  private hudRoot: HTMLElement;
  private lastBadge!: HTMLElement;
  private calledEl!: HTMLElement;
  private cardEl!: HTMLElement;
  private logEl!: HTMLElement;

  constructor(ctx: GameCtx) {
    this.ctx = ctx;

    this.header = new Text();
    this.header.fontSize = 0.4;
    this.header.color = '#ffffff';
    this.header.anchorX = 'center';
    this.header.anchorY = 'middle';
    this.header.position.set(0, 3.0, -1.0);
    this.header.text = 'BINGO';
    this.header.sync();
    ctx.scene.add(this.header);

    this.cage = new THREE.Group();
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 1),
      new THREE.MeshStandardMaterial({ color: 0x2a2360, wireframe: true, emissive: 0x4b3cff, emissiveIntensity: 0.6 }),
    );
    this.cage.add(shell);
    const ballGeo = new THREE.SphereGeometry(0.12, 16, 12);
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(
        ballGeo,
        new THREE.MeshStandardMaterial({ color: [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308][i % 4], roughness: 0.3, metalness: 0.2 }),
      );
      m.position.set((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9);
      this.cage.add(m);
      this.balls.push(m);
    }
    this.cage.position.set(0, 1.7, 0);
    ctx.scene.add(this.cage);

    this.hudRoot = document.createElement('div');
    this.hudRoot.className = 'bb-root';
    ctx.hud.appendChild(this.hudRoot);
    this.buildHud();
  }

  setPlayers(p: Player[]): void {
    this.players = p;
    this.render();
  }

  start(): void {
    this.state = { phase: 'play', drawn: [], last: null, cards: {}, marked: {}, winner: null, drawSeq: 0, log: 'Los!' };
    this.shownWinner = false;
    this.started = true;
    this.timer = 1.2;
    this.players.forEach((p) => {
      this.state.cards[p.id] = makeCard();
      this.state.marked[p.id] = [];
    });
    this.timer = 1.2;
    this.render();
    this.ctx.sendState(this.snapshot());
  }

  private snapshot(): BingoState {
    return JSON.parse(JSON.stringify(this.state));
  }
  getState(): unknown { return this.snapshot(); }

  applyState(s: unknown): void {
    this.state = JSON.parse(JSON.stringify(s));
    if (this.state.phase !== 'done' && this.shownWinner) {
      this.shownWinner = false;
      this.ctx.clearOverlay();
    }
    this.render();
    this.renderCard();
    this.maybeShowWinner();
  }

  private maybeShowWinner(): void {
    if (this.state.phase === 'done' && this.state.winner && !this.shownWinner) {
      this.shownWinner = true;
      const winner = this.players.find((p) => p.id === this.state.winner);
      if (winner) this.showWinner(winner.name);
    }
  }

  // Host: Zahl ziehen
  private draw(): void {
    if (this.state.phase !== 'play') return;
    const remaining: number[] = [];
    for (let n = 1; n <= 75; n++) if (!this.state.drawn.includes(n)) remaining.push(n);
    if (remaining.length === 0) {
      this.state.phase = 'done';
      this.state.log = 'Alle Zahlen gezogen – keine Linie.';
      this.render();
      this.ctx.sendState(this.snapshot());
      return;
    }
    const n = remaining[Math.floor(Math.random() * remaining.length)];
    this.state.drawn.push(n);
    this.state.last = n;
    this.state.drawSeq += 1;
    const letter = COLS.find(([, lo, hi]) => n >= lo && n <= hi)?.[0] ?? '';
    this.state.log = `${letter}-${n}`;
    // Bots markieren
    for (const p of this.players) {
      if (!p.isBot || this.state.winner) continue;
      if ((this.state.cards[p.id] ?? []).includes(n)) {
        this.mark(p.id, n, true);
      }
    }
    this.checkWinners();
    this.render();
    this.ctx.sendState(this.snapshot());
  }

  private mark(id: string, n: number, silent = false): void {
    const arr = this.state.marked[id] ?? (this.state.marked[id] = []);
    if (!arr.includes(n)) arr.push(n);
    if (!silent) { this.renderCard(); this.ctx.sendState(this.snapshot()); }
  }

  private checkWinners(): void {
    if (this.state.winner) return;
    for (const p of this.players) {
      const set = new Set(this.state.marked[p.id] ?? []);
      if (lineWin(set, this.state.cards[p.id] ?? [])) {
        this.state.winner = p.id;
        this.state.phase = 'done';
        this.state.log = `🏆 ${p.name} hat BINGO!`;
        this.maybeShowWinner();
        return;
      }
    }
  }

  handleIntent(m: Record<string, unknown>, from: string): void {
    if (m.type === 'mark' && typeof m.n === 'number' && this.state.drawn.includes(m.n)) {
      // Nur Zahlen markieren, die wirklich auf der Karte des Absenders stehen.
      if (!(this.state.cards[from] ?? []).includes(m.n)) return;
      this.mark(from, m.n);
      this.checkWinners();
      this.ctx.sendState(this.snapshot());
    }
  }

  update(dt: number): void {
    this.cage.rotation.y += dt * 0.6;
    this.cage.rotation.x += dt * 0.2;
    this.balls.forEach((b, i) => { b.position.y += Math.sin(performance.now() / 400 + i) * 0.002; });
    if (!this.ctx.isHost || !this.started || this.state.phase !== 'play') return;
    this.timer -= dt;
    if (this.timer <= 0) { this.timer = DRAW_INTERVAL; this.draw(); }
  }

  // ── HUD ──
  private buildHud(): void {
    this.lastBadge = el('div', 'bb-last');
    this.calledEl = el('div', 'bb-called');
    this.cardEl = el('div', 'bb-card');
    this.logEl = el('div', 'bb-log');
    const top = el('div', 'bb-top');
    top.appendChild(this.lastBadge);
    top.appendChild(this.logEl);
    this.hudRoot.appendChild(top);
    this.hudRoot.appendChild(this.calledEl);
    this.hudRoot.appendChild(this.cardEl);
  }

  private render(): void {
    this.lastBadge.textContent = this.state.last ? String(this.state.last) : '–';
    this.logEl.textContent = this.state.log;
    this.calledEl.innerHTML = '';
    this.state.drawn.slice(-12).forEach((n) => {
      const s = el('span', 'bb-ball');
      s.textContent = String(n);
      this.calledEl.appendChild(s);
    });
    this.renderCard();
  }

  private renderCard(): void {
    const card = this.state.cards[this.ctx.myId];
    this.cardEl.innerHTML = '';
    if (!card) return;
    const marked = new Set(this.state.marked[this.ctx.myId] ?? []);
    for (let i = 0; i < 25; i++) {
      const n = card[i]!;
      const cell = document.createElement('button');
      cell.className = 'bb-cell';
      const letter = COLS[i % 5]![0];
      cell.innerHTML = `<span class="lt">${letter}</span><span class="nu">${n === 0 ? '★' : n}</span>`;
      const isDrawn = n === 0 || this.state.drawn.includes(n);
      const isMarked = n === 0 || marked.has(n);
      if (isMarked) cell.classList.add('marked');
      if (n === this.state.last) cell.classList.add('hot');
      cell.disabled = n === 0 || !isDrawn || this.state.phase !== 'play';
      cell.addEventListener('click', () => {
        if (this.ctx.isHost) { this.mark(this.ctx.myId, n); this.checkWinners(); }
        else this.ctx.sendIntent({ type: 'mark', n });
      });
      this.cardEl.appendChild(cell);
    }
  }

  private showWinner(name: string): void {
    const again = document.createElement('button');
    again.className = 'bb-again';
    again.textContent = '🔁 Nochmal';
    again.addEventListener('click', () => { this.ctx.clearOverlay(); if (this.ctx.isHost) this.start(); });
    this.ctx.overlay([h('div', '', '🏆'), h('h1', '', name), h('p', '', 'hat BINGO!'), again]);
  }

  dispose(): void {
    this.ctx.scene.remove(this.header);
    this.ctx.scene.remove(this.cage);
    this.header.dispose?.();
    this.hudRoot.remove();
  }
}

function el(tag: string, cls: string): HTMLElement {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}
function h(tag: string, cls: string, text: string): HTMLElement {
  const e = el(tag, cls);
  e.textContent = text;
  return e;
}
