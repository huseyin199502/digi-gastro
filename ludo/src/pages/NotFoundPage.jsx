/**
 * LudoVerse 3D — 404 Not Found Page
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/UI/GradientButton';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
    >
      <motion.div
        className="text-center px-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <motion.div
          className="text-9xl mb-6"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎲
        </motion.div>
        <h1 className="font-display text-6xl font-black text-white mb-2">404</h1>
        <p className="text-white/50 text-lg font-body mb-8">
          Oops! You rolled off the board.
        </p>
        <GradientButton variant="primary" onClick={() => navigate('/')} size="lg" id="home-404-btn">
          🏠 Back to Home
        </GradientButton>
      </motion.div>
    </div>
  );
}
