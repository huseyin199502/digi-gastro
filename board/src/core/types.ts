import type * as THREE from 'three';

export interface Player {
  id: string;
  name: string;
  color: string;
  isBot: boolean;
}

export interface GameCtx {
  scene: THREE.Scene;
  hud: HTMLElement;
  /** Zeigt ein Overlay (z. B. Sieger) und liefert das Root-Element zurück. */
  overlay: (nodes: HTMLElement[]) => HTMLElement;
  clearOverlay: () => void;
  toast: (msg: string, ms?: number) => void;
  myId: string;
  isHost: boolean;
  myName: string;
  players: Player[];
  sendState: (s: unknown) => void;
  sendIntent: (m: unknown) => void;
}

export interface GameInstance {
  setPlayers(p: Player[]): void;
  start(): void;
  applyState(s: unknown): void;
  getState(): unknown;
  handleIntent?(m: Record<string, unknown>, from: string): void;
  update(dt: number): void;
  dispose(): void;
}

export interface GameModule {
  id: string;
  title: string;
  minPlayers: number;
  maxPlayers: number;
  create(ctx: GameCtx): GameInstance;
}
