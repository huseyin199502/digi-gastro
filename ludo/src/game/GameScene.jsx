/**
 * LudoVerse 3D — Game Scene
 * Main R3F Canvas with board, tokens, dice, lighting, camera, effects
 */

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';

import LudoBoard from '../components/Board/LudoBoard';
import Token3D from '../components/Token/Token3D';
import Dice3D from '../components/Dice/Dice3D';
import GameCamera from '../components/Camera/GameCamera';
import SceneLighting from '../components/Lighting/SceneLighting';
import PostProcessing from '../components/Effects/PostProcessing';
import ConfettiSystem from '../components/Particles/ConfettiSystem';
import NightSky from '../components/Background/NightSky';

function SceneTokens() {
  const tokens = useGameStore(s => s.tokens);
  const colors = useGameStore(s => s.colors);
  return (
    <>
      {colors.map(color =>
        (tokens[color] || []).map((token, idx) => (
          <Token3D key={`${token.id}-${token.col}-${token.row}`} token={token} tokenIdx={idx} />
        ))
      )}
    </>
  );
}

export default function GameScene() {
  const phase = useGameStore(s => s.phase);
  const gameOver = useGameStore(s => s.gameOver);
  const { shadows, graphicsQuality } = useSettingsStore();

  // Im Hochformat wird der 3D-Würfel ausgeblendet (HUD-Würfel unten ist die Steuerung).
  const [portrait, setPortrait] = useState(
    typeof window !== 'undefined' && window.matchMedia('(orientation: portrait)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const on = () => setPortrait(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const dpr = graphicsQuality === 'low' ? 1 : graphicsQuality === 'medium' ? 1.5 : 2;

  return (
    <Canvas
      shadows={shadows}
      dpr={[1, dpr]}
      camera={{ position: [1, 12, 18], fov: 52, near: 0.1, far: 200 }}
      gl={{
        antialias: graphicsQuality !== 'low',
        powerPreference: 'high-performance',
        alpha: false,
      }}
    >
      <Suspense fallback={null}>
        {/* Scene background — must be set inside Canvas for WebGL */}
        <color attach="background" args={['#070714']} />
        
        {/* Stars and Moon */}
        <NightSky />

        {/* Camera */}
        <GameCamera />

        {/* Lighting */}
        <SceneLighting />

        {/* Main board */}
        <LudoBoard />

        {/* All player tokens */}
        <SceneTokens />

        {/* 3D Dice — auf Desktop rechts, im Hochformat aus (HUD-Würfel unten) */}
        {!portrait && <Dice3D position={[11, 1.5, 2]} />}

        {/* Victory confetti */}
        <ConfettiSystem active={gameOver} />

        {/* Post-processing */}
        <PostProcessing />
      </Suspense>
    </Canvas>
  );
}
