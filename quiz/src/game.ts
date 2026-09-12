/**
 * digi-gastro Quiz Show — 3D-Bühne & Spiellogik.
 *
 * Autoritativer Modus (Host/Solo): steuert Fragen, Timer, Bots, Punkte.
 * Gäste: rendern nur und wenden Snapshots via applySnapshot() an.
 */
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { QUESTIONS, type Question } from './questions';

export interface QuizPlayer {
  id: string;
  name: string;
  color: string;
  isBot: boolean;
  score: number;
  choice: number | null;
}

export type QuizPhase = 'idle' | 'question' | 'reveal' | 'results';

export interface QuizSnapshot {
  qIndex: number;
  phase: QuizPhase;
  timeLeft: number;
  players: QuizPlayer[];
  correct: number | null;
  total: number;
  category: string;
  question: string;
  answers: string[];
}

const ANSWER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
const QUESTION_TIME = 15;
const REVEAL_TIME = 2.4;

const IS_MOBILE =
  typeof window !== 'undefined' &&
  ((typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) ||
    (typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0));
const DPR_CAP = IS_MOBILE ? 1.5 : 2;

interface Beam {
  group: THREE.Group;
  mat: THREE.MeshStandardMaterial;
  light: THREE.PointLight;
}

function makeText(size: number, color = '#ffffff'): Text {
  const t = new Text();
  t.fontSize = size;
  t.color = color;
  t.anchorX = 'center';
  t.anchorY = 'middle';
  t.textAlign = 'center';
  t.sync();
  return t;
}

export class QuizShow {
  readonly container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private raf = 0;
  private clock = new THREE.Clock();

  private boardText: Text;
  private categoryText: Text;
  private beams: Beam[] = [];
  private board: THREE.Group;
  private stars: THREE.Points;

  private questions: Question[];
  private order: Question[];
  correct: number | null = null;
  qIndex = 0;
  phase: QuizPhase = 'idle';
  timeLeft = QUESTION_TIME;
  private revealTimer = 0;
  private botTimers: number[] = [];
  private answerLocks = new Set<string>();

  players: QuizPlayer[] = [];
  authoritative: boolean;
  onChange: ((s: QuizSnapshot) => void) | null = null;
  onSelectAnswer: ((index: number) => void) | null = null;

  constructor(container: HTMLElement, authoritative: boolean) {
    this.container = container;
    this.authoritative = authoritative;
    this.questions = QUESTIONS;

    this.renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = false;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07051b);
    this.scene.fog = new THREE.FogExp2(0x07051b, 0.035);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    this.camera.position.set(0, 2.6, 7.2);
    this.camera.lookAt(0, 1.9, 0);

    const built = this.buildStage();
    this.board = built.board;
    this.boardText = built.boardText;
    this.categoryText = built.categoryText;
    this.beams = built.beams;
    this.stars = built.stars;

