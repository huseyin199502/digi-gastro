/**
 * Netcode: verbindet das Spiel mit dem digi-gastro Colyseus-Server.
 *
 * Architektur (siehe games/src/rooms/Kart3dRoom.ts):
 * - Server ist Autorität für Lobby, Start (Countdown → „GO"), Runden/Platzierung
 *   und Nachrichten-Rate.
 * - Clients synchronisieren ihre eigene Position (Ghost-Karts) und werten
 *   Kollisionen/Item-Treffer lokal symmetrisch aus.
 *
 * Ablauf:
 *   connect → Lobby (Code + Roster) → Host drückt Start (im Spielmenü)
 *   → 'prepare' (alle bauen die Strecke) → 'go' (alle starten gleichzeitig).
 *
 * Aktiv nur mit `?net=<ws-url>&mode=create|join|public&room=<code>`.
 */
import * as THREE from 'three';
import { Client, type Room } from '@colyseus/sdk';
import { events } from './core/events';
import type { RaceSettings } from './core/types';

interface NetState {
  position: THREE.Vector3;
  heading: number;
  lap: number;
}

interface NetKart {
  state: NetState;
}

interface NetGame {
  netScene: THREE.Scene;
  netKarts: readonly NetKart[];
  enableNetworkMode?: () => void;
  startNetworkRace?: (settings: RaceSettings) => void;
  networkGo?: () => void;
  returnToNetworkLobby?: () => void;
  onNetworkStartRequest?: ((settings: RaceSettings) => void) | null;
  onNetworkRematchRequest?: (() => void) | null;
  readonly currentState?: string;
}

interface RemoteTarget {
  name: string;
  color: string;
  tx: number;
  ty: number;
  tz: number;
  tAngle: number;
}

interface Ghost {
  group: THREE.Group;
  target: RemoteTarget;
}

interface RoomState {
  players?: {
    forEach: (cb: (p: RemotePlayer, key: string) => void) => void;
    size: number;
    get?: (key: string) => RemotePlayer | undefined;
  };
  phase?: string;
  hostId?: string;
  countdownEndsAt?: number;
  code?: string;
  trackId?: string;
}

interface RemotePlayer {
  x: number;
  y: number;
  z: number;
  angleY: number;
  color: string;
  name: string;
  lap: number;
  finished: boolean;
}

// Item-Kategorien für die Trefferauswertung.
const GLOBAL_ITEMS = new Set(['lightning']);
const CONE_ITEMS = new Set(['greenShell', 'redShell', 'blueShell']);
const PROXIMITY_ITEMS = new Set(['banana', 'fakeBox', 'bomb']);
const HARMFUL = new Set([...GLOBAL_ITEMS, ...CONE_ITEMS, ...PROXIMITY_ITEMS]);

const BUMP_DIST = 2.0;
const BUMP_COOLDOWN = 1200;
const BUMP_MIN_APPROACH = 1.0; // minimale Annäherung (Einheiten/s), sonst kein Bump
const ITEM_HIT_DIST = 3.5;
const ITEM_CONE_RANGE = 14;
const ITEM_CONE_DEG = 40;
const ITEM_HIT_COOLDOWN = 1200;

function localKart(game: NetGame): {
  state: { position: THREE.Vector3; heading: number };
  applyHit: (cause: string, source: number) => boolean;
  applyImpulse: (v: THREE.Vector3) => void;
} | null {
  const k = game.netKarts[0] as unknown as {
    state: { position: THREE.Vector3; heading: number };
    applyHit?: (cause: string, source: number) => boolean;
    applyImpulse?: (v: THREE.Vector3) => void;
  } | undefined;
  if (!k || typeof k.applyHit !== 'function' || typeof k.applyImpulse !== 'function') return null;
  return k as never;
}

function makeLabel(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(0, 0, 256, 64, 16);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, 256, 64);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 14), 128, 34);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.4, 0.6, 1);
  sprite.position.y = 2.0;
  return sprite;
}

