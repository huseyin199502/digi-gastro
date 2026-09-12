/**
 * digi-gastro Quiz Show — Entry, HUD, Overlays und Multiplayer.
 *
 * ?net=<ws-url>&name=<name>&mode=create|join|public&room=<code>
 * Ohne `net`: Einzelspieler (Du gegen 3 Bots).
 */
import './style.css';
import { Client } from '@colyseus/sdk';
import { QuizShow, type QuizPlayer, type QuizSnapshot } from './game';

const ANSWER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
const LETTERS = ['A', 'B', 'C', 'D'];
const QUESTION_TIME = 15;

const params = new URLSearchParams(window.location.search);
const net = params.get('net');
const myName = params.get('name') || 'Du';
const mode = params.get('mode') || 'public';
const roomParam = params.get('room') || '';

const app = document.getElementById('app') as HTMLElement;
const show = new QuizShow(app, !net);
show.authoritative = !net;

const myIdInit = 'me';
let myId = myIdInit;

// ── DOM ──────────────────────────────────────────────────────────────
function el(tag: string, cls = ''): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}
function mk(tag: string, cls: string, text: string): HTMLElement {
  const e = el(tag, cls);
  e.textContent = text;
  return e;
}

const hud = el('div', 'qz-hud');
app.appendChild(hud);

const top = el('div', 'qz-top');
top.appendChild(mk('div', 'qz-brand', '🎬 digi-gastro Quiz'));
const timeChip = mk('div', 'qz-count', '15s');
top.appendChild(timeChip);
hud.appendChild(top);

const scores = el('div', 'qz-scores');
hud.appendChild(scores);

const timer = el('div', 'qz-timer');
const timerFill = el('div');
timer.appendChild(timerFill);
hud.appendChild(timer);

const answersEl = el('div', 'qz-answers');
const answerBtns: HTMLButtonElement[] = [];
for (let i = 0; i < 4; i++) {
  const b = document.createElement('button');
  const badge = mk('span', 'badge', LETTERS[i]);
  badge.style.background = ANSWER_COLORS[i];
  const txt = mk('span', 'txt', '');
  b.appendChild(badge);
  b.appendChild(txt);
  b.addEventListener('click', () => onAnswer(i));
  answersEl.appendChild(b);
  answerBtns.push(b);
}
hud.appendChild(answersEl);

function renderHud(s: QuizSnapshot): void {
  scores.innerHTML = '';
  s.players.forEach((p) => {
    const c = el('div', 'qz-score');
    c.style.color = p.color;
    const nm = mk('div', 'nm', p.isBot ? `${p.name} 🤖` : p.name);
    nm.style.color = '#fff';
    const pt = mk('div', 'pt', String(p.score));
    c.appendChild(nm);
    c.appendChild(pt);
    if (p.choice !== null) {
      const tag = mk('div', 'tag', LETTERS[p.choice]);
      tag.style.color = p.color;
      c.appendChild(tag);
    }
    scores.appendChild(c);
  });

  for (let i = 0; i < 4; i++) {
    const txt = answerBtns[i].querySelector('.txt') as HTMLElement;
    txt.textContent = s.answers[i] ?? '';
    answerBtns[i].disabled = s.phase !== 'question';
    answerBtns[i].className = '';
    const badge = answerBtns[i].querySelector('.badge') as HTMLElement;
    badge.style.background = ANSWER_COLORS[i];
  }

  if (s.phase === 'reveal' && s.correct !== null) {
    answerBtns.forEach((b, i) => {
      if (i === s.correct) b.classList.add('correct');
      else if (s.players.some((p) => p.choice === i && i !== s.correct)) b.classList.add('wrong');
      else b.classList.add('dim');
    });
  }
}

function renderTimer(frac: number, seconds: number): void {
  timerFill.style.transform = `scaleX(${Math.max(0, Math.min(1, frac))})`;
  timeChip.textContent = `${Math.max(0, Math.ceil(seconds))}s`;
}

function overlay(children: HTMLElement[]): HTMLElement {
  const o = el('div', 'qz-overlay');
  const card = el('div', 'qz-card');
  children.forEach((c) => card.appendChild(c));
  o.appendChild(card);
  app.appendChild(o);
  return o;
}

function clearOverlays(): void {
  document.querySelectorAll('.qz-overlay').forEach((o) => o.remove());
}

function centerText(text: string, ms: number): void {
  const c = mk('div', 'qz-center', text);
  app.appendChild(c);
  window.setTimeout(() => c.remove(), ms);
}

