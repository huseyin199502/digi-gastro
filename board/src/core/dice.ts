import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const PIP_LAYOUT: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.29, 0.29], [0.71, 0.71]],
  3: [[0.29, 0.29], [0.5, 0.5], [0.71, 0.71]],
  4: [[0.29, 0.29], [0.71, 0.29], [0.29, 0.71], [0.71, 0.71]],
  5: [[0.29, 0.29], [0.71, 0.29], [0.5, 0.5], [0.29, 0.71], [0.71, 0.71]],
  6: [[0.29, 0.24], [0.71, 0.24], [0.29, 0.5], [0.71, 0.5], [0.29, 0.76], [0.71, 0.76]],
};

/** Materialreihenfolge der Box: 0:+X 1:-X 2:+Y 3:-Y 4:+Z 5:-Z */
const FACE_VALUES = [1, 6, 2, 5, 3, 4];

function pipTexture(value: number, body: string, pip: string): THREE.CanvasTexture {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, s, s);
  grad.addColorStop(0, body);
  grad.addColorStop(1, '#d9d2c4');
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  for (const [px, py] of PIP_LAYOUT[value]) {
    g.beginPath();
    g.arc(px * s, py * s, s * 0.1, 0, Math.PI * 2);
    g.fillStyle = pip;
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}

function faceEuler(value: number, yaw: number): THREE.Euler {
  let x = 0;
  let z = 0;
  switch (value) {
    case 1: z = Math.PI / 2; break;
    case 6: z = -Math.PI / 2; break;
    case 2: break;
    case 5: x = Math.PI; break;
    case 3: x = -Math.PI / 2; break;
    default: x = Math.PI / 2; break;
  }
  return new THREE.Euler(x, yaw, z, 'YXZ');
}

export interface Die {
  mesh: THREE.Mesh;
  value: number;
  target: number;
  yaw: number;
  spin: number;
  rolling: number;
  kept: boolean;
  baseY: number;
  baseMat: THREE.MeshStandardMaterial[];
}

export class DiceSet {
  private scene: THREE.Scene;
  private size: number;
  private spacing: number;
  private bodyColor: string;
  private baseY: number;
  private geo: THREE.BufferGeometry;
  dice: Die[] = [];

  constructor(scene: THREE.Scene, count: number, opts: { size?: number; spacing?: number; body?: string; y?: number } = {}) {
    this.scene = scene;
    this.size = opts.size ?? 0.62;
    this.spacing = opts.spacing ?? this.size * 1.18;
    this.bodyColor = opts.body ?? '#fdfcf6';
    const y = opts.y ?? 0.42;
    this.baseY = y;
    const geo = new RoundedBoxGeometry(this.size, this.size, this.size, 4, this.size * 0.16);
    this.geo = geo;
    const x0 = -((count - 1) * this.spacing) / 2;
    for (let i = 0; i < count; i++) {
      const mats = FACE_VALUES.map(
        (v) => new THREE.MeshStandardMaterial({ map: pipTexture(v, this.bodyColor, '#1c1a26'), roughness: 0.35, metalness: 0.05 }),
      );
      const mesh = new THREE.Mesh(geo, mats);
      mesh.position.set(x0 + i * this.spacing, y, 0);
      mesh.castShadow = false;
      this.scene.add(mesh);
      this.dice.push({ mesh, value: 1, target: 1, yaw: 0, spin: 0, rolling: 0, kept: false, baseY: y, baseMat: mats });
    }
    this.setValues(this.dice.map(() => 1), true);
  }

  get values(): number[] {
    return this.dice.map((d) => d.value);
  }

  /** Startet einen Rollvorgang mit den Zielwerten (0 = zufällig). */
  roll(targets: number[], only: number[] | null = null): void {
    for (let i = 0; i < this.dice.length; i++) {
      if (only && !only.includes(i)) continue;
      const d = this.dice[i];
      d.target = targets[i] || 1 + Math.floor(Math.random() * 6);
      d.rolling = 0.55 + Math.random() * 0.25;
      d.spin = 6 + Math.random() * 8;
    }
  }

  setValues(values: number[], immediate = false): void {
    for (let i = 0; i < this.dice.length; i++) {
      const d = this.dice[i];
      d.value = values[i] ?? 1;
      d.target = d.value;
      if (immediate) {
        d.rolling = 0;
        d.yaw = (Math.random() - 0.5) * 0.5;
        d.mesh.quaternion.setFromEuler(faceEuler(d.value, d.yaw));
      }
    }
  }

  setKept(index: number, kept: boolean): void {
    const d = this.dice[index];
    if (!d) return;
    d.kept = kept;
    d.baseY = this.baseY + (kept ? 0.16 : 0);
  }

  /** Blendet Würfel ab `count` aus (z. B. wenn ein Spieler Würfel verliert). */
  setActive(count: number): void {
    this.dice.forEach((d, i) => { d.mesh.visible = i < count; });
  }

  setHighlight(indices: number[] | null): void {
    this.dice.forEach((d, i) => {
      const on = !indices || indices.includes(i);
      d.baseMat.forEach((m) => {
        m.emissive.setHex(on ? 0x000000 : 0x221a33);
        m.emissiveIntensity = on ? 0 : 0.6;
      });
    });
  }

  update(dt: number): void {
    for (const d of this.dice) {
      if (d.rolling > 0) {
        d.rolling -= dt;
        d.mesh.rotation.x += dt * d.spin;
        d.mesh.rotation.y += dt * d.spin * 0.8;
        d.mesh.rotation.z += dt * d.spin * 0.6;
        d.mesh.position.y = d.baseY + Math.abs(Math.sin(d.mesh.rotation.x)) * 0.25;
        if (d.rolling <= 0) {
          d.value = d.target;
          d.yaw = (Math.random() - 0.5) * 0.5;
          d.mesh.quaternion.setFromEuler(faceEuler(d.value, d.yaw));
        }
      } else {
        d.mesh.position.y += (d.baseY - d.mesh.position.y) * Math.min(1, dt * 10);
      }
    }
  }

  dispose(): void {
    for (const d of this.dice) {
      this.scene.remove(d.mesh);
      d.baseMat.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    }
    this.geo.dispose();
    this.dice = [];
  }
}
