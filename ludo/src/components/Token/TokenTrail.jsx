/**
 * LudoVerse 3D — Token Trail Effect
 * Particle trail that follows a moving token
 */

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TRAIL_COUNT = 12;

export default function TokenTrail({ position, color, active }) {
  const meshRef = useRef();
  const trailPositions = useRef([]);
  const timeRef = useRef(0);

  useEffect(() => {
    trailPositions.current = Array(TRAIL_COUNT).fill(null).map(() => [...position]);
  }, []);

  useFrame((_, delta) => {
    if (!active || !meshRef.current) return;
    timeRef.current += delta;

    // Shift trail
    trailPositions.current.unshift([...position]);
    if (trailPositions.current.length > TRAIL_COUNT) {
      trailPositions.current.pop();
    }

    const pos = meshRef.current.geometry.attributes.position.array;
    trailPositions.current.forEach(([x, y, z], i) => {
      pos[i * 3]     = x;
      pos[i * 3 + 1] = y + i * 0.04;
      pos[i * 3 + 2] = z;
    });
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.material.opacity = 0.6 - timeRef.current * 0.1;
    if (meshRef.current.material.opacity <= 0) {
      meshRef.current.material.opacity = 0.6;
      timeRef.current = 0;
    }
  });

  if (!active) return null;

  const initialPositions = new Float32Array(TRAIL_COUNT * 3);
  for (let i = 0; i < TRAIL_COUNT; i++) {
    initialPositions[i * 3]     = position[0];
    initialPositions[i * 3 + 1] = position[1];
    initialPositions[i * 3 + 2] = position[2];
  }

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={TRAIL_COUNT}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