// ── Zustand ──────────────────────────────────────────────────────────
let room: any = null;
let host = false;
let roster: { ids: string[]; names: string[] } = { ids: [], names: [] };
let started = false;
let shownResults = false;

function botPlayers(startIndex: number): QuizPlayer[] {
  const out: QuizPlayer[] = [];
  for (let i = startIndex; i < 4; i++) {
    out.push({ id: `bot${i}`, name: `Bot ${i}`, color: ANSWER_COLORS[i], isBot: true, score: 0, choice: null });
  }
  return out;
}

function startSingle(): void {
  const players: QuizPlayer[] = [
    { id: myId, name: myName, color: ANSWER_COLORS[0], isBot: false, score: 0, choice: null },
    ...botPlayers(1),
  ];
  show.setPlayers(players);
  centerText('3', 700);
  window.setTimeout(() => centerText('2', 700), 700);
  window.setTimeout(() => centerText('1', 700), 1400);
  window.setTimeout(() => {
    centerText('LOS!', 700);
    show.start();
  }, 2100);
}

function onAnswer(index: number): void {
  if (show.phase !== 'question') return;
  if (index < 0 || index > 3) return;
  if (net && !host) {
    room?.send('intent', { type: 'answer', index });
    const me = show.players.find((p) => p.id === myId);
    if (me && me.choice === null) {
      me.choice = index;
      // Aus dem letzten HOST-Snapshot rendern (nicht aus der lokalen Reihenfolge).
      renderHud({ ...(lastSnap ?? show.getSnapshot()), players: show.players.map((p) => ({ ...p })) });
    }
    return;
  }
  show.answer(myId, index);
}

let lastSnap: QuizSnapshot | null = null;
let lastConfig: { ids: string[]; names: string[] } = { ids: [], names: [] };

// ── Reaktion auf Zustandsänderungen ──────────────────────────────────
show.onSelectAnswer = (i) => onAnswer(i);
show.onChange = (s) => {
  renderHud(s);
  if (host && room) room.send('state', s);
  if (s.phase === 'results' && !shownResults) {
    shownResults = true;
    showResults(s);
  } else if (s.phase !== 'results') {
    shownResults = false;
  }
};

