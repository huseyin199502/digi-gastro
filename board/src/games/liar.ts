/**
 * Lügen-Dice (Perudo-Stil) — Reihum bieten oder zweifeln.
 * Turn-basiert, host-autoritativ, mit Bots.
 */
import { Text } from 'troika-three-text';
import { DiceSet } from '../core/dice';
import type { GameCtx, GameInstance, GameModule, Player } from '../core/types';

const START_DICE = 5;

interface Bid { qty: number; face: number; by: string; }
interface LiarState {
  phase: 'play' | 'done';
  turn: number;
  dice: Record<string, number[]>;
  bid: Bid | null;
  reveal: { actual: number; face: number; qty: number; loser: string; by: string } | null;
  log: string;
  round: number;
}

const rnd = () => 1 + Math.floor(Math.random() * 6);

export const liarModule: GameModule = {
  id: 'liar',
  title: 'Lügen-Dice',
  minPlayers: 2,
  maxPlayers: 6,
  create(ctx: GameCtx): GameInstance {
    return new LiarGame(ctx);
  },
};

class LiarGame implements GameInstance {
  private ctx: GameCtx;
  private dset: DiceSet;
  private header: Text;
  private players: Player[] = [];

  private state: LiarState = {
    phase: 'play', turn: 0, dice: {}, bid: null, reveal: null, log: 'Bereit', round: 1,
  };

  private hudRoot: HTMLElement;
  private bidInfo!: HTMLElement;
  private controls!: HTMLElement;
  private playersEl!: HTMLElement;
  private logEl!: HTMLElement;
  private qty = 1;
  private face = 1;
  private botWait = 0;
  private appliedRound = -1;
  private shownWinner = false;

  constructor(ctx: GameCtx) {
    this.ctx = ctx;

    this.header = new Text();
    this.header.fontSize = 0.34;
    this.header.color = '#ffffff';
    this.header.anchorX = 'center';
    this.header.anchorY = 'middle';
    this.header.maxWidth = 5;
    this.header.position.set(0, 3.0, -1.1);
    this.header.sync();
    ctx.scene.add(this.header);

    this.dset = new DiceSet(ctx.scene, START_DICE, { size: 0.66, spacing: 0.84, y: 0.48 });
    this.dset.dice.forEach((d) => { d.baseY = 0.48; d.mesh.position.y = 0.48; });

    this.hudRoot = document.createElement('div');
    this.hudRoot.className = 'bl-root';
    ctx.hud.appendChild(this.hudRoot);
    this.buildHud();
  }

  setPlayers(p: Player[]): void {
    this.players = p;
    this.render();
  }

  start(): void {
    this.state = { phase: 'play', turn: 0, dice: {}, bid: null, reveal: null, log: 'Am Zug', round: 1 };
    this.shownWinner = false;
    this.rollAll();
  }

  private alivePlayers(): Player[] {
    return this.players.filter((p) => (this.state.dice[p.id]?.length ?? 0) > 0);
  }

  private rollAll(): void {
    for (const p of this.players) {
      const n = this.state.dice[p.id]?.length ?? START_DICE;
      this.state.dice[p.id] = Array.from({ length: p.id in this.state.dice ? n : START_DICE }, () => rnd());
    }
    // Erster lebender Spieler beginnt
    this.state.turn = 0;
    while ((this.state.dice[this.players[this.state.turn]?.id ?? '']?.length ?? 0) === 0) {
      this.state.turn = (this.state.turn + 1) % this.players.length;
    }
    this.state.bid = null;
    this.state.reveal = null;
    this.state.log = `${this.currentName()} beginnt`;
    this.syncMyDice();
    this.afterChange();
  }

  private currentId(): string { return this.players[this.state.turn]?.id ?? ''; }
  private currentName(): string { return this.players[this.state.turn]?.name ?? ''; }

  private totalDice(): number {
    return this.players.reduce((a, p) => a + (this.state.dice[p.id]?.length ?? 0), 0);
  }

