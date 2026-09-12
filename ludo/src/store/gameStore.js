/**
 * LudoVerse 3D — Main Game Store (Zustand)
 * Full game state: players, tokens, turn management, dice
 */

import { create } from 'zustand';
import { PLAYER_NAMES, TOKEN_STATE, GAME_PHASE } from '../utils/ludoConstants';
import {
  initPlayerTokens,
  moveToken,
  checkCapture,
  sendToHome,
  checkWin,
  buildMovePath,
  getMovableTokens,
  getTokenPosition,
} from '../utils/ludoLogic';
import { rollDice, delay, nextPlayer } from '../utils/helpers';
import { aiChooseToken, getAIThinkTime } from '../utils/aiLogic';

function buildInitialState(playerCount = 4, aiPlayers = []) {
  const colors = PLAYER_NAMES.slice(0, playerCount);
  const players = colors.map((color) => ({
    color,
    name: color.charAt(0).toUpperCase() + color.slice(1),
    isAI: aiPlayers.includes(color),
    finishedTokens: 0,
    rank: null,
  }));

  const tokens = {};
  colors.forEach(color => { tokens[color] = initPlayerTokens(color); });

  return {
    players,
    colors,
    tokens,
    currentPlayerIdx: 0,
    currentColor: colors[0],
    diceValue: null,
    diceRolled: false,
    phase: GAME_PHASE.ROLLING,
    capturedThisTurn: false,
    rollCount: 0,
    winner: null,
    winnerOrder: [],
    gameOver: false,
    moveAnimating: false,
    selectedTokenId: null,
    turnNumber: 0,
  };
}

