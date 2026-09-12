/**
 * Würfel-Poker (Yahtzee) — 5 Würfel, 3 Würfe, 13 Kategorien.
 * Turn-basiert, host-autoritativ, mit Bots.
 */
import { Text } from 'troika-three-text';
import { DiceSet } from '../core/dice';
import type { GameCtx, GameInstance, GameModule, Player } from '../core/types';

type Cat =
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'three' | 'four' | 'fullHouse' | 'small' | 'large' | 'yahtzee' | 'chance';

const CATS: { id: Cat; label: string; hint: string }[] = [
  { id: 'ones', label: 'Einser', hint: 'Summe der Einsen' },
  { id: 'twos', label: 'Zweier', hint: 'Summe der Zweien' },
  { id: 'threes', label: 'Dreier', hint: 'Summe der Dreien' },
  { id: 'fours', label: 'Vierer', hint: 'Summe der Vieren' },
  { id: 'fives', label: 'Fünfer', hint: 'Summe der Fünfen' },
  { id: 'sixes', label: 'Sechser', hint: 'Summe der Sechsen' },
  { id: 'three', label: 'Dreierpasch', hint: '3 gleiche → Summe' },
  { id: 'four', label: 'Viererpasch', hint: '4 gleiche → Summe' },
  { id: 'fullHouse', label: 'Full House', hint: '3+2 → 25' },
  { id: 'small', label: 'Kleine Straße', hint: '4 in Folge → 30' },
  { id: 'large', label: 'Große Straße', hint: '5 in Folge → 40' },
  { id: 'yahtzee', label: 'Kniffel', hint: '5 gleiche → 50' },
  { id: 'chance', label: 'Chance', hint: 'Summe aller' },
];

function scoreCat(cat: Cat, dice: number[]): number {
  const c = [0, 0, 0, 0, 0, 0, 0];
  dice.forEach((v) => { c[v] = (c[v] ?? 0) + 1; });
  const sum = dice.reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...c);
  switch (cat) {
    case 'ones': return c[1] * 1;
    case 'twos': return c[2] * 2;
    case 'threes': return c[3] * 3;
    case 'fours': return c[4] * 4;
    case 'fives': return c[5] * 5;
    case 'sixes': return c[6] * 6;
    case 'three': return maxCount >= 3 ? sum : 0;
    case 'four': return maxCount >= 4 ? sum : 0;
    case 'fullHouse': return (maxCount === 3 && c.includes(2)) || maxCount === 5 ? 25 : 0;
    case 'small': {
      const s = new Set(dice);
      const runs = [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]];
      return runs.some((r) => r.every((x) => s.has(x))) ? 30 : 0;
    }
    case 'large': {
      const s = [...new Set(dice)].sort().join('');
      return s === '12345' || s === '23456' ? 40 : 0;
    }
    case 'yahtzee': return maxCount === 5 ? 50 : 0;
    case 'chance': return sum;
  }
}

interface PokerState {
  phase: 'play' | 'done';
  turn: number;
  rollsLeft: number;
  dice: number[];
  kept: boolean[];
  scores: Record<string, Partial<Record<Cat, number>>>;
  rollSeq: number;
  log: string;
}

const rnd = () => 1 + Math.floor(Math.random() * 6);

export const pokerModule: GameModule = {
  id: 'poker',
  title: 'Würfel-Poker',
  minPlayers: 2,
  maxPlayers: 6,
  create(ctx: GameCtx): GameInstance {
    return new PokerGame(ctx);
  },
};

class PokerGame implements GameInstance {
  private ctx: GameCtx;
  private dset: DiceSet;
  private header: Text;
  private players: Player[] = [];

  private state: PokerState = {
    phase: 'play', turn: 0, rollsLeft: 3, dice: [1, 1, 1, 1, 1], kept: [false, false, false, false, false],
    scores: {}, rollSeq: 0, log: 'Bereit',
  };

