/**
 * LudoVerse 3D — useGameEngine hook
 * Monitors game state changes and triggers side effects
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useAudio } from './useAudio';
import { GAME_PHASE } from '../utils/ludoConstants';

export function useGameEngine() {
  const phase = useGameStore(s => s.phase);
  const capturedThisTurn = useGameStore(s => s.capturedThisTurn);
  const winner = useGameStore(s => s.winner);
  const gameOver = useGameStore(s => s.gameOver);
  const winnerOrder = useGameStore(s => s.winnerOrder);
  const players = useGameStore(s => s.players);
  const setVictory = useUIStore(s => s.setVictory);
  const addNotification = useUIStore(s => s.addNotification);
  const { playCapture, playVictory, playSelect } = useAudio();
  const prevPhase = useRef(phase);
  const prevCapture = useRef(false);
  const prevWinner = useRef(null);

  // Capture sound
  useEffect(() => {
    if (capturedThisTurn && !prevCapture.current) {
      playCapture();
      addNotification('Token captured! 💥', 'capture');
    }
    prevCapture.current = capturedThisTurn;
  }, [capturedThisTurn]);

  // Selection phase indicator
  useEffect(() => {
    if (phase === GAME_PHASE.SELECTING && prevPhase.current !== GAME_PHASE.SELECTING) {
      playSelect();
    }
    prevPhase.current = phase;
  }, [phase]);

  // Victory
  useEffect(() => {
    if (gameOver && winner && winner !== prevWinner.current) {
      prevWinner.current = winner;
      playVictory();
      setTimeout(() => {
        setVictory(winner, winnerOrder);
      }, 800);
    }
  }, [gameOver, winner]);

  // New player ranked (not overall winner)
  const playerRanks = players.map(p => p.rank).join(',');
  useEffect(() => {
    const latestRanked = players.find(p => p.rank && p.rank > 1);
    if (latestRanked && latestRanked.rank) {
      addNotification(`${latestRanked.name} finished ${latestRanked.rank === 2 ? '2nd' : '3rd'}! 🏆`, 'rank');
    }
  }, [playerRanks]);

  return { phase };
}