  private validBid(qty: number, face: number): boolean {
    const b = this.state.bid;
    if (!b) return qty >= 1 && face >= 1 && face <= 6;
    if (qty > b.qty) return face >= 1 && face <= 6;
    if (qty === b.qty) return face > b.face;
    return false;
  }

  private doBid(qty: number, face: number): void {
    // Neue Runde nach einer Aufdeckung: Würfel neu werfen (Reveal bleibt bis dahin sichtbar).
    if (this.state.reveal) {
      this.state.reveal = null;
      this.rollRound();
    }
    this.state.bid = { qty, face, by: this.currentId() };
    this.state.log = `${this.currentName()} bietet ${qty}× ${face}`;
    this.nextTurn();
  }

  /** Wirft nur die Würfel der noch lebenden Spieler neu (Anzahl bleibt erhalten). */
  private rollRound(): void {
    for (const p of this.players) {
      const n = this.state.dice[p.id]?.length ?? 0;
      if (n > 0) this.state.dice[p.id] = Array.from({ length: n }, () => rnd());
    }
    this.syncMyDice();
  }

  private doChallenge(): void {
    const b = this.state.bid;
    if (!b) return;
    let actual = 0;
    for (const p of this.players) actual += (this.state.dice[p.id] ?? []).filter((v) => v === b.face).length;
    const bidder = this.players.find((p) => p.id === b.by);
    const challenger = this.players[this.state.turn];
    const loser = actual >= b.qty ? challenger : bidder;
    if (loser) {
      const arr = this.state.dice[loser.id] ?? [];
      arr.pop();
      this.state.dice[loser.id] = arr;
    }
    this.state.reveal = { actual, face: b.face, qty: b.qty, loser: loser?.id ?? '', by: b.by };
    this.state.log = `Zweifel! ${actual}× ${b.face} → ${loser?.name} verliert einen Würfel`;
    // Nächster lebender Spieler nach dem Verlierer
    const alive = this.alivePlayers();
    if (alive.length <= 1) {
      this.state.phase = 'done';
      this.state.log = `🏆 ${alive[0]?.name} gewinnt!`;
      this.maybeShowWinner();
      this.afterChange();
      return;
    }
    let idx = this.players.findIndex((p) => p.id === loser?.id);
    do { idx = (idx + 1) % this.players.length; } while ((this.state.dice[this.players[idx]?.id ?? '']?.length ?? 0) === 0);
    this.state.turn = idx;
    this.state.bid = null;
    this.state.round += 1;
    this.syncMyDice();
    this.afterChange();
  }

  private nextTurn(): void {
    let idx = this.state.turn;
    do { idx = (idx + 1) % this.players.length; } while ((this.state.dice[this.players[idx]?.id ?? '']?.length ?? 0) === 0);
    this.state.turn = idx;
    this.afterChange();
  }

  private syncMyDice(): void {
    const mine = this.state.dice[this.ctx.myId] ?? [];
    this.dset.setActive(Math.min(this.dset.dice.length, mine.length));
    if (mine.length) this.dset.roll(mine, mine.map((_, i) => i));
  }

  handleIntent(m: Record<string, unknown>, from: string): void {
    if (this.state.phase !== 'play' || this.currentId() !== from || this.state.reveal) return;
    if (m.type === 'bid' && typeof m.qty === 'number' && typeof m.face === 'number') {
      if (this.validBid(m.qty, m.face)) this.doBid(m.qty, m.face);
    } else if (m.type === 'challenge' && this.state.bid) {
      this.doChallenge();
    }
  }

  private afterChange(): void {
    this.render();
    this.ctx.sendState(this.snapshot());
  }

  private snapshot(): LiarState {
    return JSON.parse(JSON.stringify(this.state));
  }
  getState(): unknown { return this.snapshot(); }

