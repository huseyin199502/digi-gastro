/**
 * LudoVerse 3D — Scene Lighting
 * Bright, clean lighting — board clearly visible, tokens pop
 */

import React from 'react';

export default function SceneLighting() {
  return (
    <>
      {/* Strong ambient — ensures everything is well-lit */}
      <ambientLight intensity={1.2} color="#ffffff" />

      {/* Key light — top-right-front, casts clean shadows */}
      <directionalLight
        position={[6, 20, 12]}
        intensity={2.0}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.001}
      />

      {/* Soft fill from opposite side */}
      <directionalLight
        position={[-8, 10, -6]}
        intensity={0.5}
        color="#e8f0ff"
      />

      {/* Overhead point */}
      <pointLight position={[0, 18, 0]} intensity={0.3} color="#ffffff" distance={40} decay={2} />
    </>
  );
}
