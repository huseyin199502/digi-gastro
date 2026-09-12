declare module 'troika-three-text' {
  import { Mesh } from 'three';
  export class Text extends Mesh {
    text: string;
    fontSize: number;
    color: string | number;
    anchorX: string | number;
    anchorY: string | number;
    textAlign: string;
    maxWidth: number | null;
    sync(cb?: () => void): void;
  }
}