  applyState(s: unknown): void {
    const st = s as LiarState;
    const newRound = st.round !== this.appliedRound;
    this.appliedRound = st.round;
    this.state = JSON.parse(JSON.stringify(st));
    const mine = st.dice[this.ctx.myId] ?? [];
    this.dset.setActive(Math.min(this.dset.dice.length, mine.length));
    if (newRound) this.syncMyDice();
    else if (mine.length) this.dset.setValues(mine, true);
    if (st.phase !== 'done' && this.shownWinner) {
      this.shownWinner = false;
      this.ctx.clearOverlay();
    }
    this.render();
    this.maybeShowWinner();
  }

  private maybeShowWinner(): void {
    if (this.state.phase === 'done' && !this.shownWinner) {
      this.shownWinner = true;
      const alive = this.alivePlayers();
      const winner = alive[0];
      if (winner) {
        this.ctx.postScore('liar', winner.id === this.ctx.myId ? 1 : 0);
        this.showWinner(winner.name);
      }
    }
  }

  update(dt: number): void {
    this.dset.update(dt);
    if (!this.ctx.isHost || this.state.phase !== 'play' || this.state.reveal) return;
    const bot = this.players[this.state.turn]?.isBot;
    if (!bot) { this.botWait = 0; return; }
    this.botWait -= dt;
    if (this.botWait > 0) return;
    this.botWait = 1.1;

    const total = this.totalDice();
    const own = this.state.dice[this.currentId()] ?? [];
    const b = this.state.bid;
    if (!b) {
      const counts = [0, 0, 0, 0, 0, 0, 0];
      own.forEach((v) => { counts[v] += 1; });
      let f = 1;
      for (let v = 2; v <= 6; v++) if (counts[v] > counts[f]) f = v;
      this.doBid(Math.max(1, Math.round(total * 0.28)), f);
      return;
    }
    const ownCount = own.filter((v) => v === b.face).length;
    const expected = ownCount + (total - own.length) / 6;
    if (b.qty > expected + 0.8 || Math.random() < 0.08) {
      this.doChallenge();
      return;
    }
    // Höher bieten
    if (b.face < 6 && Math.random() < 0.5) this.doBid(b.qty, b.face + 1);
    else this.doBid(b.qty + 1, 1);
  }

  // ── HUD ──
  private buildHud(): void {
    this.bidInfo = el('div', 'bl-bid');
    this.logEl = el('div', 'bl-log');
    this.playersEl = el('div', 'bl-players');
    this.controls = el('div', 'bl-controls');

    const qtyRow = el('div', 'bl-stepper');
    const minus = document.createElement('button'); minus.className = 'bl-step'; minus.textContent = '−';
    const qtyVal = el('span', 'bl-qty'); qtyVal.textContent = '1';
    const plus = document.createElement('button'); plus.className = 'bl-step'; plus.textContent = '+';
    minus.addEventListener('click', () => { this.qty = Math.max(1, this.qty - 1); qtyVal.textContent = String(this.qty); });
    plus.addEventListener('click', () => { this.qty = Math.min(50, this.qty + 1); qtyVal.textContent = String(this.qty); });
    qtyRow.appendChild(minus); qtyRow.appendChild(qtyVal); qtyRow.appendChild(plus);

    const faceRow = el('div', 'bl-faces');
    const faces: HTMLButtonElement[] = [];
    for (let f = 1; f <= 6; f++) {
      const b = document.createElement('button');
      b.className = 'bl-face';
      b.textContent = '⚀⚁⚂⚃⚄⚅'[f - 1];
      b.addEventListener('click', () => { this.face = f; faces.forEach((x, i) => x.classList.toggle('sel', i === f - 1)); });
      if (f === 1) b.classList.add('sel');
      faces.push(b);
      faceRow.appendChild(b);
    }

    const bidBtn = document.createElement('button');
    bidBtn.className = 'bl-bidbtn';
    bidBtn.textContent = 'Bieten';
    bidBtn.addEventListener('click', () => this.intent({ type: 'bid', qty: this.qty, face: this.face }));

    const doubtBtn = document.createElement('button');
    doubtBtn.className = 'bl-doubtbtn';
    doubtBtn.textContent = 'Zweifeln!';
    doubtBtn.addEventListener('click', () => this.intent({ type: 'challenge' }));

    const row = el('div', 'bl-actionrow');
    row.appendChild(bidBtn); row.appendChild(doubtBtn);

    this.controls.appendChild(this.bidInfo);
    this.controls.appendChild(qtyRow);
    this.controls.appendChild(faceRow);
    this.controls.appendChild(row);

    this.hudRoot.appendChild(this.playersEl);
    this.hudRoot.appendChild(this.logEl);
    this.hudRoot.appendChild(this.controls);
  }