    this.order = this.shuffle(this.questions).slice(0, 10);
    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.loop();
  }

  // ───────────────────────────────────────────────────────────── build

  private buildStage() {
    const scene = this.scene;

    scene.add(new THREE.HemisphereLight(0x8899ff, 0x120a2a, 0.75));

    const key = new THREE.SpotLight(0xfff2d8, 90, 30, Math.PI / 5, 0.5, 1.6);
    key.position.set(-3.2, 7.5, 4.2);
    key.target.position.set(0, 2.4, -0.4);
    scene.add(key, key.target);

    const rim = new THREE.SpotLight(0x5b7bff, 60, 30, Math.PI / 4.5, 0.6, 1.6);
    rim.position.set(3.6, 6.5, 3.0);
    rim.target.position.set(0, 2.2, -0.4);
    scene.add(rim, rim.target);

    // Bühne
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(6, 64),
      new THREE.MeshStandardMaterial({ color: 0x141033, roughness: 0.5, metalness: 0.6 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.45, 64),
      new THREE.MeshBasicMaterial({ color: 0x6a3cff, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    // Frage-Board
    const board = new THREE.Group();
    const boardMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.9, 1.6, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x1b1450, roughness: 0.35, metalness: 0.35, emissive: 0x140a3a, emissiveIntensity: 0.6 }),
    );
    board.add(boardMesh);
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(4.02, 1.72, 0.06),
      new THREE.MeshBasicMaterial({ color: 0x37a8ff, transparent: true, opacity: 0.5 }),
    );
    edge.position.z = -0.06;
    board.add(edge);
    board.position.set(0, 3.0, -0.7);
    board.rotation.x = -0.1;
    scene.add(board);

    const boardText = makeText(0.2, '#ffffff');
    boardText.maxWidth = 3.5;
    boardText.position.set(0, -0.02, 0.1);
    board.add(boardText);

    const categoryText = makeText(0.12, '#7dd3fc');
    categoryText.position.set(0, 0.66, 0.1);
    board.add(categoryText);

    // Antwort-Strahler (A–D)
    const beams: Beam[] = [];
    const xs = [-1.35, -0.45, 0.45, 1.35];
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(ANSWER_COLORS[i]),
        emissive: new THREE.Color(ANSWER_COLORS[i]),
        emissiveIntensity: 0.55,
        roughness: 0.3,
        metalness: 0.4,
        transparent: true,
        opacity: 0.9,
      });
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.95, 24), mat);
      bar.position.y = 0.5;
      g.add(bar);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.08, 24),
        new THREE.MeshStandardMaterial({ color: 0x201a55, roughness: 0.4, metalness: 0.5 }),
      );
      base.position.y = 0.04;
      g.add(base);
      const letter = makeText(0.34, ANSWER_COLORS[i]);
      letter.position.set(0, 1.18, 0);
      g.add(letter);
      const light = new THREE.PointLight(new THREE.Color(ANSWER_COLORS[i]), 4, 4, 2);
      light.position.set(0, 0.6, 0);
      g.add(light);
      g.position.set(xs[i], 0, -0.9);
      g.userData.answerIndex = i;
      scene.add(g);
      beams.push({ group: g, mat, light });
    }

    // Sternenstaub
    const count = 400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = Math.random() * 12 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 26 - 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0x9fc8ff, size: 0.05, transparent: true, opacity: 0.8 }),
    );
    scene.add(stars);

    return { board, boardText, categoryText, beams, stars };
  }

  // ───────────────────────────────────────────────────────────── logic

  private shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  currentQuestion(): Question {
    return this.order[Math.min(this.qIndex, this.order.length - 1)];
  }

  start(): void {
    this.qIndex = 0;
    this.players.forEach((p) => { p.score = 0; p.choice = null; });
    this.beginQuestion();
  }

  restart(): void {
    this.order = this.shuffle(this.questions).slice(0, 10);
    this.start();
  }

  private beginQuestion(): void {
    this.phase = 'question';
    this.correct = null;
    this.timeLeft = QUESTION_TIME;
    this.answerLocks.clear();
    this.players.forEach((p) => { p.choice = null; });
    this.syncVisuals();
    this.emit();

    // Bots planen ihre Antwort
    clearTimeoutSafe(this.botTimers);
    for (const p of this.players) {
      if (!p.isBot) continue;
      const delay = 2000 + Math.random() * 9000;
      const q = this.currentQuestion();
      const correct = Math.random() < 0.62;
      let pick = q.correct;
      if (!correct) {
        do { pick = Math.floor(Math.random() * 4); } while (pick === q.correct);
      }
      const t = window.setTimeout(() => this.answer(p.id, pick), delay);
      this.botTimers.push(t);
    }
  }

  answer(playerId: string, index: number): boolean {
    if (this.phase !== 'question') return false;
    if (this.answerLocks.has(playerId)) return false;
    const p = this.players.find((x) => x.id === playerId);
    if (!p) return false;
    this.answerLocks.add(playerId);
    p.choice = index;
    const q = this.currentQuestion();
    if (index === q.correct) {
      p.score += 700 + Math.round(this.timeLeft * 30);
    }
    // Sofortige Auflösung, sobald ein Mensch antwortet: offene Bots antworten
    // automatisch mit, damit die Punkte stimmen – kein langes Warten mehr.
    const humanAnswered = !p.isBot;
    if (humanAnswered) this.autoAnswerBots();
    this.syncVisuals();
    this.emit();
    if (humanAnswered || this.players.every((x) => x.choice !== null)) this.reveal();
    return true;
  }

  /** Lässt alle noch offenen Bots sofort antworten (bei menschlicher Antwort). */
  private autoAnswerBots(): void {
    const q = this.currentQuestion();
    for (const b of this.players) {
      if (!b.isBot || b.choice !== null) continue;
      const correct = Math.random() < 0.62;
      let pick = q.correct;
      if (!correct) {
        do { pick = Math.floor(Math.random() * 4); } while (pick === q.correct);
      }
      b.choice = pick;
      if (pick === q.correct) b.score += 700 + Math.round(this.timeLeft * 30);
    }
  }

  private reveal(): void {
    if (this.phase !== 'question') return;
    clearTimeoutSafe(this.botTimers);
    this.phase = 'reveal';
    this.correct = this.currentQuestion().correct;
    this.revealTimer = REVEAL_TIME;
    this.syncVisuals();
    this.emit();
  }

  private next(): void {
    this.qIndex += 1;
    if (this.qIndex >= this.order.length) {
      this.phase = 'results';
      this.syncVisuals();
      this.emit();
    } else {
      this.beginQuestion();
    }
  }

  // ───────────────────────────────────────────────────────────── net

  getSnapshot(): QuizSnapshot {
    const q = this.currentQuestion();
    return {
      qIndex: this.qIndex,
      phase: this.phase,
      timeLeft: this.timeLeft,
      players: this.players.map((p) => ({ ...p })),
      correct: this.correct,
      total: this.order.length,
      category: q?.category ?? '',
      question: q?.q ?? '',
      answers: q?.answers ? [...q.answers] : [],
    };
  }

  applySnapshot(s: QuizSnapshot): void {
    this.qIndex = s.qIndex;
    this.phase = s.phase;
    this.timeLeft = s.timeLeft;
    this.correct = s.correct;
    this.players = s.players.map((p) => ({ ...p }));
    this.syncVisuals();
  }

  setPlayers(players: QuizPlayer[]): void {
    this.players = players.map((p) => ({ ...p }));
    this.syncVisuals();
    this.emit();
  }

  private emit(): void {
    this.onChange?.(this.getSnapshot());
  }

  // ───────────────────────────────────────────────────────────── visuals

  private syncVisuals(): void {
    const q = this.currentQuestion();
    if (q) {
      this.boardText.text = q.q;
      this.categoryText.text = `${q.category} · Frage ${Math.min(this.qIndex + 1, this.order.length)}/${this.order.length}`;
      this.boardText.sync();
      this.categoryText.sync();
    }

    for (let i = 0; i < this.beams.length; i++) {
      const b = this.beams[i];
      const color = ANSWER_COLORS[i];
      let emissive = new THREE.Color(color);
      let intensity = 0.55;
      let opacity = 0.9;

      if (this.phase === 'reveal' && this.correct !== null) {
        if (i === this.correct) { emissive = new THREE.Color(0x22c55e); intensity = 1.6; opacity = 1; }
        else { emissive = new THREE.Color(0x3a3a55); intensity = 0.12; opacity = 0.4; }
      } else if (this.phase !== 'question') {
        intensity = 0.3;
        opacity = 0.6;
      }
      b.mat.emissive.copy(emissive);
      b.mat.emissiveIntensity = intensity;
      b.mat.opacity = opacity;
      b.light.color.copy(emissive);
      b.light.intensity = this.phase === 'reveal' && i === this.correct ? 8 : 3;
    }
  }

  // ───────────────────────────────────────────────────────────── loop

  private onPointerDown = (e: PointerEvent): void => {
    if (this.phase !== 'question') return;
    const el = this.renderer.domElement;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(x, y), this.camera);
    const hits = ray.intersectObjects(this.beams.map((b) => b.group), true);
    if (hits.length === 0) return;
    let o: THREE.Object3D | null = hits[0].object;
    while (o && o.userData.answerIndex === undefined) o = o.parent;
    const idx = o?.userData.answerIndex;
    if (typeof idx === 'number') this.onSelectAnswer?.(idx);
  };

  private resize = (): void => {
    const w = Math.max(1, this.container.clientWidth || window.innerWidth);
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Im Hochformat etwas mehr FOV, damit das Board komplett sichtbar bleibt.
    this.camera.fov = this.camera.aspect < 1 ? 62 : 55;
    this.camera.updateProjectionMatrix();
  };

  private loop = (): void => {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    if (this.authoritative && this.phase === 'question') {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) this.reveal();
    } else if (this.authoritative && this.phase === 'reveal') {
      this.revealTimer -= dt;
      if (this.revealTimer <= 0) this.next();
    }

    // Animation
    this.board.position.y = 3.0 + Math.sin(t * 0.9) * 0.045;
    this.beams.forEach((b, i) => {
      const pulse = 1 + Math.sin(t * 2.4 + i) * 0.05;
      b.group.scale.y = pulse;
    });
    this.stars.rotation.y = t * 0.02;
    (this.categoryText.material as THREE.Material).opacity = 0.7 + Math.sin(t * 2) * 0.3;

    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.loop);
  };

  dispose(): void {
    cancelAnimationFrame(this.raf);
    clearTimeoutSafe(this.botTimers);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}

function clearTimeoutSafe(timers: number[]): void {
  for (const t of timers) window.clearTimeout(t);
  timers.length = 0;
}