  private hudRoot: HTMLElement;
  private diceChips: HTMLButtonElement[] = [];
  private rollBtn!: HTMLButtonElement;
  private rollInfo!: HTMLElement;
  private catGrid!: HTMLElement;
  private logEl!: HTMLElement;
  private botWait = 0;
  private botStep = 0;
  private appliedSeq = -1;
  private shownResults = false;

  constructor(ctx: GameCtx) {
    this.ctx = ctx;

    this.header = new Text();
    this.header.fontSize = 0.34;
    this.header.color = '#ffffff';
    this.header.anchorX = 'center';
    this.header.anchorY = 'middle';
    this.header.maxWidth = 5;
    this.header.position.set(0, 3.0, -1.2);
    this.header.sync();
    ctx.scene.add(this.header);

    this.dset = new DiceSet(ctx.scene, 5, { size: 0.72, spacing: 0.92, y: 0.5 });
    this.dset.dice.forEach((d) => { d.baseY = 0.5; d.mesh.position.y = 0.5; });

    this.hudRoot = document.createElement('div');
    this.hudRoot.className = 'bp-root';
    ctx.hud.appendChild(this.hudRoot);
    this.buildHud();
  }

  setPlayers(p: Player[]): void {
    this.players = p;
    // Bestehende Punkte NICHT löschen (Roster-Änderungen dürfen das Spiel nicht resetten).
    for (const pl of p) {
      if (!this.state.scores[pl.id]) this.state.scores[pl.id] = {};
    }
    this.render();
  }

  start(): void {
    this.state = {
      phase: 'play', turn: 0, rollsLeft: 3, dice: [1, 1, 1, 1, 1], kept: [false, false, false, false, false],
      scores: {}, rollSeq: 0, log: 'Am Zug',
    };
    this.players.forEach((pl) => { this.state.scores[pl.id] = {}; });
    this.shownResults = false;
    this.rollAll();
  }

  private showResults(): void {
    const myTotal = Object.values(this.state.scores[this.ctx.myId] ?? {}).reduce((a, b) => a + (b ?? 0), 0);
    this.ctx.postScore('poker', myTotal);
    const totals = this.players.map((p) => ({
      p,
      total: Object.values(this.state.scores[p.id] ?? {}).reduce((a, b) => a + (b ?? 0), 0),
    })).sort((a, b) => b.total - a.total);
    const box = el('div', 'roster');
    totals.forEach((t, i) => {
      const row = el('div', 'row');
      const name = el('span', '');
      name.textContent = `${i + 1}. ${t.p.name}`;
      const val = el('span', '');
      val.textContent = String(t.total);
      row.appendChild(name);
      row.appendChild(val);
      box.appendChild(row);
    });
    const again = document.createElement('button');
    again.className = 'btn';
    again.textContent = '🔁 Nochmal';
    again.addEventListener('click', () => {
      this.ctx.clearOverlay();
      if (this.ctx.isHost) this.start();
    });
    this.ctx.overlay([h('h1', '', '🏆 Ergebnis'), box, again]);
  }

  // ── HUD ──
  private buildHud(): void {
    const bar = el('div', 'bp-rollbar');
    this.rollInfo = el('div', 'bp-rollinfo');
    this.rollBtn = btn('🎲 Würfeln', 'bp-btn', () => this.intent({ type: 'roll' }));
    bar.appendChild(this.rollInfo);
    bar.appendChild(this.rollBtn);

    const chips = el('div', 'bp-chips');
    for (let i = 0; i < 5; i++) {
      const b = btn('?', 'bp-chip', () => this.intent({ type: 'keep', index: i }));
      chips.appendChild(b);
      this.diceChips.push(b);
    }

    this.catGrid = el('div', 'bp-cats');
    this.logEl = el('div', 'bp-log');

    this.hudRoot.appendChild(this.logEl);
    this.hudRoot.appendChild(this.catGrid);
    this.hudRoot.appendChild(chips);
    this.hudRoot.appendChild(bar);
  }

  private isMyTurn(): boolean {
    return this.players[this.state.turn]?.id === this.ctx.myId;
  }

