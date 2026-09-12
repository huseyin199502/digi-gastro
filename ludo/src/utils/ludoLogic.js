/**
 * LudoVerse 3D — Core Ludo Game Logic
 * Move validation, capture detection, win checking, path resolution
 */

import {
  MAIN_PATH,
  HOME_COLUMN,
  HOME_COLUMN_ENTRY,
  HOME_FINISH_POSITIONS,
  SAFE_SQUARES,
  START_SQUARES,
  TOKEN_STATE,
  MAX_TOKENS,
  gridTo3D,
  HOME_YARD,
} from './ludoConstants';

/**
 * Compute the full board path position for a token at a given distance from start.
 * @param {string} color - player color
 * @param {number} steps - steps taken from start (0 = not yet entered)
 * @returns {{ pathIndex: number, col: number, row: number, state: string }}
 */
export function getTokenPosition(color, steps) {
  const startIdx = START_SQUARES[color];
  const homeEntry = HOME_COLUMN_ENTRY[color];
  const totalMainPath = 51; // 52-cell clockwise outer loop, 51 steps to reach home corner
  const homeColLength = HOME_COLUMN[color].length; // 6

  // Steps 1–51 = main path
  // Steps 52–57 = home column
  // Step 58 = home center (finished)

  const totalSteps = totalMainPath + homeColLength + 1;

  if (steps <= 0) {
    return { state: TOKEN_STATE.HOME, col: -1, row: -1, pathIndex: -1 };
  }

  if (steps >= totalSteps) {
    return { state: TOKEN_STATE.FINISHED, col: HOME_FINISH_POSITIONS[color][0][0], row: HOME_FINISH_POSITIONS[color][0][1], pathIndex: 100 };
  }

  if (steps <= totalMainPath) {
    // On main path
    const idx = (startIdx + steps - 1) % MAIN_PATH.length;
    const [col, row] = MAIN_PATH[idx];
    return { state: TOKEN_STATE.ACTIVE, col, row, pathIndex: idx };
  }

  // On home column
  const homeStep = steps - totalMainPath - 1;
  if (homeStep < homeColLength) {
    const [col, row] = HOME_COLUMN[color][homeStep];
    return { state: TOKEN_STATE.HOME_COLUMN, col, row, pathIndex: 53 + homeStep };
  }

  // Finished
  return { state: TOKEN_STATE.FINISHED, col: 7, row: 7, pathIndex: 100 };
}

/**
 * Check if a token can move given a dice value.
 */
export function canTokenMove(token, diceValue) {
  const { state, steps } = token;

  // Can only enter board with a 6
  if (state === TOKEN_STATE.HOME) {
    return diceValue === 6;
  }

  if (state === TOKEN_STATE.FINISHED) return false;

  // Check won't overshoot home
  const color = token.color;
  const totalMainPath = 51;
  const homeColLength = HOME_COLUMN[color].length;
  const totalSteps = totalMainPath + homeColLength + 1;
  const newSteps = steps + diceValue;

  return newSteps <= totalSteps;
}

/**
 * Get all tokens that can legally move for a player given dice value.
 */
export function getMovableTokens(tokens, color, diceValue) {
  return tokens.filter(t => t.color === color && canTokenMove(t, diceValue));
}

/**
 * Advance a token by diceValue steps.
 * Returns updated token object.
 */
export function moveToken(token, diceValue) {
  const newSteps = token.state === TOKEN_STATE.HOME ? 1 : token.steps + diceValue;
  const pos = getTokenPosition(token.color, newSteps);

  return {
    ...token,
    steps: newSteps,
    state: pos.state,
    col: pos.col,
    row: pos.row,
    pathIndex: pos.pathIndex,
  };
}

/**
 * Check if moving a token results in a capture.
 * Returns the captured token or null.
 */
export function checkCapture(movedToken, allTokens) {
  if (movedToken.state !== TOKEN_STATE.ACTIVE) return null;

  // Safe squares cannot be capture zones
  if (SAFE_SQUARES.includes(movedToken.pathIndex)) return null;

  // Find opponent tokens on same cell
  const captures = allTokens.filter(t =>
    t.color !== movedToken.color &&
    t.state === TOKEN_STATE.ACTIVE &&
    t.col === movedToken.col &&
    t.row === movedToken.row
  );

  return captures.length > 0 ? captures : null;
}

/**
 * Send a captured token back to its home yard.
 */
export function sendToHome(token, tokenIndex) {
  const [col, row] = HOME_YARD[token.color][tokenIndex];
  return {
    ...token,
    steps: 0,
    state: TOKEN_STATE.HOME,
    col,
    row,
    pathIndex: -1,
  };
}

/**
 * Check if a player has won (all 4 tokens finished).
 */
export function checkWin(tokens, color) {
  return tokens.filter(t => t.color === color && t.state === TOKEN_STATE.FINISHED).length === MAX_TOKENS;
}

/**
 * Check if any moves are possible; if not, skip turn.
 */
export function hasAnyMove(tokens, color, diceValue) {
  return getMovableTokens(tokens, color, diceValue).length > 0;
}

/**
 * Get the 3D world position for a token.
 */
export function getToken3DPosition(token, tokenIdx) {
  if (token.state === TOKEN_STATE.HOME) {
    const [col, row] = HOME_YARD[token.color][tokenIdx];
    return gridTo3D(col, row, 0.22);
  }
  if (token.state === TOKEN_STATE.FINISHED) {
    const [x, z] = HOME_FINISH_POSITIONS[token.color][tokenIdx];
    return [x - 7, 0.22, z - 7];
  }
  return gridTo3D(token.col, token.row, 0.22);
}

/**
 * Build the full move path (array of [col,row] squares) for animation.
 */
export function buildMovePath(token, diceValue) {
  const path = [];

  if (token.state === TOKEN_STATE.HOME) {
    // Jump from yard to start square
    const startIdx = START_SQUARES[token.color];
    const [col, row] = MAIN_PATH[startIdx];
    path.push({ col, row });
    return path;
  }

  const color = token.color;
  const startIdx = START_SQUARES[color];
  const totalMainPath = 51;
  const homeColLength = HOME_COLUMN[color].length;

  for (let i = 1; i <= diceValue; i++) {
    const newSteps = token.steps + i;

    if (newSteps <= totalMainPath) {
      const idx = (startIdx + newSteps - 1) % MAIN_PATH.length;
      const [col, row] = MAIN_PATH[idx];
      path.push({ col, row });
    } else {
      const homeStep = newSteps - totalMainPath - 1;
      if (homeStep < homeColLength) {
        const [col, row] = HOME_COLUMN[color][homeStep];
        path.push({ col, row });
      } else {
        path.push({ col: 7, row: 7 });
      }
    }
  }

  return path;
}

/**
 * Initialize token objects for a player.
 */
export function initPlayerTokens(color) {
  return HOME_YARD[color].map((pos, i) => ({
    id: `${color}-${i}`,
    color,
    index: i,
    steps: 0,
    state: TOKEN_STATE.HOME,
    col: pos[0],
    row: pos[1],
    pathIndex: -1,
  }));
}

/**
 * Get display name for player color.
 */
export function getPlayerDisplayName(color, playerIndex, isAI = false) {
  const names = {
    red: 'Red',
    blue: 'Blue',
    green: 'Green',
    yellow: 'Yellow',
  };
  const suffix = isAI ? ' (AI)' : '';
  return `${names[color]}${suffix}`;
}
