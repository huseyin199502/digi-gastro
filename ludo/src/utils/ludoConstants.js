/**
 * LudoVerse 3D — Ludo Constants
 * Complete board layout, paths, safe squares, home paths, colors
 * Reference-accurate color corners: Red=TL, Green=TR, Yellow=BR, Blue=BL
 */

// ─── Player Colors ───────────────────────────────────────────────────────────
export const PLAYER_COLORS = {
  red:    { primary: '#ef4444', dark: '#991b1b', light: '#fca5a5', glow: '#ef444488', hex: 0xef4444 },
  blue:   { primary: '#3b82f6', dark: '#1d4ed8', light: '#93c5fd', glow: '#3b82f688', hex: 0x3b82f6 },
  green:  { primary: '#22c55e', dark: '#15803d', light: '#86efac', glow: '#22c55e88', hex: 0x22c55e },
  yellow: { primary: '#eab308', dark: '#a16207', light: '#fde047', glow: '#eab30888', hex: 0xeab308 },
};

export const PLAYER_NAMES = ['red', 'blue', 'green', 'yellow'];

// ─── Board Dimensions ─────────────────────────────────────────────────────────
export const BOARD_SIZE = 15;       // 15x15 grid
export const CELL_SIZE = 1.0;       // world units per cell
export const BOARD_OFFSET = 7.0;    // center offset

// ─── Token Starting Positions (centered in the white yard squares) ────────────
export const HOME_YARD = {
  red:    [[1.4, 1.4],   [1.4, 3.6],   [3.6, 1.4],   [3.6, 3.6]],    // top-left (medium space)
  green:  [[10.4, 1.4],  [10.4, 3.6],  [12.6, 1.4],  [12.6, 3.6]],   // top-right
  yellow: [[10.4, 10.4], [10.4, 12.6], [12.6, 10.4], [12.6, 12.6]],  // bottom-right
  blue:   [[1.4, 10.4],  [1.4, 12.6],  [3.6, 10.4],  [3.6, 12.6]],   // bottom-left
};

// ─── Starting squares (entry to main path) ────────────────────────────────────
export const START_SQUARES = {
  red:    42,   // index 42 = [1, 6] (Red starting cell → goes RIGHT ▶)
  green:  3,    // index 3  = [8, 1] (Green starting cell → goes DOWN ▼)
  yellow: 16,   // index 16 = [13, 8] (Yellow starting cell → goes LEFT ◀)
  blue:   29,   // index 29 = [6, 13] (Blue starting cell → goes UP ▲)
};

// ─── Main circular path (52 squares, [col, row] in board grid) ───────────────
// Clockwise: Red→right, Green→down, Yellow→left, Blue→up
export const MAIN_PATH = [
  // Row 0 going right (top arm)
  [6,0],[7,0],[8,0],
  // Col 8 going down (top arm)
  [8,1],[8,2],[8,3],[8,4],[8,5],
  // Row 6 going right (right arm)
  [9,6],[10,6],[11,6],[12,6],[13,6],[14,6],
  // Col 14 going down (right arm)
  [14,7],[14,8],
  // Row 8 going left (right arm)
  [13,8],[12,8],[11,8],[10,8],[9,8],
  // Col 8 going down (bottom arm)
  [8,9],[8,10],[8,11],[8,12],[8,13],[8,14],
  // Row 14 going left (bottom arm)
  [7,14],[6,14],
  // Col 6 going up (bottom arm)
  [6,13],[6,12],[6,11],[6,10],[6,9],
  // Row 8 going left (left arm)
  [5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
  // Col 0 going up (left arm)
  [0,7],[0,6],
  // Row 6 going right (left arm)
  [1,6],[2,6],[3,6],[4,6],[5,6],
  // Col 6 going up (top arm)
  [6,5],[6,4],[6,3],[6,2],[6,1],
];

// ─── Safe Squares (star squares, indexes into MAIN_PATH) ─────────────────────
export const SAFE_SQUARES = [2, 12, 15, 25, 28, 39, 42, 50];

// ─── Home column paths (each player's colored final stretch) ──────────────────
export const HOME_COLUMN = {
  red:    [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],       // left horizontal → center
  green:  [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],        // top vertical → center
  yellow: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],   // right horizontal → center
  blue:   [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],   // bottom vertical → center
};

// ─── Home column entry index (main path index just before home column) ────────
export const HOME_COLUMN_ENTRY = {
  red:    40,   // [0,7] — left side corner before Red home stretch
  green:  1,    // [7,0] — top corner before Green home stretch
  yellow: 14,   // [14,7] — right side corner before Yellow home stretch
  blue:   27,   // [7,14] — bottom corner before Blue home stretch
};

// ─── Home center position ─────────────────────────────────────────────────────
export const HOME_CENTER = [7, 7];

// ─── Center home finish slots per player ─────────────────────────────────────
export const HOME_FINISH_POSITIONS = {
  red:    [[6.3,7.0],[6.7,7.3],[6.3,7.6],[6.7,6.7]],  // left of center
  green:  [[7.0,6.3],[6.7,6.7],[6.3,6.3],[7.0,6.7]],  // top of center
  yellow: [[7.7,7.0],[7.3,6.7],[7.7,6.3],[7.3,7.3]],  // right of center
  blue:   [[7.0,7.7],[7.3,7.3],[7.7,7.7],[7.0,7.3]],  // bottom of center
};

// ─── Token States ─────────────────────────────────────────────────────────────
export const TOKEN_STATE = {
  HOME: 'home',           // In home yard (not yet entered)
  ACTIVE: 'active',       // On main board
  HOME_COLUMN: 'home_col',// On home column path
  FINISHED: 'finished',   // Reached center home
};

// ─── Turn phases ──────────────────────────────────────────────────────────────
export const GAME_PHASE = {
  LOBBY:    'lobby',
  ROLLING:  'rolling',
  SELECTING:'selecting',
  MOVING:   'moving',
  AI_TURN:  'ai_turn',
  FINISHED: 'finished',
  PAUSED:   'paused',
};

// ─── Animation durations (ms) ─────────────────────────────────────────────────
export const ANIM = {
  DICE_ROLL:    1200,
  TOKEN_MOVE:   350,   // per square
  TOKEN_ENTER:  500,
  TOKEN_CAPTURE:600,
  TOKEN_WIN:    800,
  AI_THINK:     1000,
};

// ─── Score tracking ───────────────────────────────────────────────────────────
export const MAX_TOKENS = 4;

// ─── Grid to 3D world position ────────────────────────────────────────────────
export function gridTo3D(col, row, y = 0.12) {
  return [
    (col - 7) * CELL_SIZE,
    y,
    (row - 7) * CELL_SIZE,
  ];
}
