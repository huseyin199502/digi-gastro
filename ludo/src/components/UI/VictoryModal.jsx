/**
 * LudoVerse 3D — Victory Modal
 * Spectacular win screen with confetti, rankings, and options
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import { useNavigate } from 'react-router-dom';
import { PLAYER_COLORS } from '../../utils/ludoConstants';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import { useAudio } from '../../hooks/useAudio';

const RANK_MEDALS = ['🥇', '🥈', '🥉', '4️⃣'];

export default function VictoryModal() {
  const { showVictory, winner, winnerRank, closeVictory } = useUIStore();
  const { resetGame, players } = useGameStore();
  const navigate = useNavigate();
  const { playVictory } = useAudio();

  useEffect(() => {
    if (showVictory) playVictory();
  }, [showVictory]);

  const handleRestart = () => {
    closeVictory();
    resetGame();
  };

  const handleMenu = () => {
    closeVictory();
    navigate('/');
  };

  if (!winner) return null;
  const winColor = PLAYER_COLORS[winner];

  return (
    <AnimatePresence>
      {showVictory && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Radial backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${winColor.primary}22 0%, rgba(0,0,0,0.85) 70%)`,
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Main card */}
          <GlassCard className="relative z-10 w-[min(24rem,92vw)] text-center" animate>
            {/* Trophy */}
            <motion.div
              className="text-8xl mb-4 block"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
            >
              🏆
            </motion.div>

            {/* Winner announcement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-white/60 font-body text-sm uppercase tracking-widest mb-1">Winner!</p>
              <h2
                className="font-display text-4xl font-black mb-1"
                style={{ color: winColor.primary, textShadow: `0 0 30px ${winColor.primary}` }}
              >
                {winner.charAt(0).toUpperCase() + winner.slice(1)}
              </h2>
              <p className="text-white/50 text-sm mb-6">
                {players.find(p => p.color === winner)?.isAI ? 'The AI dominates! 🤖' : 'Congratulations! 🎉'}
              </p>
            </motion.div>

            {/* Rankings */}
            {winnerRank.length > 1 && (
              <motion.div
                className="mb-6 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Final Rankings</p>
                {winnerRank.map((color, i) => {
                  const c = PLAYER_COLORS[color];
                  return (
                    <div
                      key={color}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                    >
                      <span className="text-xl">{RANK_MEDALS[i]}</span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: c.primary }}
                      />
                      <span className="text-white font-semibold capitalize">{color}</span>
                      {players.find(p => p.color === color)?.isAI && (
                        <span className="text-xs text-white/40 ml-auto">AI</span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <GradientButton onClick={handleRestart} variant="gold" fullWidth id="play-again-btn">
                🔄 Play Again
              </GradientButton>
              <GradientButton onClick={handleMenu} variant="ghost" fullWidth id="victory-menu-btn">
                🏠 Main Menu
              </GradientButton>
            </motion.div>
          </GlassCard>

          {/* Floating emoji confetti */}
          {['🎉', '🎊', '✨', '🌟', '💫', '🏆'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl pointer-events-none"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -50,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 100,
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