  private intent(m: Record<string, unknown>): void {
    if (!this.isMyTurn() || this.state.phase !== 'play') return;
    if (this.ctx.isHost) this.applyIntent(m, this.ctx.myId);
    else this.ctx.sendIntent(m);
  }

  // ── Regeln (Host) ──
  private rollAll(): void {
    const idx: number[] = [];
    for (let i = 0; i < 5; i++) if (!this.state.kept[i]) idx.push(i);
    if (this.state.rollsLeft <= 0 || idx.length === 0) return;
    const targets = this.state.dice.slice();
    idx.forEach((i) => { targets[i] = rnd(); });
    this.state.dice = targets;
    this.state.rollsLeft -= 1;
    this.state.rollSeq += 1;
    this.state.log = `Wurf ${3 - this.state.rollsLeft}/3`;
    this.dset.roll(targets, idx);
    this.afterChange();
  }

  private toggleKeep(i: number): void {
    this.state.kept[i] = !this.state.kept[i];
    this.dset.setKept(i, this.state.kept[i]);
    this.afterChange();
  }

  private chooseCat(cat: Cat): void {
    if (this.state.scores[this.currentId()]?.[cat] !== undefined) return;
    const pts = scoreCat(cat, this.state.dice);
    (this.state.scores[this.currentId()] ??= {})[cat] = pts;
    this.state.log = `${this.currentName()}: ${cat} = ${pts}`;
    this.nextTurn();
  }

  private nextTurn(): void {
    const done = this.players.every((p) => Object.keys(this.state.scores[p.id] ?? {}).length >= 13);
    if (done) {
      this.state.phase = 'done';
      this.state.log = 'Spiel beendet';
      this.afterChange();
      return;
    }
    do {
      this.state.turn = (this.state.turn + 1) % this.players.length;
    } while (Object.keys(this.state.scores[this.players[this.state.turn].id] ?? {}).length >= 13);
    this.state.rollsLeft = 3;
    this.state.kept = [false, false, false, false, false];
    this.state.dice = [1, 1, 1, 1, 1];
    this.dset.dice.forEach((_, i) => this.dset.setKept(i, false));
    this.state.log = `${this.currentName()} ist am Zug`;
    this.afterChange();
    this.rollAll();
  }

  private applyIntent(m: Record<string, unknown>, from: string): void {
    if (this.players[this.state.turn]?.id !== from) return;
    if (m.type === 'roll') this.rollAll();
    else if (m.type === 'keep' && typeof m.index === 'number') this.toggleKeep(m.index);
    else if (m.type === 'cat' && typeof m.cat === 'string') this.chooseCat(m.cat as Cat);
  }

  handleIntent(m: Record<string, unknown>, from: string): void {
    this.applyIntent(m, from);
  }

  private currentId(): string { return this.players[this.state.turn]?.id ?? ''; }
  private currentName(): string { return this.players[this.state.turn]?.name ?? ''; }

  private afterChange(): void {
    this.render();
    this.ctx.sendState(this.snapshot());
  }

  // ── Sync ──
  private snapshot(): PokerState {
    return { ...this.state, dice: [...this.state.dice], kept: [...this.state.kept], scores: JSON.parse(JSON.stringify(this.state.scores)) };
  }

  getState(): unknown { return this.snapshot(); }

  applyState(s: unknown): void {
    const st = s as PokerState;
    const newRoll = st.rollSeq !== this.appliedSeq;
    this.appliedSeq = st.rollSeq;
    this.state = { ...st, dice: [...st.dice], kept: [...st.kept], scores: JSON.parse(JSON.stringify(st.scores)) };
    if (newRoll) {
      const idx = st.dice.map((_, i) => i).filter((i) => !st.kept[i]);
      if (idx.length) this.dset.roll(st.dice, idx);
      else this.dset.setValues(st.dice, true);
    } else {
      this.dset.setValues(st.dice, true);
    }
    st.kept.forEach((k, i) => this.dset.setKept(i, k));
    if (st.phase !== 'done' && this.shownResults) {
      this.shownResults = false;
      this.ctx.clearOverlay();
    }
    this.render();
  }

