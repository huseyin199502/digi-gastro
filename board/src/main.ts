/**
 * digi-gastro Play World — gemeinsame 3D-Bühne + Multiplayer für
 * Bingo, Würfel-Poker und Lügen-Dice.
 *
 * ?game=bingo|poker|liar&net=<ws>&name=<name>&mode=create|join|public&room=<code>
 * Ohne `net`: Einzelspieler gegen Bots.
 */
import './style.css';
import * as THREE from 'three';
import { Client } from '@colyseus/sdk';
import type { GameCtx, GameInstance, GameModule, Player } from './core/types';
import { bingoModule } from './games/bingo';
import { pokerModule } from './games/poker';
import { liarModule } from './games/liar';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4'];

const params = new URLSearchParams(window.location.search);
const gameId = params.get('game') || 'poker';
const net = params.get('net');
const myName = params.get('name') || 'Du';
const mode = params.get('mode') || 'public';
const roomParam = params.get('room') || '';

const MODULES: Record<string, GameModule> = { bingo: bingoModule, poker: pokerModule, liar: liarModule };
const module = MODULES[gameId] ?? pokerModule;

const app = document.getElementById('app') as HTMLElement;

// ── 3D-Bühne ──
const isMobile =
  (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) ||
  (navigator.maxTouchPoints ?? 0) > 0;
const dprCap = isMobile ? 1.5 : 2;

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08061c);
scene.fog = new THREE.FogExp2(0x08061c, 0.04);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
camera.position.set(0, 4.6, 6.4);
camera.lookAt(0, 1.5, 0);

scene.add(new THREE.HemisphereLight(0x8899ff, 0x140c2e, 0.9));
const key = new THREE.DirectionalLight(0xfff3e0, 1.5);
key.position.set(-3, 8, 5);
scene.add(key);
const rim = new THREE.PointLight(0x7c5cff, 20, 20, 2);
rim.position.set(3, 5, 3);
scene.add(rim);

// Spieltisch
const table = new THREE.Mesh(
  new THREE.CylinderGeometry(5.2, 5.4, 0.4, 64),
  new THREE.MeshStandardMaterial({ color: 0x171238, roughness: 0.6, metalness: 0.35 }),
);
table.position.y = -0.2;
scene.add(table);
const felt = new THREE.Mesh(
  new THREE.CircleGeometry(4.6, 64),
  new THREE.MeshStandardMaterial({ color: 0x123024, roughness: 0.9, metalness: 0.05 }),
);
felt.rotation.x = -Math.PI / 2;
felt.position.y = 0.01;
scene.add(felt);

// Sterne
const starPos = new Float32Array(300 * 3);
for (let i = 0; i < 300; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 40;
  starPos[i * 3 + 1] = Math.random() * 16 - 2;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 6;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x9fc8ff, size: 0.06, transparent: true, opacity: 0.8 }));
scene.add(stars);

// ── HUD ──
const hud = document.createElement('div');
hud.className = 'hud';
app.appendChild(hud);

const topbar = document.createElement('div');
topbar.className = 'topbar';
topbar.innerHTML = `<div class="brand">🎲 digi-gastro · ${module.title}</div><div class="status" id="status">Bereit</div>`;
hud.appendChild(topbar);

const gameHud = document.createElement('div');
gameHud.className = 'gamehud';
hud.appendChild(gameHud);

const statusEl = topbar.querySelector('#status') as HTMLElement;

function overlay(nodes: HTMLElement[]): HTMLElement {
  const o = document.createElement('div');
  o.className = 'ovl';
  const card = document.createElement('div');
  card.className = 'ovl-card';
  nodes.forEach((n) => card.appendChild(n));
  o.appendChild(card);
  app.appendChild(o);
  return o;
}
function clearOverlay(): void {
  document.querySelectorAll('.ovl').forEach((o) => o.remove());
}
function toast(msg: string, ms = 2200): void {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  hud.appendChild(t);
  window.setTimeout(() => t.remove(), ms);
}
function h(tag: string, cls: string, text: string): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.textContent = text;
  return e;
}

// ── Zustand ──
let room: any = null;
let host = !net;
let myId = 'me';
let players: Player[] = [];
let started = false;
let game: GameInstance | null = null;

function botFill(humans: Player[]): Player[] {
  const total = 4;
  const out = humans.slice(0, module.maxPlayers);
  for (let i = out.length; i < total; i++) {
    out.push({ id: `bot${i}`, name: `Bot ${i}`, color: COLORS[i % COLORS.length]!, isBot: true });
  }
  return out;
}

const ctx: GameCtx = {
  scene,
  hud: gameHud,
  overlay,
  clearOverlay,
  toast,
  myId,
  isHost: host,
  myName,
  players,
  sendState: (s) => { if (net && host && room) room.send('state', s); },
  sendIntent: (m) => {
    if (!net || host) game?.handleIntent?.(m as Record<string, unknown>, ctx.myId);
    else room?.send('intent', m);
  },
  postScore: (gameId, score) => {
    try {
      window.parent?.postMessage({ type: 'game:score', game: gameId, score }, '*');
    } catch {
      /* ignore */
    }
  },
};

function setStatus(s: string): void { statusEl.textContent = s; }

function createGame(): void {
  game?.dispose();
  game = module.create(ctx);
  game.setPlayers(players);
}