export const useGameStore = create((set, get) => ({
  ...buildInitialState(),
  initialized: false,

  // ─── Init ──────────────────────────────────────────────────────────────────
  initGame: (playerCount = 4, aiPlayers = []) => {
    set({ ...buildInitialState(playerCount, aiPlayers), initialized: true });
  },

  resetGame: () => {
    const { players } = get();
    const playerCount = players.length;
    const aiPlayers = players.filter(p => p.isAI).map(p => p.color);
    set({ ...buildInitialState(playerCount, aiPlayers), initialized: true });
  },

  // ─── Dice ──────────────────────────────────────────────────────────────────
  rollDiceAction: async () => {
    const state = get();
    if (state.phase !== GAME_PHASE.ROLLING || state.diceRolled || state.moveAnimating) return null;

    const value = rollDice();
    const consecutive = value === 6 ? state.rollCount + 1 : 0;

    // 3 consecutive sixes = forfeit
    if (consecutive >= 3) {
      set({ diceValue: value, diceRolled: true, rollCount: 0 });
      await delay(600);
      get().endTurn();
      return value;
    }

    const allTokens = Object.values(state.tokens).flat();
    const movable = getMovableTokens(allTokens, state.currentColor, value);

    set({ diceValue: value, diceRolled: true, rollCount: consecutive });

    if (movable.length === 0) {
      await delay(900);
      get().endTurn();
    } else if (movable.length === 1) {
      // Auto-select only movable token
      set({ phase: GAME_PHASE.SELECTING });
      await delay(250);
      get().selectToken(movable[0].id);
    } else {
      set({ phase: GAME_PHASE.SELECTING });
    }

    return value;
  },

  // ─── Token Selection ───────────────────────────────────────────────────────
  selectToken: async (tokenId) => {
    const state = get();
    if (state.phase !== GAME_PHASE.SELECTING || state.moveAnimating) return;

    const { tokens, currentColor, diceValue } = state;
    const allTokens = Object.values(tokens).flat();
    const token = allTokens.find(t => t.id === tokenId);

    if (!token || token.color !== currentColor) return;

    const movable = getMovableTokens(allTokens, currentColor, diceValue);
    if (!movable.find(t => t.id === tokenId)) return;

    const path = buildMovePath(token, diceValue);
    set({ phase: GAME_PHASE.MOVING, moveAnimating: true, selectedTokenId: tokenId });
    await get()._animateTokenMove(token, path, diceValue);
  },

  // ─── Internal: apply move + handle result ─────────────────────────────────
  _animateTokenMove: async (token, path, diceValue) => {
    const state = get();
    const { tokens, currentColor } = state;

    let currentSteps = token.steps;
    let currentToken = { ...token };
    const actualStepsToTake = token.state === TOKEN_STATE.HOME ? 1 : diceValue;

    // Move token step by step
    for (let step = 1; step <= actualStepsToTake; step++) {
      currentSteps = token.state === TOKEN_STATE.HOME ? 1 : (currentSteps + 1);
      const posInfo = getTokenPosition(currentColor, currentSteps);
      
      currentToken.steps = currentSteps;
      currentToken.state = posInfo.state;
      currentToken.col = posInfo.col;
      currentToken.row = posInfo.row;

      const stepTokens = { ...get().tokens };
      stepTokens[currentColor] = stepTokens[currentColor].map(t =>
        t.id === token.id ? { ...currentToken } : t
      );

      set({ tokens: stepTokens });

      // Wait for the single hop animation to finish (takes 380ms)
      await delay(420);
    }

    // Now after reaching final spot, handle capture
    const finalTokens = { ...get().tokens };
    const finalMovedToken = finalTokens[currentColor].find(t => t.id === token.id);

    let captured = false;
    const allAfterMove = Object.values(finalTokens).flat();
    const capturedList = checkCapture(finalMovedToken, allAfterMove);
    if (capturedList && capturedList.length > 0) {
      capturedList.forEach(cap => {
        finalTokens[cap.color] = finalTokens[cap.color].map(t =>
          t.id === cap.id ? sendToHome(t, t.index ?? 0) : t
        );
      });
      captured = true;
    }

    // Update state with final tokens
    const playerTokens = finalTokens[currentColor];
    const won = checkWin(Object.values(finalTokens).flat(), currentColor);
    const finishedCount = playerTokens.filter(t => t.state === TOKEN_STATE.FINISHED).length;

    set({
      tokens: finalTokens,
      capturedThisTurn: captured,
      players: get().players.map(p =>
        p.color === currentColor ? { ...p, finishedTokens: finishedCount } : p
      ),
    });

    if (captured) {
      await delay(600); // short wait to show capture action
    }

    // Handle win
    if (won) {
      const { winnerOrder, players } = get();
      const rank = winnerOrder.length + 1;
      const newOrder = [...winnerOrder, currentColor];
      const updatedPlayers = players.map(p =>
        p.color === currentColor ? { ...p, rank } : p
      );
      const allDone = newOrder.length >= get().colors.length - 1;

      set({
        winnerOrder: newOrder,
        players: updatedPlayers,
        winner: newOrder[0],
        gameOver: allDone,
        phase: allDone ? GAME_PHASE.FINISHED : GAME_PHASE.ROLLING,
        moveAnimating: false,
        diceRolled: false,
        selectedTokenId: null,
        diceValue: null,
      });

      if (allDone) {
        import('../store/uiStore').then(({ useUIStore }) => {
          useUIStore.getState().setVictory(newOrder[0], newOrder);
        });
      } else {
        // Winner continues if they get extra turn, else next player
        if (!captured && diceValue !== 6) get().endTurn();
      }
      return;
    }

    // Extra turn on capture or six
    const extraTurn = captured || diceValue === 6;
    set({ moveAnimating: false, selectedTokenId: null });

    if (extraTurn) {
      const isAI = get().players[get().currentPlayerIdx]?.isAI;
      if (isAI) {
        set({ phase: GAME_PHASE.AI_TURN, diceRolled: false, diceValue: null });
        await delay(300);
        get().processAITurn();
      } else {
        set({ phase: GAME_PHASE.ROLLING, diceRolled: false, diceValue: null });
      }
    } else {
      get().endTurn();
    }
  },

  // ─── Turn Management ───────────────────────────────────────────────────────
  endTurn: () => {
    const { currentPlayerIdx, players, colors } = get();
    const nextIdx = nextPlayer(currentPlayerIdx, colors.length);
    const nextColor = colors[nextIdx];
    const nextPlayerObj = players[nextIdx];

    set({
      currentPlayerIdx: nextIdx,
      currentColor: nextColor,
      diceValue: null,
      diceRolled: false,
      phase: nextPlayerObj?.isAI ? GAME_PHASE.AI_TURN : GAME_PHASE.ROLLING,
      capturedThisTurn: false,
      rollCount: 0,
      selectedTokenId: null,
      turnNumber: get().turnNumber + 1,
    });

    if (nextPlayerObj?.isAI) {
      get().processAITurn();
    }
  },

  // ─── AI Turn ───────────────────────────────────────────────────────────────
  processAITurn: async () => {
    const state = get();
    if (state.phase !== GAME_PHASE.AI_TURN) return;

    const thinkTime = getAIThinkTime('medium');
    await delay(thinkTime);

    // AI rolls
    const value = rollDice();
    const consecutive = value === 6 ? get().rollCount + 1 : 0;

    // Triple six penalty
    if (consecutive >= 3) {
      set({ diceValue: value, diceRolled: true, rollCount: 0 });
      await delay(500);
      get().endTurn();
      return;
    }

    set({ diceValue: value, diceRolled: true, rollCount: consecutive });
    await delay(1600);

    const { tokens, currentColor } = get();
    const allTokens = Object.values(tokens).flat();
    const chosenToken = aiChooseToken(allTokens, currentColor, value);

    if (!chosenToken) {
      await delay(400);
      get().endTurn();
      return;
    }

    set({ phase: GAME_PHASE.MOVING, moveAnimating: true, selectedTokenId: chosenToken.id });
    const path = buildMovePath(chosenToken, value);
    await get()._animateTokenMove(chosenToken, path, value);
  },

  // ─── Pause ─────────────────────────────────────────────────────────────────
  pauseGame: () => set({ phase: GAME_PHASE.PAUSED }),
  resumeGame: () => {
    const { players, currentPlayerIdx } = get();
    const current = players[currentPlayerIdx];
    const isAI = current?.isAI;
    set({ phase: isAI ? GAME_PHASE.AI_TURN : GAME_PHASE.ROLLING });
    if (isAI) get().processAITurn();
  },
}));
