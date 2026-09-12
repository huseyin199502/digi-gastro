/**
 * LudoVerse 3D — About Page
 * Game rules, controls, credits, version info
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/UI/GlassCard';

const RULES = [
  { icon: '🎲', title: 'Roll to Move', desc: 'Each player rolls a dice on their turn and moves a token the rolled number of squares.' },
  { icon: '6️⃣', title: 'Enter with a Six', desc: 'Tokens can only leave their home yard by rolling a 6. Rolling 6 also grants an extra turn.' },
  { icon: '⭐', title: 'Safe Squares', desc: 'Star squares are safe zones. Tokens on them cannot be captured by opponents.' },
  { icon: '💥', title: 'Capture', desc: 'Landing on an opponent\'s token sends it back to their home yard. You get an extra turn!' },
  { icon: '🏠', title: 'Home Column', desc: 'Each player has a colored safe path leading to the center home. Only that player\'s tokens can enter.' },
  { icon: '🏆', title: 'Win Condition', desc: 'Get all 4 tokens to the center home first to win the game!' },
  { icon: '🎯', title: 'Three Sixes', desc: 'Rolling 6 three times in a row forfeits your turn as a penalty.' },
];

const CONTROLS = [
  { key: 'Click Token', action: 'Select and move a token' },
  { key: 'Click Dice', action: 'Roll the dice' },
  { key: 'Escape', action: 'Pause / Unpause' },
  { key: 'Mouse Drag', action: 'Rotate camera' },
  { key: 'Scroll', action: 'Zoom camera in/out' },
  { key: 'Right Click + Drag', action: 'Pan camera' },
];

const CREDITS = [
  { role: 'Engine', tech: 'Three.js / React Three Fiber' },
  { role: 'UI Framework', tech: 'React 18 + Vite' },
  { role: 'State Management', tech: 'Zustand' },
  { role: 'Animations', tech: 'GSAP + Framer Motion' },
  { role: 'Styling', tech: 'Tailwind CSS' },
  { role: 'Post-FX', tech: '@react-three/postprocessing' },
  { role: 'Audio', tech: 'Web Audio API' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'LudoMaster 3D — About';
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-auto py-8 px-4"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)' }}
    >
      {/* Back */}
      <motion.button
        className="fixed top-4 left-4 text-white/60 hover:text-white flex items-center gap-1 text-sm z-10"
        onClick={() => navigate(-1)}
        whileHover={{ x: -3 }}
      >
        ← Back
      </motion.button>

      <div className="max-w-lg mx-auto pt-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-6xl block mb-3">🎲</span>
          <h1 className="font-display text-4xl font-black text-white">LudoMaster 3D</h1>
          <p className="text-indigo-400 font-body text-sm mt-1">Version 1.0.0</p>
          <p className="text-white/40 font-body text-sm mt-2 max-w-xs mx-auto">
            A premium AAA-quality 3D Ludo experience built with cutting-edge web technologies.
          </p>
        </motion.div>

        {/* Rules */}
        <GlassCard animate delay={0.1} className="mb-4">
          <h2 className="font-display text-white font-bold text-lg mb-4">📋 Game Rules</h2>
          <div className="space-y-4">
            {RULES.map((rule, i) => (
              <motion.div
                key={i}
                className="flex gap-3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <span className="text-2xl flex-shrink-0">{rule.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{rule.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed mt-0.5">{rule.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Controls */}
        <GlassCard animate delay={0.2} className="mb-4">
          <h2 className="font-display text-white font-bold text-lg mb-4">🎮 Controls</h2>
          <div className="space-y-2">
            {CONTROLS.map((ctrl, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/8 last:border-0">
                <code className="text-indigo-300 text-xs bg-indigo-900/30 px-2 py-0.5 rounded font-mono">
                  {ctrl.key}
                </code>
                <span className="text-white/60 text-sm">{ctrl.action}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Tech Credits */}
        <GlassCard animate delay={0.3} className="mb-4">
          <h2 className="font-display text-white font-bold text-lg mb-4">⚡ Built With</h2>
          <div className="space-y-2">
            {CREDITS.map((c, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/8 last:border-0">
                <span className="text-white/50 text-sm">{c.role}</span>
                <span className="text-indigo-300 text-sm font-semibold">{c.tech}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI difficulty info */}
        <GlassCard animate delay={0.4} className="mb-4">
          <h2 className="font-display text-white font-bold text-lg mb-3">🤖 AI Strategy</h2>
          <div className="space-y-2 text-white/60 text-sm leading-relaxed">
            <p>• <span className="text-white">Captures first</span> — always prioritizes sending your tokens home</p>
            <p>• <span className="text-white">Safe movement</span> — avoids unsafe squares when possible</p>
            <p>• <span className="text-white">Token entry</span> — uses 6s to bring new tokens out</p>
            <p>• <span className="text-white">Home push</span> — aggressively advances tokens close to home</p>
            <p>• <span className="text-white">10% randomness</span> — keeps the AI slightly unpredictable</p>
          </div>
        </GlassCard>

        {/* Developer Credit */}
        <motion.div
          className="text-center text-white/30 text-xs font-body mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Made with ❤️ by <span className="text-indigo-400 font-semibold">Vitthal Khavatagoppa</span>
        </motion.div>
      </div>
    </div>
  );
}
