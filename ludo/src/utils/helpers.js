/**
 * LudoVerse 3D — General Helpers
 */

/** Clamp a value between min and max */
export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/** Linear interpolation */
export const lerp = (a, b, t) => a + (b - a) * t;

/** Random integer between min and max (inclusive) */
export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Roll a fair dice (1–6) */
export const rollDice = () => randInt(1, 6);

/** Delay promise */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/** Format seconds as MM:SS */
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

/** Generate a unique ID */
export const uid = () => Math.random().toString(36).slice(2, 9);

/** Deep clone a plain object */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/** Map a value from one range to another */
export const mapRange = (v, inMin, inMax, outMin, outMax) =>
  ((v - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;

/** Get next player index (wrapping) */
export const nextPlayer = (current, total) => (current + 1) % total;

/** Check if a point [x,z] is within a rect [cx,cz, w,h] */
export const inRect = (x, z, cx, cz, w, h) =>
  x >= cx - w / 2 && x <= cx + w / 2 && z >= cz - h / 2 && z <= cz + h / 2;

/** Hex color string to THREE.Color-compatible hex number */
export const hexStrToNum = (str) => parseInt(str.replace('#', ''), 16);

/** Shuffle array in place */
export const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/** Get ordinal suffix */
export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/** Parse player config from URL or default */
export const parseGameConfig = (searchParams) => {
  const mode = searchParams.get('mode') || 'multiplayer';
  const players = parseInt(searchParams.get('players') || '4');
  const aiPlayers = searchParams.get('ai') ? searchParams.get('ai').split(',') : [];
  return { mode, players: clamp(players, 2, 4), aiPlayers };
};
