/**
 * LudoVerse 3D — GradientButton UI Component
 * Animated gradient button with hover glow and click ripple
 */

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../../hooks/useAudio';

export default function GradientButton({
  children,
  onClick,
  variant = 'primary',   // 'primary' | 'danger' | 'success' | 'gold' | 'ghost'
  size = 'md',           // 'sm' | 'md' | 'lg' | 'xl'
  disabled = false,
  className = '',
  icon = null,
  fullWidth = false,
  id,
}) {
  const { playClick, playHover } = useAudio();

  const handleClick = useCallback(() => {
    if (disabled) return;
    playClick();
    onClick?.();
  }, [onClick, disabled, playClick]);

  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 shadow-indigo-500/30',
    danger:  'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-500/30',
    success: 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 shadow-green-500/30',
    gold:    'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 shadow-amber-500/30',
    ghost:   'bg-white/10 hover:bg-white/20 border border-white/20 shadow-none backdrop-blur-sm',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  return (
    <motion.button
      id={id}
      className={`
        relative overflow-hidden font-display font-semibold tracking-wide
        text-white rounded-xl transition-all duration-200
        shadow-lg ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleClick}
      onMouseEnter={() => !disabled && playHover()}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* Shine sweep effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
}
