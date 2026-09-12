/**
 * LudoVerse 3D — useDice hook (Fixed)
 * Simpler timing to prevent state lock
 */

import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAudio } from './useAudio';

export function useDice() {
  const [isRolling, setIsRolling] = useState(false);
  const rollDiceAction = useGameStore(s => s.rollDiceAction);
  const diceValue      = useGameStore(s => s.diceValue);
  const rollRef        = useRef(false);
  const { playDiceRoll } = useAudio();

  const rollDice = useCallback(async () => {
    if (rollRef.current) return;
    rollRef.current = true;
    setIsRolling(true);
    playDiceRoll();

    try {
      await rollDiceAction();
    } catch (e) {
      console.warn('Roll error:', e);
    }

    // Brief animation window then release
    setTimeout(() => {
      setIsRolling(false);
      rollRef.current = false;
    }, 2200);
  }, [rollDiceAction, playDiceRoll]);

  return { isRolling, rollDice };
}