function makeGhostKart(color: string, name: string): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color });
  const dark = new THREE.MeshStandardMaterial({ color: 0x111318 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 1.1), bodyMat);
  body.position.y = 0.55;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.6), dark);
  cabin.position.set(0, 0.95, -0.05);
  g.add(body, cabin);
  const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 12);
  for (const [wx, wz] of [[-0.75, 0.5], [0.75, 0.5], [-0.75, -0.5], [0.75, -0.5]] as const) {
    const w = new THREE.Mesh(wheelGeo, dark);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, 0.28, wz);
    g.add(w);
  }
  g.add(makeLabel(name));
  return g;
}

// ── Lobby-Overlay ─────────────────────────────────────────────────────
function createLobbyOverlay(isHost: boolean) {
  const el = document.createElement('div');
  el.id = 'kart-netlobby';
  const base =
    'position:fixed;left:50%;transform:translateX(-50%);z-index:9999;font-family:system-ui,sans-serif;' +
    'color:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.55);';
  el.style.cssText = isHost
    ? `${base}top:calc(env(safe-area-inset-top,0px) + 10px);width:min(92vw,420px);padding:12px 14px;` +
      'background:rgba(12,12,26,.82);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.14);pointer-events:auto;'
    : `${base}inset:0;left:0;top:0;transform:none;width:100vw;height:100vh;display:flex;flex-direction:column;` +
      'align-items:center;justify-content:center;background:linear-gradient(160deg,#0b0b1a 0%,#1a1030 100%);text-align:center;padding:24px;';

  const title = document.createElement('div');
  title.textContent = isHost ? '🏁 Multiplayer-Lobby' : '🏁 digi-gastro Kart';
  title.style.cssText = 'font-weight:900;font-size:16px;margin-bottom:8px;';
  el.appendChild(title);

  const codeBox = document.createElement('div');
  codeBox.style.cssText =
    'background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:8px 10px;margin-bottom:10px;';
  codeBox.innerHTML =
    '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.55)">Raum-Code</div>' +
    '<div id="kart-netlobby-code" style="font-size:24px;font-weight:900;letter-spacing:4px">····</div>' +
    '<div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px">Freunde: Code eingeben</div>';
  el.appendChild(codeBox);

  const roster = document.createElement('div');
  roster.id = 'kart-netlobby-roster';
  roster.style.cssText = 'font-size:13px;line-height:1.7;text-align:left;min-width:200px;margin:0 auto 10px;';
  el.appendChild(roster);

  const hint = document.createElement('div');
  hint.id = 'kart-netlobby-hint';
  hint.style.cssText = 'font-size:12px;color:rgba(255,255,255,.6);';
  hint.textContent = isHost ? 'Strecke im Menü wählen und Rennen starten.' : 'Warte auf den Host…';
  el.appendChild(hint);

  document.body.appendChild(el);

  const codeEl = el.querySelector('#kart-netlobby-code') as HTMLElement | null;
  const rosterEl = roster;
  const hintEl = hint;
  return {
    root: el,
    setCode(code: string) {
      if (codeEl) codeEl.textContent = code || '····';
    },
    setRoster(entries: { name: string; isHost: boolean }[]) {
      rosterEl.textContent = '';
      for (const e of entries) {
        const row = document.createElement('div');
        row.textContent = `● ${e.name}${e.isHost ? ' (Host)' : ''}`;
        rosterEl.appendChild(row);
      }
    },
    setHint(text: string) {
      hintEl.textContent = text;
    },
    showCountdown(n: number) {
      hintEl.textContent = `Startet in ${Math.max(0, n)}…`;
    },
    remove() {
      el.remove();
    },
  };
}