  private intent(m: Record<string, unknown>): void {
    if (!this.isMyTurn() || this.state.phase !== 'play' || this.state.reveal) return;
    if (this.ctx.isHost) this.handleIntent(m, this.ctx.myId);
    else this.ctx.sendIntent(m);
  }

  private isMyTurn(): boolean { return this.currentId() === this.ctx.myId; }

  private render(): void {
    const me = this.players[this.state.turn];
    this.header.text = this.state.phase === 'done' ? '🏆 Spiel beendet' : `Am Zug: ${me?.name ?? ''}`;
    this.header.color = me?.color ?? '#ffffff';
    this.header.sync();

    this.logEl.textContent = this.state.log;
    this.bidInfo.textContent = this.state.bid
      ? `Aktuell: ${this.state.bid.qty}× ${'⚀⚁⚂⚃⚄⚅'[this.state.bid.face - 1]}`
      : 'Noch kein Gebot';

    this.playersEl.innerHTML = '';
    for (const p of this.players) {
      const n = this.state.dice[p.id]?.length ?? 0;
      const chip = el('div', 'bl-pchip');
      chip.style.color = p.color;
      chip.textContent = `${p.name}${p.isBot ? ' 🤖' : ''} · ${n} 🎲`;
      if (this.players[this.state.turn]?.id === p.id) chip.classList.add('active');
      if (n === 0) chip.classList.add('out');
      this.playersEl.appendChild(chip);
    }

    const myTurn = this.isMyTurn() && this.state.phase === 'play' && !this.state.reveal;
    this.controls.style.opacity = myTurn ? '1' : '0.4';
    Array.from(this.controls.querySelectorAll('button')).forEach((b) => { (b as HTMLButtonElement).disabled = !myTurn; });

    if (this.state.reveal) {
      const r = this.state.reveal;
      const counts = [0, 0, 0, 0, 0, 0, 0];
      for (const p of this.players) (this.state.dice[p.id] ?? []).forEach((v) => { counts[v] += 1; });
      const detail = counts.slice(1).map((c, i) => `${'⚀⚁⚂⚃⚄⚅'[i]}×${c}`).join('  ');
      this.bidInfo.textContent = `Aufgedeckt: ${detail}`;
      window.clearTimeout(this._revealTimer);
      this._revealTimer = window.setTimeout(() => {
        this.state.reveal = null;
        this.render();
      }, 3200);
      void r;
    }
  }
  private _revealTimer = 0;

  private showWinner(name: string): void {
    const again = document.createElement('button');
    again.className = 'bl-bidbtn';
    again.textContent = '🔁 Nochmal';
    again.disabled = !this.ctx.isHost;
    again.textContent = this.ctx.isHost ? '🔁 Nochmal' : '⏳ Warte auf Host…';
    again.addEventListener('click', () => { if (!this.ctx.isHost) return; this.ctx.clearOverlay(); this.ctx.rematch(); });
    this.ctx.overlay([h('div', '', '🏆'), h('h1', '', name), h('p', '', 'gewinnt!'), again]);
  }

  dispose(): void {
    this.dset.dispose();
    this.ctx.scene.remove(this.header);
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
