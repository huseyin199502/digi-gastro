/**
 * LudoVerse 3D — Loading Screen
 * Animated loader with progress bar and tips
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';

const TIPS = [
  'Roll a 6 to enter a token onto the board!',
  'Land on a star square for a safe haven.',
  'Capture opponents to send them home!',
  'Rolling 6 gives you an extra turn.',
  'Get all 4 tokens home to win!',
  'Three 6s in a row forfeits your turn.',
];

export default function LoadingScreen() {
  const { showLoading, loadingProgress } = useUIStore();
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 2500);
    return () => clearInterval(iv);
  }, []);

  return (
    <AnimatePresence>
      {showLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated rings */}
          <div className="relative mb-10">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2 border-indigo-500/30"
                style={{
                  width: 120 + i * 50,
                  height: 120 + i * 50,
                  top: -(i * 25),
                  left: -(i * 25),
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: 'linear' }}
              />
            ))}

            {/* Logo */}
            <motion.div
              className="w-28 h-28 rounded-full bg-indigo-600/30 border-2 border-indigo-500/60 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-5xl">🎲</span>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            className="font-display text-4xl font-black text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            digi-gastro <span className="text-indigo-400">Ludo</span>
          </motion.h1>
          <p className="text-white/40 font-body text-sm mb-8">Lade Spiel…</p>

          {/* Progress bar */}
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              style={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Tip */}
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIdx}
              className="text-white/50 text-sm font-body text-center max-w-xs px-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              💡 {TIPS[tipIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
