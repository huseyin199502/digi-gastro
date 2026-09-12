/**
 * LudoVerse 3D — Home Page
 * Animated hero with 3D background, logo, and menu
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Stars, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import GlassCard from '../components/UI/GlassCard';
import GradientButton from '../components/UI/GradientButton';
import { useAudio } from '../hooks/useAudio';

// ── Floating 3D dice decorations ──────────────────────────────────────────────

function FloatingDice({ position, color, scale = 1, speed = 1 }) {
  const meshRef = useRef();
  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
    </Float>
  );
}

function FloatingGem({ position, color, speed = 0.8 }) {
  return (
    <Float speed={speed} rotationIntensity={2} floatIntensity={1.2}>
      <mesh position={position}>
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

function HomeBackground() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#b8c4ff" />
      <pointLight position={[-5, 5, -5]} intensity={1} color="#ef4444" distance={15} />
      <pointLight position={[5, 5, -5]} intensity={1} color="#3b82f6" distance={15} />
      <pointLight position={[-5, 5, 5]} intensity={1} color="#22c55e" distance={15} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#eab308" distance={15} />

      <Stars radius={60} depth={50} count={4000} factor={3} saturation={0.3} fade speed={0.5} />

      <FloatingDice position={[-4, 2, -3]} color="#ef4444" scale={0.8} speed={0.8} />
      <FloatingDice position={[4, 1, -2]} color="#3b82f6" scale={0.6} speed={1.1} />
      <FloatingDice position={[-3, -2, -4]} color="#22c55e" scale={0.9} speed={0.7} />
      <FloatingDice position={[3.5, -1.5, -3]} color="#eab308" scale={0.7} speed={1.3} />

      <FloatingGem position={[-6, 0, -5]} color="#a855f7" speed={0.9} />
      <FloatingGem position={[6, 1, -4]} color="#ec4899" speed={1.2} />
      <FloatingGem position={[0, 3, -6]} color="#06b6d4" speed={0.6} />
      <FloatingGem position={[-2, -3, -5]} color="#f97316" speed={1.4} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

// ── Menu items ────────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { id: 'play-btn', label: '🎮 Play', desc: '2–4 players', path: '/lobby', variant: 'primary' },
  { id: 'ai-btn', label: '🤖 vs AI', desc: 'Challenge the AI', path: '/lobby?mode=ai', variant: 'gold' },
  { id: 'settings-btn', label: '⚙️ Settings', desc: 'Audio & Graphics', path: '/settings', variant: 'ghost' },
  { id: 'about-btn', label: '📖 About', desc: 'Rules & Credits', path: '/about', variant: 'ghost' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { initAudio } = useAudio();

  useEffect(() => {
    document.title = 'LudoMaster 3D — Home';
  }, []);

  const handleNav = (path) => {
    initAudio();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {/* 3D background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <HomeBackground />
        </Canvas>
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60 pointer-events-none" />

      {/* UI Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* Logo section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Animated icon */}
          <motion.div
            className="text-8xl mb-4 block"
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3, repeat: Infinity },
            }}
          >
            🎲
          </motion.div>

          <h1 className="font-display text-6xl md:text-7xl font-black text-white leading-none tracking-tight">
            Ludo<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Master</span>
          </h1>
          <motion.div
            className="text-4xl md:text-5xl font-display font-black text-indigo-300 mb-3"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            3D
          </motion.div>
          <p className="text-white/50 font-body text-lg tracking-wide">
            The Ultimate Premium Ludo Experience
          </p>

          {/* Floating particles row */}
          <div className="flex justify-center gap-3 mt-4">
            {['🔴', '🔵', '🟢', '🟡'].map((emoji, i) => (
              <motion.span
                key={i}
                className="text-2xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Menu cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {MENU_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <GlassCard hover padding="p-4" onClick={() => handleNav(item.path)}>
                <GradientButton
                  id={item.id}
                  variant={item.variant}
                  fullWidth
                  size="lg"
                  onClick={() => handleNav(item.path)}
                  className="mb-1"
                >
                  {item.label}
                </GradientButton>
                <p className="text-white/40 text-xs text-center font-body mt-1">{item.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          className="absolute bottom-6 text-white/25 text-xs font-body hover:text-indigo-300 transition-colors cursor-default"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          v1.0.0 — Made by Vitthal Khavatagoppa
        </motion.p>
      </div>
    </div>
  );
}
