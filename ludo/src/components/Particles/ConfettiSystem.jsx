/**
 * LudoVerse 3D — Confetti System
 * Victory confetti particle burst
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CONFETTI_COUNT = 200;
const COLORS = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7, 0xf97316, 0xec4899];

export default function ConfettiSystem({ active = false }) {
  const meshRef = useRef();

  const { positions, velocities, colors, rotations, rotSpeeds } = useMemo(() => {
    const positions = new Float32Array(CONFETTI_COUNT * 3);
    const velocities = [];
    const colors = new Float32Array(CONFETTI_COUNT * 3);
    const rotations = new Float32Array(CONFETTI_COUNT * 3);
    const rotSpeeds = [];

    const color = new THREE.Color();
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 10 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      velocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: -0.04 - Math.random() * 0.04,
        z: (Math.random() - 0.5) * 0.08,
      });

      color.setHex(COLORS[Math.floor(Math.random() * COLORS.length)]);
      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      rotations[i * 3]     = Math.random() * Math.PI * 2;
      rotations[i * 3 + 1] = Math.random() * Math.PI * 2;
      rotations[i * 3 + 2] = Math.random() * Math.PI * 2;

      rotSpeeds.push({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1,
      });
    }
    return { positions, velocities, colors, rotations, rotSpeeds };
  }, []);

  const posRef = useRef(positions.slice());
  const rotRef = useRef(rotations.slice());

  useFrame(() => {
    if (!active || !meshRef.current) return;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array;

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      pos[i * 3]     += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;

      // Reset if fallen below board
      if (pos[i * 3 + 1] < -2) {
        pos[i * 3]     = (Math.random() - 0.5) * 14;
        pos[i * 3 + 1] = 8 + Math.random() * 4;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={CONFETTI_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={CONFETTI_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}