  // ── Bots ──
  update(dt: number): void {
    this.dset.update(dt);
    if (!this.ctx.isHost || this.state.phase !== 'play') return;
    const bot = this.players[this.state.turn]?.isBot;
    if (!bot) { this.botStep = 0; this.botWait = 0; return; }
    this.botWait -= dt;
    if (this.botWait > 0) return;
    if (this.state.rollsLeft > 0) {
      // Würfel mit häufigstem Wert behalten
      const counts = [0, 0, 0, 0, 0, 0, 0];
      this.state.dice.forEach((v) => { counts[v] += 1; });
      let best = 1;
      for (let v = 2; v <= 6; v++) if (counts[v] > counts[best]) best = v;
      for (let i = 0; i < 5; i++) {
        const keep = this.state.dice[i] === best || this.state.dice[i] >= 5;
        if (this.state.kept[i] !== keep) { this.state.kept[i] = keep; this.dset.setKept(i, keep); }
      }
      // Nur würfeln, wenn überhaupt ein Würfel zum Neuwerfen frei ist —
      // sonst direkt eine Kategorie wählen (verhindert Endlos-Hänger).
      if (this.state.kept.some((k) => !k)) {
        this.botWait = 0.9;
        this.rollAll();
        return;
      }
    }
    // Beste Kategorie wählen
    let bestCat: Cat = 'chance';
    let bestPts = -1;
    for (const c of CATS) {
      if (this.state.scores[this.currentId()]?.[c.id] !== undefined) continue;
      const p = scoreCat(c.id, this.state.dice);
      if (p > bestPts) { bestPts = p; bestCat = c.id; }
    }
    this.botStep += 1;
    this.botWait = 1.0;
    this.chooseCat(bestCat);
  }

  // ── Render ──
  private render(): void {
    const me = this.players[this.state.turn];
    this.header.text = this.state.phase === 'done'
      ? '🏆 Spiel beendet'
      : `Am Zug: ${me?.name ?? ''}`;
    this.header.color = me?.color ?? '#ffffff';
    this.header.sync();

    this.logEl.textContent = this.state.log;

    const myTurn = this.isMyTurn() && this.state.phase === 'play';
    this.rollBtn.disabled = !myTurn || this.state.rollsLeft <= 0;
    this.rollInfo.textContent = myTurn ? `Würfe übrig: ${this.state.rollsLeft}` : 'Warte…';

    this.diceChips.forEach((c, i) => {
      c.textContent = this.state.dice[i] ? '⚀⚁⚂⚃⚄⚅'[this.state.dice[i] - 1] : '?';
      c.classList.toggle('kept', !!this.state.kept[i]);
      c.disabled = !myTurn;
    });

    this.catGrid.innerHTML = '';
    for (const c of CATS) {
      const used = this.state.scores[this.ctx.myId]?.[c.id];
      const b = btn('', 'bp-cat', () => this.intent({ type: 'cat', cat: c.id }));
      const name = el('span', 'nm');
      name.textContent = c.label;
      const val = el('span', 'vl');
      val.textContent = used !== undefined ? String(used) : String(scoreCat(c.id, this.state.dice));
      b.appendChild(name);
      b.appendChild(val);
      if (used !== undefined) b.classList.add('used');
      b.disabled = !myTurn || used !== undefined;
      this.catGrid.appendChild(b);
    }

    if (this.state.phase === 'done' && !this.shownResults) {
      this.shownResults = true;
      this.showResults();
    }
  }

  dispose(): void {
    this.dset.dispose();
    this.ctx.scene.remove(this.header);
    this.header.dispose?.();
    this.hudRoot.remove();
  }
}

// DOM-Helfer
function el(tag: string, cls: string): HTMLElement {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}
function btn(text: string, cls: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = cls;
  b.textContent = text;
  b.addEventListener('click', onClick);
  return b;
}
function h(tag: string, cls: string, text: string): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.textContent = text;
  return e;
}
