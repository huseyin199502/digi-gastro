/**
 * LudoVerse 3D — 3D Dice Component
 * Physics-style rolling animation with faces, glow, and camera focus
 */

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { GAME_PHASE } from '../../utils/ludoConstants';
import { useGameStore } from '../../store/gameStore';

// Dice face rotations: maps face value to rotation [x, y, z] in radians
const FACE_ROTATIONS = {
  1: [0, 0, 0],
  2: [0, Math.PI / 2, 0],
  3: [-Math.PI / 2, 0, 0],
  4: [Math.PI / 2, 0, 0],
  5: [0, -Math.PI / 2, 0],
  6: [Math.PI, 0, 0],
};

function createDiceFaceTexture(value) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#e8e8e8');
  ctx.fillStyle = grad;
  ctx.roundRect(4, 4, size - 8, size - 8, 16);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Dot positions for each face value
  const dotPositions = {
    1: [[size/2, size/2]],
    2: [[size*0.3, size*0.3], [size*0.7, size*0.7]],
    3: [[size*0.3, size*0.3], [size/2, size/2], [size*0.7, size*0.7]],
    4: [[size*0.3, size*0.3], [size*0.7, size*0.3], [size*0.3, size*0.7], [size*0.7, size*0.7]],
    5: [[size*0.3, size*0.3], [size*0.7, size*0.3], [size/2, size/2], [size*0.3, size*0.7], [size*0.7, size*0.7]],
    6: [[size*0.3, size*0.25], [size*0.7, size*0.25], [size*0.3, size/2], [size*0.7, size/2], [size*0.3, size*0.75], [size*0.7, size*0.75]],
  };

  ctx.fillStyle = '#1a1a2e';
  const r = 10;
  dotPositions[value].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx, dy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  return new THREE.CanvasTexture(canvas);
}

export default function Dice3D({ position = [10, 2, 5] }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const groupRef = useRef();
  const isRolling = useRef(false);
  const timeRef = useRef(0);

  const phase = useGameStore(s => s.phase);
  const diceValue = useGameStore(s => s.diceValue);
  const currentColor = useGameStore(s => s.currentColor);
  const [displayValue, setDisplayValue] = useState(1);

  const faces = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map(v => createDiceFaceTexture(v));
  }, []);

  // React to phase changes
  useEffect(() => {
    if (!meshRef.current || !groupRef.current) return;

    if (phase === GAME_PHASE.AI_TURN || phase === GAME_PHASE.ROLLING) {
      // Idle bob
      isRolling.current = false;
    }
  }, [phase]);

  // Animate to final face when dice value arrives
  useEffect(() => {
    if (!diceValue || !meshRef.current) return;
    const targetRot = FACE_ROTATIONS[diceValue];
    setDisplayValue(diceValue);

    // Settle animation
    gsap.to(meshRef.current.rotation, {
      x: targetRot[0],
      y: targetRot[1],
      z: targetRot[2],
      duration: 1.8,
      ease: 'back.out(0.8)',
    });

    // Glow flash
    if (glowRef.current) {
      gsap.fromTo(glowRef.current,
        { intensity: 2.0 },
        { intensity: 0.3, duration: 1.8, ease: 'power2.out' }
      );
    }
  }, [diceValue]);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    if (!groupRef.current) return;

    // Idle bobbing
    groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.12;

    // Spin when rolling (AI or human) and no value yet
    const spinning = (phase === GAME_PHASE.AI_TURN || phase === GAME_PHASE.ROLLING) && !diceValue;
    if (spinning && meshRef.current) {
      meshRef.current.rotation.x += delta * 2.5;
      meshRef.current.rotation.y += delta * 1.8;
      meshRef.current.rotation.z += delta * 1.0;
    }

    // Glow pulse
    if (glowRef.current) {
      const base = diceValue ? 1.5 : 0.4;
      glowRef.current.intensity = base + Math.sin(t * 3) * 0.3;
    }
  });

  const colorMap = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  };
  const playerColor = colorMap[currentColor] || '#ffffff';

  return (
    <group ref={groupRef} position={position}>
      {/* Dice cube — 1.4 units */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        <meshStandardMaterial
          map={faces[(displayValue || 1) - 1]}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>

      {/* Colored glow shell */}
      <mesh>
        <boxGeometry args={[0.99, 0.99, 0.99]} />
        <meshStandardMaterial
          color={playerColor}
          emissive={playerColor}
          emissiveIntensity={0.15}
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        color={playerColor}
        intensity={0.5}
        distance={5}
        decay={2}
      />

      {/* Shadow blob */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* "ROLL" label above dice when it's time to roll */}
      {phase === GAME_PHASE.ROLLING && !diceValue && (
        <group position={[0, 1.2, 0]}>
          <mesh>
            <planeGeometry args={[1.2, 0.4]} />
            <meshBasicMaterial color={playerColor} transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}
