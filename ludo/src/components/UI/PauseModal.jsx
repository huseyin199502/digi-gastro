/**
 * LudoVerse 3D — Pause Modal
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';

export default function PauseModal() {
  const { showPause, setPause } = useUIStore();
  const { resumeGame, resetGame } = useGameStore();
  const navigate = useNavigate();

  const handleResume = () => {
    setPause(false);
    resumeGame();
  };

  const handleRestart = () => {
    setPause(false);
    resetGame();
  };

  const handleQuit = () => {
    setPause(false);
    navigate('/');
  };

  return (
    <AnimatePresence>
      {showPause && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleResume} />

          <GlassCard className="relative z-10 w-80 text-center" animate>
            {/* Pause icon */}
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ⏸️
            </motion.div>

            <h2 className="font-display text-2xl font-bold text-white mb-2">Game Paused</h2>
            <p className="text-white/50 text-sm mb-6 font-body">Take a breather. The board awaits!</p>

            <div className="flex flex-col gap-3">
              <GradientButton onClick={handleResume} variant="primary" fullWidth size="md" id="resume-btn">
                ▶️ Resume Game
              </GradientButton>
              <GradientButton onClick={handleRestart} variant="gold" fullWidth size="md" id="restart-btn">
                🔄 Restart
              </GradientButton>
              <GradientButton onClick={() => navigate('/settings')} variant="ghost" fullWidth size="md" id="settings-pause-btn">
                ⚙️ Settings
              </GradientButton>
              <GradientButton onClick={handleQuit} variant="danger" fullWidth size="md" id="quit-btn">
                🏠 Quit to Menu
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
