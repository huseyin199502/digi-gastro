/**
 * Netcode: verbindet das Spiel mit dem digi-gastro Colyseus-Server.
 * - Synchronisiert Kart-Positionen (Ghost-Karts).
 * - Interaktionen zwischen echten Spielern: Auffahr-Kollisionen (Impuls) und
 *   Item-Treffer (Spin), lokal symmetrisch ausgewertet.
 * Wird nur aktiv, wenn `?net=<ws-url>` in der URL steht.
 */
import * as THREE from 'three';
import { Client, type Room } from '@colyseus/sdk';
import { events } from './core/events';

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

const HARMFUL = new Set(['greenShell', 'redShell', 'blueShell', 'banana', 'fakeBox', 'bomb', 'lightning']);
const BUMP_DIST = 2.0;
const BUMP_COOLDOWN = 1200;
const ITEM_HIT_DIST = 3.5;
const ITEM_HIT_COOLDOWN = 1200;

function localKart(game: NetGame): {
  state: { position: THREE.Vector3 };
  applyHit: (cause: string, source: number) => boolean;
  applyImpulse: (v: THREE.Vector3) => void;
} | null {
  const k = game.netKarts[0] as unknown as {
    state: { position: THREE.Vector3 };
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

export function startNetplay(
  game: NetGame,
  opts: { url: string; name: string; color: string; room?: string; mode?: 'create' | 'join' },
): void {
  const { url, name, color, room: roomCode, mode } = opts;
  if (!url) return;

  const remotes = new Map<string, RemoteTarget>();
  const ghosts = new Map<string, Ghost>();
  const bumpCooldown = new Map<string, number>();

  let room: Room | null = null;
  let myId = '';
  let finishTime = 0;
  let lastItemHit = 0;
  const impulse = new THREE.Vector3();

  events.on('race:finish', (e) => {
    if (e.isPlayer && finishTime === 0) finishTime = e.time;
  });

  // Eigene Item-Nutzung an andere Spieler melden (nur schädliche Items).
  events.on('item:use', (e) => {
    if (!e.isPlayer || !room) return;
    if (!HARMFUL.has(String(e.item))) return;
    room.send('use', {
      item: String(e.item),
      x: e.position.x,
      z: e.position.z,
    });
  });

  try {
    const client = new Client(url);
    // Raumwahl: neu erstellen (Code wird geteilt) / per Code beitreten / öffentlich.
    const joining =
      mode === 'create'
        ? client.create('kart3d', { name, color })
        : roomCode
          ? client.joinById(roomCode, { name, color })
          : client.joinOrCreate('kart3d', { name, color });
    joining
      .then((r) => {
        room = r;
        myId = r.sessionId ?? '';
        // Raum-ID (= Code) an die einbettende Seite melden, damit Gäste sie teilen können.
        try {
          window.parent?.postMessage({ type: 'kart:room', roomId: (r as { roomId?: string }).roomId ?? '' }, '*');
        } catch {
          /* ignore */
        }
        r.onStateChange((state: unknown) => {
          const s = state as {
            players?: Map<string, { x: number; y: number; z: number; angleY: number; color: string; name: string }>;
          };
          remotes.clear();
          s.players?.forEach((p, key) => {
            if (key !== myId) {
              remotes.set(key, { name: p.name, color: p.color, tx: p.x, ty: p.y, tz: p.z, tAngle: p.angleY });
            }
          });
        });
        // Fremde Item-Treffer: wenn ich in der Nähe bin, werde ich getroffen.
        r.onMessage('use', (msg: { item?: string; x?: number; z?: number }) => {
          const kart = localKart(game);
          if (!kart || typeof msg.x !== 'number' || typeof msg.z !== 'number') return;
          const now = Date.now();
          if (now - lastItemHit < ITEM_HIT_COOLDOWN) return;
          const p = kart.state.position;
          if (Math.hypot(p.x - msg.x, p.z - msg.z) < ITEM_HIT_DIST) {
            lastItemHit = now;
            kart.applyHit(msg.item ?? 'collision', -1);
          }
        });
        r.onLeave(() => {
          room = null;
        });
      })
      .catch((err) => {
        console.warn('[netplay] join failed', err);
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

  // Senden (gedrosselt ~20 Hz)
  let last = 0;
  const tickSend = (now: number) => {
    if (room && now - last > 50) {
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

  // Empfangen / zeichnen + Auffahr-Kollisionen
  const tickRender = () => {
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
      const k = 0.25;
      ghost.group.position.x += (target.tx - ghost.group.position.x) * k;
      ghost.group.position.y += (target.ty - ghost.group.position.y) * k;
      ghost.group.position.z += (target.tz - ghost.group.position.z) * k;
      let da = target.tAngle - ghost.group.rotation.y;
      da = ((da + Math.PI) % (Math.PI * 2)) - Math.PI;
      ghost.group.rotation.y += da * k;

      // Kollision Spieler <-> Ghost: Impuls vom Ghost weg (symmetrisch).
      if (kart) {
        const p = kart.state.position;
        const dx = p.x - ghost.group.position.x;
        const dz = p.z - ghost.group.position.z;
        const d = Math.hypot(dx, dz);
        const now = performance.now();
        if (d > 0.001 && d < BUMP_DIST && now - (bumpCooldown.get(id) ?? 0) > BUMP_COOLDOWN) {
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
      }
    }
    requestAnimationFrame(tickRender);
  };
  requestAnimationFrame(tickRender);
}
