/**
 * LudoVerse 3D — AI Decision Engine
 * Smart AI that prioritizes captures, protection, and reaching home
 */

import {
  getMovableTokens,
  moveToken,
  checkCapture,
  getTokenPosition,
} from './ludoLogic';
import { TOKEN_STATE, SAFE_SQUARES, MAIN_PATH } from './ludoConstants';

/**
 * Score a potential move for AI evaluation (higher = better move).
 */
function scoreMove(token, diceValue, allTokens, aiColor) {
  const moved = moveToken(token, diceValue);
  let score = 0;

  // 1. Prefer entering a new token (gets token on board)
  if (token.state === TOKEN_STATE.HOME && moved.state !== TOKEN_STATE.HOME) {
    score += 30;
  }

  // 2. Heavily reward captures
  const captures = checkCapture(moved, allTokens);
  if (captures && captures.length > 0) {
    score += 50 * captures.length;
    // Extra points if captured token was near their home
    captures.forEach(cap => {
      if (cap.steps > 40) score += 20; // Very valuable capture
    });
  }

  // 3. Reward reaching home column (safe zone)
  if (moved.state === TOKEN_STATE.HOME_COLUMN) {
    score += 25;
  }

  // 4. Reward finishing a token
  if (moved.state === TOKEN_STATE.FINISHED) {
    score += 100;
  }

  // 5. Reward landing on a safe square
  if (moved.state === TOKEN_STATE.ACTIVE && SAFE_SQUARES.includes(moved.pathIndex)) {
    score += 15;
  }

  // 6. Penalize moving into danger (opponent tokens nearby on unsafe square)
  if (moved.state === TOKEN_STATE.ACTIVE && !SAFE_SQUARES.includes(moved.pathIndex)) {
    const danger = allTokens.some(t =>
      t.color !== aiColor &&
      t.state === TOKEN_STATE.ACTIVE &&
      Math.abs(t.steps - (moved.steps)) <= 6 &&
      t.steps < moved.steps
    );
    if (danger) score -= 20;
  }

  // 7. Prefer advancing furthest token (greedy progress)
  score += moved.steps * 0.3;

  // 8. Use 6 to enter token if any are home
  const homeTokens = allTokens.filter(t => t.color === aiColor && t.state === TOKEN_STATE.HOME);
  if (diceValue === 6 && homeTokens.length > 0 && token.state === TOKEN_STATE.HOME) {
    score += 20;
  }

  // 9. Protect tokens that are close to finishing
  const opponentNear = allTokens.some(t =>
    t.color !== aiColor &&
    t.state === TOKEN_STATE.ACTIVE &&
    !SAFE_SQUARES.includes(t.pathIndex) &&
    t.col === token.col &&
    t.row === token.row
  );
  if (!opponentNear && token.steps > 40) {
    score += 10; // Token is safe and progressing well
  }

  return score;
}

/**
 * Main AI decision function.
 * Returns the best token to move.
 * @param {Array} allTokens - all tokens in the game
 * @param {string} aiColor - AI player color
 * @param {number} diceValue - rolled dice value
 * @returns {Object|null} - best token to move or null
 */
export function aiChooseToken(allTokens, aiColor, diceValue) {
  const movable = getMovableTokens(allTokens, aiColor, diceValue);
  if (movable.length === 0) return null;
  if (movable.length === 1) return movable[0];

  // Score each possible move
  const scored = movable.map(token => ({
    token,
    score: scoreMove(token, diceValue, allTokens, aiColor),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Add slight randomness to make AI less predictable (10% chance of random)
  if (Math.random() < 0.10 && scored.length > 1) {
    const randomIdx = Math.floor(Math.random() * Math.min(2, scored.length));
    return scored[randomIdx].token;
  }

  return scored[0].token;
}

/**
 * Decide AI think time (simulate thinking)
 */
export function getAIThinkTime(difficulty = 'medium') {
  const ranges = {
    easy:   [500, 1500],
    medium: [800, 1800],
    hard:   [300, 1000],
  };
  const [min, max] = ranges[difficulty] || ranges.medium;
  return Math.floor(Math.random() * (max - min) + min);
}