export function startNetplay(
  game: NetGame,
  opts: { url: string; name: string; color: string; room?: string; mode?: 'create' | 'join' },
): void {
  const { url, name, color, room: roomCode, mode } = opts;
  if (!url) return;

  const remotes = new Map<string, RemoteTarget>();
  const ghosts = new Map<string, Ghost>();
  const bumpCooldown = new Map<string, number>();
  const lastGhostDist = new Map<string, number>();
  const lastGhostAt = new Map<string, number>();
  const itemCooldown = new Map<string, number>();
  const playerNames = new Map<string, string>();

  let room: Room | null = null;
  let myId = '';
  let finishTime = 0;
  let isHost = false;
  let phase = 'lobby';
  let prevPhase = 'lobby';
  let countdownEndsAt = 0;
  let raceActive = false;
  const impulse = new THREE.Vector3();

  game.enableNetworkMode?.();

  const isHostFn = () => isHost;

  const overlay = (() => {
    // Zwei Varianten: Host-Banner (Menü bedienbar) vs. Gast-Vollbild.
    let hostPanel: ReturnType<typeof createLobbyOverlay> | null = null;
    let guestPanel: ReturnType<typeof createLobbyOverlay> | null = null;
    return {
      mountHost() {
        if (hostPanel) return;
        guestPanel?.remove();
        guestPanel = null;
        hostPanel = createLobbyOverlay(true);
      },
      mountGuest() {
        if (guestPanel) return;
        hostPanel?.remove();
        hostPanel = null;
        guestPanel = createLobbyOverlay(false);
      },
      get() {
        return hostPanel ?? guestPanel;
      },
      remove() {
        hostPanel?.remove();
        guestPanel?.remove();
        hostPanel = null;
        guestPanel = null;
      },
    };
  })();

  events.on('race:finish', (e) => {
    if (e.isPlayer && finishTime === 0) finishTime = e.time;
  });

  // Eigene Item-Nutzung an andere Spieler melden (nur schädliche Items).
  events.on('item:use', (e) => {
    if (!e.isPlayer || !room || !raceActive) return;
    if (!HARMFUL.has(String(e.item))) return;
    const me = game.netKarts[0];
    room.send('use', {
      item: String(e.item),
      x: e.position.x,
      z: e.position.z,
      angle: me ? me.state.heading : 0,
    });
  });

  function updateRoster(state: RoomState) {
    playerNames.clear();
    const entries: { name: string; isHost: boolean }[] = [];
    state.players?.forEach((p, key) => {
      playerNames.set(key, p.name);
      entries.push({ name: p.name, isHost: key === state.hostId });
    });
    overlay.get()?.setRoster(entries);
    overlay.get()?.setCode(state.code || room?.roomId || '');
  }

  function resetRaceState() {
    remotes.clear();
    bumpCooldown.clear();
    lastGhostDist.clear();
    lastGhostAt.clear();
    itemCooldown.clear();
    finishTime = 0;
  }

  function handlePrepare(cfg: { trackId?: string; characterId?: string; difficulty?: string; laps?: number }) {
    if (!game.startNetworkRace) return;
    const settings: RaceSettings = {
      characterId: cfg.characterId || 'aurora',
      trackId: cfg.trackId || '',
      difficulty: (cfg.difficulty as RaceSettings['difficulty']) || 'normal',
      laps: typeof cfg.laps === 'number' ? cfg.laps : 3,
    };
    resetRaceState();
    game.startNetworkRace(settings);
    overlay.get()?.setHint(isHost ? 'Rennen wird geladen…' : 'Warte auf den Start…');
  }

  function handleGo(cfg: unknown) {
    raceActive = true;
    overlay.remove();
    // Countdown-Einstellungen für Item/Kollision sind bereits gesetzt; GO kommt
    // vom Server synchron für alle.
    void cfg;
    game.networkGo?.();
  }

  try {
    const client = new Client(url);
    const joining =
      mode === 'create'
        ? client.create('kart3d', { name, color, mode: 'create' })
        : roomCode
          ? client.joinById(roomCode, { name, color, mode: 'join' })
          : client.joinOrCreate('kart3d', { name, color, mode: 'public' });
    joining
      .then((r) => {
        room = r;
        myId = r.sessionId ?? '';
        try {
          window.parent?.postMessage(
            { type: 'kart:room', roomId: (r as { roomId?: string }).roomId ?? '' },
            '*',
          );
        } catch {
          /* ignore */
        }

        r.onStateChange((state: unknown) => {
          const s = state as RoomState;
          phase = s.phase ?? 'lobby';
          countdownEndsAt = s.countdownEndsAt ?? 0;
          isHost = s.hostId === myId;
          if (isHost) overlay.mountHost();
          else overlay.mountGuest();
          updateRoster(s);

          // Server hat in die Lobby zurückgesetzt (Rematch) → Menü/Lobby zeigen.
          if (phase === 'lobby' && prevPhase !== 'lobby') {
            raceActive = false;
            resetRaceState();
            game.returnToNetworkLobby?.();
          }
          prevPhase = phase;

          remotes.clear();
          s.players?.forEach((p, key) => {
            if (key !== myId) {
              remotes.set(key, { name: p.name, color: p.color, tx: p.x, ty: p.y, tz: p.z, tAngle: p.angleY });
            }
          });
        });

        r.onMessage('prepare', (cfg: { trackId?: string; characterId?: string; difficulty?: string; laps?: number }) => {
          handlePrepare(cfg ?? {});
        });
        r.onMessage('go', (cfg: unknown) => handleGo(cfg));
        r.onMessage('use', (msg: { item?: string; x?: number; z?: number; angle?: number; from?: string }) => {
          const kart = localKart(game);
          if (!kart || typeof msg?.x !== 'number' || typeof msg?.z !== 'number') return;
          const item = String(msg.item ?? '');
          if (!HARMFUL.has(item)) return;
          const key = msg.from || 'unknown';
          const now = Date.now();
          if (now - (itemCooldown.get(key) ?? 0) < ITEM_HIT_COOLDOWN) return;
          const p = kart.state.position;
          const dx = p.x - msg.x;
          const dz = p.z - msg.z;
          const d = Math.hypot(dx, dz);

          let hit = false;
          if (GLOBAL_ITEMS.has(item)) {
            hit = true;
          } else if (CONE_ITEMS.has(item)) {
            // Kegel vor dem Werfer (Richtungs-Items).
            const angle = typeof msg.angle === 'number' ? msg.angle : 0;
            const rel = Math.atan2(dz, dx) - angle;
            const wrapped = Math.atan2(Math.sin(rel), Math.cos(rel));
            hit = d < ITEM_CONE_RANGE && Math.abs(wrapped) < (ITEM_CONE_DEG * Math.PI) / 180;
          } else if (PROXIMITY_ITEMS.has(item)) {
            hit = d < ITEM_HIT_DIST;
          }
          if (hit) {
            itemCooldown.set(key, now);
            kart.applyHit(item || 'collision', -1);
          }
        });
        r.onMessage('lobby:closed', () => {
          overlay.remove();
          showDisconnected('Das Rennen läuft bereits. Bitte später erneut versuchen.');
        });
        r.onLeave(() => {
          room = null;
          if (raceActive) showDisconnected('Verbindung getrennt.');
        });

        // Host: Menü-Start an den Server melden (kein lokaler Start).
        game.onNetworkStartRequest = (settings: RaceSettings) => {
          if (!room) return;
          if (!isHostFn()) {
            overlay.get()?.setHint('Nur der Host startet das Rennen.');
            return;
          }
          if (phase !== 'lobby') return;
          room.send('start', {
            trackId: settings.trackId,
            characterId: settings.characterId,
            difficulty: settings.difficulty,
            laps: settings.laps,
          });
        };

        // Rematch: Host setzt serverseitig in die Lobby zurück.
        game.onNetworkRematchRequest = () => {
          if (!room) return;
          if (!isHostFn()) {
            overlay.get()?.setHint('Nur der Host kann ein neues Rennen starten.');
            return;
          }
          room.send('rematch');
        };

        // Erste Lobby sofort anzeigen.
        if (isHostFn()) overlay.mountHost();
        else overlay.mountGuest();
      })
      .catch((err) => {
        console.warn('[netplay] join failed', err);
        overlay.remove();
        showDisconnected(String((err as Error)?.message ?? err));
        try {
          window.parent?.postMessage(
            { type: 'kart:room-error', message: String((err as Error)?.message ?? err) },
            '*',
          );
        } catch {
          /* ignore */
        }
      });
  } catch (err) {
    console.warn('[netplay] client error', err);
    return;
  }

  function showDisconnected(message: string) {
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;align-items:center;' +
      'justify-content:center;background:linear-gradient(160deg,#0b0b1a,#1a1030);color:#fff;' +
      'font-family:system-ui,sans-serif;text-align:center;padding:24px;';
    el.innerHTML = `<div style="font-size:34px">🏁</div><h2 style="font-weight:900;margin:8px 0">Verbindung beendet</h2><p style="opacity:.7;font-size:14px">${message}</p>`;
    const back = document.createElement('button');
    back.textContent = 'Erneut versuchen';
    back.style.cssText =
      'margin-top:14px;padding:14px 18px;border:0;border-radius:14px;background:#ffb020;color:#111;font-weight:900;';
    back.addEventListener('click', () => window.location.reload());
    el.appendChild(back);
    document.body.appendChild(el);
  }

  // Senden (gedrosselt ~20 Hz) – nur während des Rennens.
  let last = 0;
  const tickSend = (now: number) => {
    if (room && raceActive && now - last > 50) {
      last = now;
      const kart = game.netKarts[0];
      if (kart) {
        const s = kart.state;
        room.send('pos', {
          x: s.position.x,
          y: s.position.y,
          z: s.position.z,
          angleY: s.heading,
          lap: s.lap,
          finished: finishTime > 0,
          time: finishTime,
        });
      }
    }
    requestAnimationFrame(tickSend);
  };
  requestAnimationFrame(tickSend);

  // Empfangen / zeichnen + Auffahr-Kollisionen.
  const tickRender = () => {
    // Countdown-Anzeige im Lobby-Overlay.
    if (phase === 'countdown' && countdownEndsAt > 0) {
      overlay.get()?.showCountdown(Math.ceil((countdownEndsAt - Date.now()) / 1000));
    }

    const kart = localKart(game);
    for (const [id, target] of remotes) {
      let ghost = ghosts.get(id);
      if (!ghost) {
        ghost = { group: makeGhostKart(target.color, target.name), target };
        game.netScene.add(ghost.group);
        ghost.group.position.set(target.tx, target.ty, target.tz);
        ghosts.set(id, ghost);
      }
      ghost.target = target;
      // Framerate-unabhängiges Smoothing (dt-basiert statt fixem k).
      const now = performance.now();
      const lastAt = lastGhostAt.get(id) ?? now;
      const dt = Math.min(0.1, (now - lastAt) / 1000) || 0.016;
      lastGhostAt.set(id, now);
      const k = 1 - Math.exp(-8 * dt);
      ghost.group.position.x += (target.tx - ghost.group.position.x) * k;
      ghost.group.position.y += (target.ty - ghost.group.position.y) * k;
      ghost.group.position.z += (target.tz - ghost.group.position.z) * k;
      let da = target.tAngle - ghost.group.rotation.y;
      da = ((da + Math.PI) % (Math.PI * 2)) - Math.PI;
      ghost.group.rotation.y += da * k;

      // Kollision Spieler <-> Ghost: nur bei echter Annäherung (kein Dauer-Bump
      // bei stillstehenden, benachbarten Karts). Positionen der Autorität
      // (target) statt der nachlaufenden Visual-Position verwenden.
      if (kart && raceActive) {
        const p = kart.state.position;
        const dx = p.x - target.tx;
        const dz = p.z - target.tz;
        const d = Math.hypot(dx, dz);
        const prev = lastGhostDist.get(id);
        lastGhostDist.set(id, d);
        const approaching = prev === undefined ? false : prev - d > BUMP_MIN_APPROACH * dt;
        if (
          approaching &&
          d > 0.001 &&
          d < BUMP_DIST &&
          now - (bumpCooldown.get(id) ?? 0) > BUMP_COOLDOWN
        ) {
          bumpCooldown.set(id, now);
          impulse.set(dx / d, 0.35, dz / d).multiplyScalar(8);
          kart.applyImpulse(impulse);
        }
      }
    }
    for (const [id, ghost] of ghosts) {
      if (!remotes.has(id)) {
        game.netScene.remove(ghost.group);
        ghosts.delete(id);
        lastGhostDist.delete(id);
        lastGhostAt.delete(id);
        bumpCooldown.delete(id);
      }
    }
    requestAnimationFrame(tickRender);
  };
  requestAnimationFrame(tickRender);
}
