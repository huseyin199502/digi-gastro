/**
 * LudoVerse 3D — Dice Roll Button (Improved)
 * More reliable roll trigger with clear state feedback
 */

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { GAME_PHASE, PLAYER_COLORS } from '../../utils/ludoConstants';
import { useDice } from '../../hooks/useDice';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function DiceRollButton() {
  const phase        = useGameStore(s => s.phase);
  const currentColor = useGameStore(s => s.currentColor);
  const diceValue    = useGameStore(s => s.diceValue);
  const diceRolled   = useGameStore(s => s.diceRolled);
  const players      = useGameStore(s => s.players);

  const { isRolling, rollDice } = useDice();

  const currentPlayer = players.find(p => p.color === currentColor);
  const colorInfo     = PLAYER_COLORS[currentColor] || PLAYER_COLORS.red;
  const isAITurn      = phase === GAME_PHASE.AI_TURN;
  const canRoll       = phase === GAME_PHASE.ROLLING && !isRolling && !isAITurn;

  // Status text
  const statusText = (() => {
    if (isAITurn)                        return '🤖 AI thinking...';
    if (phase === GAME_PHASE.MOVING)     return '⚡ Moving...';
    if (phase === GAME_PHASE.SELECTING)  return '👆 Pick a token';
    if (phase === GAME_PHASE.FINISHED)   return '🏆 Game over!';
    if (isRolling)                       return '🎲 Rolling...';
    return 'Click to roll';
  })();

  const handleRoll = useCallback(() => {
    if (canRoll) rollDice();
  }, [canRoll, rollDice]);

  return (
    <div className="flex flex-col items-center gap-2 min-w-[140px]">
      {/* Turn label */}
      <div className="text-center">
        <p className="text-white/50 text-[10px] font-body uppercase tracking-widest">
          {isAITurn ? 'AI Turn' : 'Your Turn'}
        </p>
        <p
          className="font-display font-bold text-sm leading-tight"
          style={{ color: colorInfo.primary, textShadow: `0 0 8px ${colorInfo.primary}` }}
        >
          {currentPlayer?.name || currentColor}
        </p>
      </div>

      {/* Dice button */}
      <motion.button
        id="roll-dice-btn"
        onClick={handleRoll}
        disabled={!canRoll}
        className={`
          relative w-16 h-16 rounded-xl flex items-center justify-center
          text-3xl select-none border-2 transition-colors duration-200
          ${canRoll
            ? 'cursor-pointer border-white/30 bg-white/12 hover:bg-white/20'
            : 'cursor-default border-white/10 bg-white/5 opacity-70'
          }
        `}
        style={canRoll ? {
          boxShadow: `0 0 18px ${colorInfo.primary}55, 0 4px 12px rgba(0,0,0,0.4)`,
        } : {}}
        animate={
          isRolling ? {
            rotate: [0, -20, 20, -15, 15, -8, 8, 0],
            scale:  [1, 1.1, 0.95, 1.08, 0.97, 1.03, 0.99, 1],
          } : canRoll ? {
            y: [0, -4, 0],
          } : {}
        }
        transition={
          isRolling
            ? { duration: 0.7, repeat: Infinity, repeatType: 'loop' }
            : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
        }
        whileTap={canRoll ? { scale: 0.9 } : {}}
      >
        {/* Dice face or default */}
        <span>
          {diceValue ? DICE_FACES[diceValue - 1] : '🎲'}
        </span>

        {/* Pulsing border when rollable */}
        {canRoll && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 pointer-events-none"
            style={{ borderColor: colorInfo.primary }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.04, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

        {/* AI spinner */}
        {isAITurn && (
          <motion.div
            className="absolute inset-0 rounded-xl border-t-2 border-purple-400 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.button>

      {/* Status text */}
      <p className="text-white/50 text-[10px] text-center font-body">{statusText}</p>

      {/* Dice result badge */}
      <AnimatePresence mode="wait">
        {diceValue && (
          <motion.div
            key={diceValue}
            initial={{ scale: 0, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="px-3 py-1 rounded-full text-xs font-bold text-center"
            style={{
              backgroundColor: `${colorInfo.primary}28`,
              color: colorInfo.primary,
              border: `1px solid ${colorInfo.primary}55`,
            }}
          >
            {diceValue === 6 ? `⚡ Rolled 6 — Extra turn!` : `Rolled ${diceValue}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