function startGame(): void {
  if (!game) return;
  started = true;
  clearOverlay();
  setStatus(host ? 'Spiel läuft' : 'Warte auf Host…');
  if (host || !net) game.start();
  else setStatus('Warte auf Host…');
}

// ── Einzelspieler ──
function startSingle(): void {
  players = botFill([{ id: 'me', name: myName, color: COLORS[0]!, isBot: false }]);
  myId = 'me';
  createGame();
  startGame();
}

// ── Overlays ──
function showStart(): void {
  const b = document.createElement('button');
  b.className = 'btn';
  b.textContent = '▶ Spiel starten';
  b.addEventListener('click', () => { clearOverlay(); startSingle(); });
  overlay([h('div', '', '🎲'), h('h1', '', `digi-gastro ${module.title}`), h('p', '', 'Gegen Bots oder Freunde'), b]);
}

function showLobby(code: string): void {
  if (started) return;
  clearOverlay();
  const kids: HTMLElement[] = [h('div', '', '🎲'), h('h1', '', module.title), h('p', '', host ? 'Tisch-Duell' : 'Warte auf Host…')];
  const codeBox = document.createElement('div');
  codeBox.className = 'code';
  codeBox.appendChild(h('div', 'lbl', 'Raum-Code'));
  codeBox.appendChild(h('div', 'val', code));
  codeBox.appendChild(h('div', 'lbl', 'Freunde: Code eingeben'));
  kids.push(codeBox);

  const roster = document.createElement('div');
  roster.className = 'roster';
  players.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.appendChild(h('span', '', `● ${p.name}${p.id === myId ? ' (Du)' : ''}${p.isBot ? ' 🤖' : ''}`));
    row.appendChild(h('span', '', ['rot', 'blau', 'grün', 'gelb', 'lila', 'cyan'][i] ?? ''));
    roster.appendChild(row);
  });
  kids.push(roster);

  if (host) {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = '🚀 Spiel starten';
    b.addEventListener('click', () => {
      if (room) room.send('start', { ids: players.filter((p) => !p.isBot).map((p) => p.id), names: players.filter((p) => !p.isBot).map((p) => p.name) });
      startGame();
    });
    kids.push(b);
  }
  overlay(kids);
}

// ── Multiplayer ──
function joinNet(): void {
  const client = new Client(net as string);
  const joining =
    mode === 'create' ? client.create('board', { name: myName })
      : roomParam ? client.joinById(roomParam, { name: myName })
        : client.joinOrCreate('board', { name: myName });

  joining.then((r) => {
    room = r;
    myId = r.sessionId ?? 'me';
    ctx.myId = myId;
    try { window.parent?.postMessage({ type: 'kart:room', roomId: r.roomId }, '*'); } catch { /* ignore */ }

    room.onMessage('role', (m: { isHost: boolean }) => {
      host = !!m.isHost; ctx.isHost = host; setStatus(host ? 'Host' : 'Gast'); showLobby(r.roomId);
    });
    room.onMessage('roster', (m: { ids: string[]; names: string[] }) => {
      const ids = m.ids || [];
      const first = ids[0];
      host = !!first && first === myId;
      ctx.isHost = host;
      const humans: Player[] = ids.map((id, i) => ({
        id, name: (m.names && m.names[i]) || `Tisch ${i + 1}`, color: COLORS[i % COLORS.length]!, isBot: false,
      }));
      players = botFill(humans);
      ctx.players = players;
      if (!game) createGame(); else game.setPlayers(players);
      showLobby(r.roomId);
    });
    room.onMessage('start', (m: { ids: string[]; names: string[] }) => {
      const humans: Player[] = (m.ids || []).map((id, i) => ({
        id, name: (m.names && m.names[i]) || `Tisch ${i + 1}`, color: COLORS[i % COLORS.length]!, isBot: false,
      }));
      players = botFill(humans);
      ctx.players = players;
      if (!game) createGame(); else game.setPlayers(players);
      startGame();
    });
    room.onMessage('state', (s: unknown) => { if (!host) game?.applyState(s); });
    room.onMessage('intent', (m: Record<string, unknown> & { from: string }) => {
      if (!host) return;
      const { from, ...rest } = m;
      game?.handleIntent?.(rest, from);
    });
    room.send('hello');
    showLobby(r.roomId);
  }).catch((e: unknown) => {
    const message = e instanceof Error ? e.message : String(e);
    try { window.parent?.postMessage({ type: 'kart:room-error', message }, '*'); } catch { /* ignore */ }
    const back = document.createElement('button');
    back.className = 'btn ghost';
    back.textContent = 'Zurück';
    back.addEventListener('click', () => window.location.reload());
    overlay([h('h1', '', 'Verbindung fehlgeschlagen'), h('p', '', message), back]);
  });
}

// ── Loop ──
let last = performance.now();
function loop(): void {
  const now = performance.now();
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  stars.rotation.y += dt * 0.02;
  game?.update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function resize(): void {
  const w = Math.max(1, app.clientWidth || window.innerWidth);
  const hh = Math.max(1, app.clientHeight || window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setSize(w, hh, false);
  camera.aspect = w / hh;
  camera.fov = camera.aspect < 1 ? 64 : 58;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

createGame();
if (net) {
  joinNet();
} else if (params.get('auto') === '1') {
  clearOverlay();
  startSingle();
} else {
  showStart();
}
loop();