let lastEmit = 0;
function frame(): void {
  const s = show.getSnapshot();
  renderTimer(s.timeLeft / QUESTION_TIME, s.timeLeft);
  if (host && room && s.phase === 'question' && performance.now() - lastEmit > 300) {
    lastEmit = performance.now();
    room.send('state', s);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function showResults(s: QuizSnapshot): void {
  // Eigenes Ergebnis an den Wrapper melden (Highscore/Rekord).
  const me = s.players.find((p) => p.id === myId);
  if (me && !me.isBot) {
    try {
      window.parent?.postMessage({ type: 'game:score', game: 'quiz', score: me.score }, '*');
    } catch {
      /* ignore */
    }
  }
  const ranked = s.players.slice().sort((a, b) => b.score - a.score);
  const box = el('div', 'qz-ranks');
  ranked.forEach((p, i) => {
    const row = el('div', 'row');
    row.appendChild(mk('span', '', `${i + 1}. ${p.name}`));
    row.appendChild(mk('span', '', String(p.score)));
    box.appendChild(row);
  });
  const again = mk('button', net && !host ? 'qz-btn ghost' : 'qz-btn', net && !host ? '⏳ Warte auf Host…' : '🔁 Nochmal') as HTMLButtonElement;
  again.disabled = !!(net && !host);
  again.addEventListener('click', () => {
    if (net && !host) return; // Gast: der Host startet die neue Runde
    clearOverlays();
    if (net && host) room?.send('start', lastConfig);
    show.restart();
  });
  overlay([mk('h1', '', '🏆 Ergebnis'), box, again]);
}

// ── Multiplayer ──────────────────────────────────────────────────────
function renderLobby(code: string): void {
  if (started) return;
  clearOverlays();
  const kids: HTMLElement[] = [
    mk('div', '', '🎬'),
    mk('h1', '', 'digi-gastro Quiz'),
    mk('p', '', host ? 'Tisch-Duell' : 'Warte auf den Host…'),
  ];
  const codeBox = el('div', 'qz-code');
  codeBox.appendChild(mk('div', 'lbl', 'Raum-Code'));
  codeBox.appendChild(mk('div', 'val', code));
  codeBox.appendChild(mk('div', 'lbl', 'Freunde: Code eingeben'));
  kids.push(codeBox);

  const rosterBox = el('div', 'qz-roster');
  roster.ids.forEach((id, i) => {
    const row = el('div', 'row');
    row.appendChild(mk('span', '', `● ${roster.names[i] || `Tisch ${i + 1}`}${id === myId ? ' (Du)' : ''}`));
    row.appendChild(mk('span', '', ['rot', 'blau', 'grün', 'gelb'][i]));
    rosterBox.appendChild(row);
  });
  for (let i = roster.ids.length; i < 4; i++) {
    const row = el('div', 'row');
    row.appendChild(mk('span', '', '🤖 Bot'));
    row.appendChild(mk('span', '', ['rot', 'blau', 'grün', 'gelb'][i]));
    rosterBox.appendChild(row);
  }
  kids.push(rosterBox);

  if (host) {
    const btn = mk('button', 'qz-btn', '🚀 Spiel starten') as HTMLButtonElement;
    btn.addEventListener('click', () => {
      const config = { ids: roster.ids, names: roster.names };
      room?.send('start', config);
      startNetGame(config);
    });
    kids.push(btn);
  }
  overlay(kids);
}

function startNetGame(config: { ids: string[]; names: string[] }): void {
  lastConfig = { ids: config.ids || [], names: config.names || [] };
  const humans = config.ids || [];
  const players: QuizPlayer[] = humans.map((id, i) => ({
    id,
    name: (config.names && config.names[i]) || `Tisch ${i + 1}`,
    color: ANSWER_COLORS[i],
    isBot: false,
    score: 0,
    choice: null,
  }));
  show.setPlayers([...players, ...botPlayers(humans.length)]);
  started = true;
  clearOverlays();
  if (host) show.start();
}

function showStart(): void {
  const btn = mk('button', 'qz-btn', '▶ Spiel starten') as HTMLButtonElement;
  btn.addEventListener('click', () => {
    clearOverlays();
    startSingle();
  });
  overlay([
    mk('div', '', '🎬'),
    mk('h1', '', 'digi-gastro Quiz'),
    mk('p', '', '3D-Quizshow · Du gegen 3 Bots'),
    btn,
  ]);
}

function post(msg: unknown): void {
  try {
    window.parent?.postMessage(msg, '*');
  } catch {
    /* ignore */
  }
}

function joinNet(): void {
  const client = new Client(net as string);
  const joining =
    mode === 'create'
      ? client.create('quiz', { name: myName })
      : roomParam
        ? client.joinById(roomParam, { name: myName })
        : client.joinOrCreate('quiz', { name: myName });

  joining
    .then((r) => {
      room = r;
      myId = r.sessionId ?? myIdInit;
      post({ type: 'kart:room', roomId: r.roomId });
      room.onMessage('role', (m: { isHost: boolean }) => {
        host = !!m.isHost;
        show.authoritative = host;
        renderLobby(r.roomId);
      });
      room.onMessage('roster', (m: { ids: string[]; names: string[] }) => {
        roster = { ids: m.ids || [], names: m.names || [] };
        // Host zuverlässig bestimmen: erster Client im Raum.
        const first = roster.ids[0];
        host = !!first && first === myId;
        show.authoritative = host;
        renderLobby(r.roomId);
      });
      room.onMessage('start', (m: { ids: string[]; names: string[] }) => startNetGame(m));
      room.onMessage('state', (s: QuizSnapshot) => {
        if (host) return;
        lastSnap = s;
        show.applySnapshot(s);
        renderHud(s);
        renderTimer(s.timeLeft / QUESTION_TIME, s.timeLeft);
        // Gäste brauchen das Ergebnis-Overlay ebenfalls.
        if (s.phase === 'results' && !shownResults) {
          shownResults = true;
          showResults(s);
        } else if (s.phase !== 'results') {
          shownResults = false;
          clearOverlays();
        }
      });
      room.onMessage('intent', (m: { type: string; index?: number; from: string }) => {
        if (!host) return;
        if (m.type === 'answer' && typeof m.index === 'number' && m.index >= 0 && m.index <= 3) {
          show.answer(m.from, m.index);
        }
      });
      room.send('hello');
      renderLobby(r.roomId);
    })
    .catch((e: unknown) => {
      const message = e instanceof Error ? e.message : String(e);
      post({ type: 'kart:room-error', message });
      const back = mk('button', 'qz-btn ghost', 'Zurück') as HTMLButtonElement;
      back.addEventListener('click', () => window.location.reload());
      overlay([mk('h1', '', 'Verbindung fehlgeschlagen'), mk('p', '', message), back]);
    });
}

// Los
if (net) joinNet();
else if (params.get('auto') === '1') startSingle();
else showStart();
