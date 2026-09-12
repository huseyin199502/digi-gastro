/**
 * LudoVerse 3D — Player Panel
 * Displays player name, token status dots, progress bar, AI indicator
 */

import React from 'react';
import { motion } from 'framer-motion';
import { PLAYER_COLORS, TOKEN_STATE } from '../../utils/ludoConstants';
import { useGameStore } from '../../store/gameStore';

function TokenDot({ state, color }) {
  const isHome = state === TOKEN_STATE.HOME;
  const isDone = state === TOKEN_STATE.FINISHED;
  return (
    <div
      className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
        isDone ? 'scale-125' : isHome ? 'opacity-30' : 'opacity-100'
      }`}
      style={{
        backgroundColor: isDone
          ? PLAYER_COLORS[color].primary
          : isHome
          ? 'transparent'
          : PLAYER_COLORS[color].primary,
        borderColor: PLAYER_COLORS[color].primary,
        boxShadow: isDone ? `0 0 8px ${PLAYER_COLORS[color].primary}` : 'none',
      }}
    />
  );
}

export default function PlayerPanel({ player, isActive, rank }) {
  const tokens       = useGameStore(s => s.tokens);
  const playerTokens = tokens[player.color] || [];
  const colorInfo    = PLAYER_COLORS[player.color];

  return (
    <motion.div
      className="relative rounded-xl p-3 transition-all duration-300"
      style={{
        backgroundColor: isActive ? 'rgba(40, 25, 90, 0.95)' : 'rgba(30, 20, 70, 0.90)',
        border: isActive ? `2px solid ${colorInfo.primary}` : '1px solid rgba(255,255,255,0.3)',
        boxShadow: isActive ? `0 0 18px ${colorInfo.primary}55` : 'none',
      }}
      animate={{ scale: isActive ? 1.03 : 1 }}
    >
      {/* Active pulse dot */}
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: colorInfo.primary }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}

      {/* Name row */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0"
          style={{
            backgroundColor: colorInfo.primary,
            boxShadow: `0 0 8px ${colorInfo.primary}88`,
          }}
        />
        <span className="text-white font-bold text-sm truncate">
          {player.name}
          {player.isAI && <span className="text-xs text-white/50 ml-1">AI</span>}
        </span>
        {rank && (
          <span className="ml-auto text-xs font-bold text-amber-400">#{rank}</span>
        )}
      </div>

      {/* Token status dots */}
      <div className="flex gap-1.5">
        {playerTokens.map(t => (
          <TokenDot key={t.id} state={t.state} color={player.color} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: colorInfo.primary }}
          animate={{ width: `${(player.finishedTokens / 4) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* AI thinking pulse */}
      {player.isAI && isActive && (
        <motion.div
          className="mt-1.5 text-xs text-white/50 flex items-center gap-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <span className="w-1 h-1 rounded-full bg-purple-400 inline-block" />
          Thinking...
        </motion.div>
      )}
    </motion.div>
  );
}
