/**
 * LudoVerse 3D — GlassCard UI Component
 * Reusable glassmorphism card
 */

import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  onClick,
  animate = false,
  delay = 0,
  hover = false,
  padding = 'p-6',
}) {
  const base = `
    relative overflow-hidden
    backdrop-blur-md
    bg-white/8 border border-white/15
    rounded-2xl shadow-2xl
    ${padding}
    ${hover ? 'cursor-pointer transition-all duration-300' : ''}
    ${className}
  `;

  const hoverEffect = hover ? {
    scale: 1.02,
    boxShadow: '0 25px 50px rgba(0,0,0,0.4), 0 0 30px rgba(99,102,241,0.2)',
  } : {};

  if (animate) {
    return (
      <motion.div
        className={base}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={hoverEffect}
        onClick={onClick}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={base}
      whileHover={hover ? hoverEffect : {}}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
      {children}
    </motion.div>
  );
}
