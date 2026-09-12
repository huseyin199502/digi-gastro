/**
 * LudoVerse 3D — Sparkle System
 * Sparkle particles around selected/highlighted tokens
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SPARKLE_COUNT = 30;

export default function SparkleSystem({ position = [0, 0, 0], color = '#ffffff', active = false }) {
  const meshRef = useRef();
  const timeRef = useRef(0);

  const { offsets, speeds, phases } = useMemo(() => {
    const offsets = [];
    const speeds = [];
    const phases = [];
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const angle = (i / SPARKLE_COUNT) * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.4;
      offsets.push({
        x: Math.cos(angle) * radius,
        y: Math.random() * 0.8,
        z: Math.sin(angle) * radius,
      });
      speeds.push(0.5 + Math.random() * 1.5);
      phases.push(Math.random() * Math.PI * 2);
    }
    return { offsets, speeds, phases };
  }, []);

  const positions = useMemo(() => new Float32Array(SPARKLE_COUNT * 3), []);

  useFrame((_, delta) => {
    if (!active || !meshRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const phase = phases[i];
      const speed = speeds[i];
      positions[i * 3]     = position[0] + offsets[i].x * Math.cos(t * speed + phase);
      positions[i * 3 + 1] = position[1] + offsets[i].y + Math.sin(t * speed * 2 + phase) * 0.2;
      positions[i * 3 + 2] = position[2] + offsets[i].z * Math.sin(t * speed + phase);
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={SPARKLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color={color}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}
