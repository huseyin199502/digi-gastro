/**
 * LudoVerse 3D — Lobby Page
 * Player count selection, mode selection, player setup before game
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PLAYER_COLORS, PLAYER_NAMES } from '../utils/ludoConstants';
import GlassCard from '../components/UI/GlassCard';
import GradientButton from '../components/UI/GradientButton';
import { useAudio } from '../hooks/useAudio';

const PLAYER_COUNT_OPTIONS = [2, 3, 4];

export default function LobbyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAIMode = searchParams.get('mode') === 'ai';

  const [playerCount, setPlayerCount] = useState(4);
  const [aiPlayers, setAiPlayers] = useState(isAIMode ? ['blue', 'green', 'yellow'] : []);
  const { initAudio, playClick } = useAudio();

  useEffect(() => {
    document.title = 'LudoMaster 3D — Setup';
    initAudio();
    if (isAIMode) {
      setAiPlayers(['blue', 'green', 'yellow']);
    }
  }, []);

  // Adjust AI players when count changes
  useEffect(() => {
    const available = PLAYER_NAMES.slice(0, playerCount);
    setAiPlayers(prev => prev.filter(c => available.includes(c)));
  }, [playerCount]);

  const toggleAI = (color) => {
    if (color === 'red') return; // Red is always human player 1
    setAiPlayers(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleStart = () => {
    const colors = PLAYER_NAMES.slice(0, playerCount);
    const ai = aiPlayers.filter(c => colors.includes(c));
    const params = new URLSearchParams({
      players: playerCount,
      mode: isAIMode || ai.length > 0 ? 'ai' : 'multiplayer',
    });
    if (ai.length > 0) params.set('ai', ai.join(','));
    navigate(`/game?${params.toString()}`);
  };

  const colors = PLAYER_NAMES.slice(0, playerCount);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-4 overflow-auto"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)' }}
    >
      {/* Back button */}
      <motion.button
        className="absolute top-4 left-4 text-white/60 hover:text-white flex items-center gap-1 text-sm"
        onClick={() => navigate('/')}
        whileHover={{ x: -3 }}
      >
        ← Back
      </motion.button>

      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-4xl font-black text-white text-center mb-2">
          {isAIMode ? '🤖 vs AI' : '🎮 New Game'}
        </h1>
        <p className="text-white/40 text-center font-body mb-8">Configure your game</p>

        {/* Player count */}
        <GlassCard className="mb-4">
          <h2 className="font-display text-white font-bold mb-4 text-lg">Number of Players</h2>
          <div className="flex gap-3">
            {PLAYER_COUNT_OPTIONS.map(n => (
              <motion.button
                key={n}
                id={`player-count-${n}`}
                className={`
                  flex-1 py-4 rounded-xl font-display text-2xl font-bold border-2 transition-all duration-200
                  ${playerCount === n
                    ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-indigo-500/30 shadow-lg'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
                  }
                `}
                onClick={() => { playClick(); setPlayerCount(n); }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {n}
                <p className="text-xs font-body mt-1 font-normal">
                  {n === 2 ? 'Duel' : n === 3 ? 'Triangle' : 'Classic'}
                </p>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* Player setup */}
        <GlassCard className="mb-4">
          <h2 className="font-display text-white font-bold mb-4 text-lg">Player Setup</h2>
          <div className="space-y-3">
            {colors.map((color, idx) => {
              const info = PLAYER_COLORS[color];
              const isHuman = !aiPlayers.includes(color);
              const isRed = color === 'red';

              return (
                <motion.div
                  key={color}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {/* Color dot */}
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/30 flex-shrink-0"
                    style={{
                      backgroundColor: info.primary,
                      boxShadow: `0 0 10px ${info.primary}88`,
                    }}
                  />

                  <div className="flex-1">
                    <p className="text-white font-semibold capitalize">{color}</p>
                    <p className="text-white/40 text-xs">Player {idx + 1}</p>
                  </div>

                  {/* Human/AI toggle */}
                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isHuman ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'
                      }`}
                      onClick={() => !isRed && toggleAI(color)}
                    >
                      👤 Human
                    </button>
                    {!isRed && (
                      <button
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          !isHuman ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/40'
                        }`}
                        onClick={() => toggleAI(color)}
                      >
                        🤖 AI
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Start button */}
        <GradientButton
          id="start-game-btn"
          variant="gold"
          fullWidth
          size="xl"
          onClick={handleStart}
        >
          🚀 Start Game
        </GradientButton>

        {/* Quick start options */}
        <div className="flex gap-2 mt-3">
          <GradientButton
            variant="ghost"
            fullWidth
            size="sm"
            onClick={() => {
              setPlayerCount(4);
              setAiPlayers([]);
              setTimeout(handleStart, 100);
            }}
          >
            ⚡ Quick 4P
          </GradientButton>
          <GradientButton
            variant="ghost"
            fullWidth
            size="sm"
            onClick={() => {
              setPlayerCount(4);
              setAiPlayers(['blue', 'green', 'yellow']);
              setTimeout(handleStart, 100);
            }}
          >
            🤖 Solo vs 3 AI
          </GradientButton>
        </div>
      </motion.div>
    </div>
  );
}
