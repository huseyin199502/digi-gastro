/**
 * NightSky — Twinkling Starfield background for the Ludo 3D scene.
 * Renders twinkling star points in a wide dome surrounding the board.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Stars ──────────────────────────────────────────────────────────────────────
function Stars({ count = 950 }) {
  const meshRef = useRef();
  const timeRef = useRef(0);

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz  = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI * 0.7; // extend lower for horizon coverage
      const r     = 70 + Math.random() * 50;
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) - 10; // offset center downwards to align with tilt
      pos[i * 3 + 2] = -(r * Math.sin(phi) * Math.sin(theta));
      sz[i] = 0.15 + Math.random() * 0.75;
    }
    return { positions: pos, sizes: sz };
  }, [count]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [positions, sizes]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: 0xffffff,
    sizeAttenuation: true,
    size: 0.28,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  }), []);

  useFrame((_, dt) => {
    timeRef.current += dt;
    if (mat) mat.opacity = 0.55 + Math.sin(timeRef.current * 1.2) * 0.35;
  });

  return <points ref={meshRef} geometry={geo} material={mat} />;
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function NightSky() {
  return (
    <>
      <Stars count={1100} />
    </>
  );
}
