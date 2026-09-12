/**
 * LudoVerse 3D — Token 3D (Reference-accurate pawn)
 * Large flat white base disc + colorful tapered body + round head
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { PLAYER_COLORS, TOKEN_STATE, GAME_PHASE } from '../../utils/ludoConstants';
import { getToken3DPosition, canTokenMove } from '../../utils/ludoLogic';
import { useGameStore } from '../../store/gameStore';
import { useAudio } from '../../hooks/useAudio';

export default function Token3D({ token, tokenIdx }) {
  const groupRef  = useRef();
  const ringRef   = useRef();
  const timeRef   = useRef(Math.random() * Math.PI * 2);
  const prevSteps = useRef(token.steps);
  const baseY     = useRef(0.02);
  const isMoving  = useRef(false);
  const [hovered, setHovered] = useState(false);

  const phase         = useGameStore(s => s.phase);
  const currentColor  = useGameStore(s => s.currentColor);
  const diceValue     = useGameStore(s => s.diceValue);
  const moveAnimating = useGameStore(s => s.moveAnimating);
  const selectedId    = useGameStore(s => s.selectedTokenId);
  const selectToken   = useGameStore(s => s.selectToken);
  const { playSelect, playTokenMove } = useAudio();

  const colorInfo    = PLAYER_COLORS[token.color] || PLAYER_COLORS.red;
  const col          = colorInfo.primary;
  const isCurrentPlayer = token.color === currentColor;
  const isMovable    = phase === GAME_PHASE.SELECTING && isCurrentPlayer &&
                       !moveAnimating && diceValue != null && canTokenMove(token, diceValue);
  const isSelected   = selectedId === token.id;

  // Sync position when coordinates or state change (e.g. initial mount, game restart, capture)
  useEffect(() => {
    if (!groupRef.current || isMoving.current) return;
    const pos = getToken3DPosition(token, tokenIdx);
    groupRef.current.position.set(pos[0], pos[1], pos[2]);
    baseY.current = pos[1];
    prevSteps.current = token.steps; // Also reset step ref to keep in sync
  }, [token.col, token.row, token.state, tokenIdx, token.steps]);

  // Animate on move
  useEffect(() => {
    if (token.steps === prevSteps.current) return;
    prevSteps.current = token.steps;
    if (!groupRef.current) return;

    const newPos = getToken3DPosition(token, tokenIdx);
    const cur    = groupRef.current.position;
    playTokenMove?.();
    isMoving.current = true;

    const arcY = Math.max(cur.y, newPos[1]) + 0.9;
    gsap.to(cur, { x: newPos[0], z: newPos[2], duration: 0.38, ease: 'power2.inOut' });
    gsap.to(cur, {
      y: arcY, duration: 0.18, ease: 'power2.out',
      onComplete: () => gsap.to(cur, {
        y: newPos[1], duration: 0.20, ease: 'bounce.out',
        onComplete: () => { isMoving.current = false; baseY.current = newPos[1]; },
      }),
    });
  }, [token.steps, token.state]);

  useFrame((_, dt) => {
    timeRef.current += dt;
    const t = timeRef.current;
    if (!groupRef.current) return;
    if (!isMoving.current && token.state !== TOKEN_STATE.FINISHED)
      groupRef.current.position.y = baseY.current + Math.sin(t * 1.5 + tokenIdx * 0.9) * 0.05;
    if (token.state === TOKEN_STATE.FINISHED)
      groupRef.current.position.y = baseY.current + Math.abs(Math.sin(t * 2.5 + tokenIdx)) * 0.15;
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 2.5;
      ringRef.current.visible = isMovable || isSelected;
    }
  });

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (!isMovable) return;
    playSelect?.(); selectToken(token.id);
  }, [isMovable, selectToken, token.id]);

  const handleOver = useCallback((e) => {
    e.stopPropagation();
    if (isMovable) { setHovered(true); document.body.style.cursor = 'pointer'; }
  }, [isMovable]);

  const handleOut = useCallback(() => { setHovered(false); document.body.style.cursor = 'auto'; }, []);

  const BASE_SCALE = 1.6;
  const sc  = BASE_SCALE * (isSelected ? 1.18 : hovered ? 1.08 : 1.0);
  const emi = isMovable ? 0.55 : isSelected ? 0.35 : 0.08;

  return (
    <group ref={groupRef}>
      <group scale={[sc, sc, sc]} onClick={handleClick} onPointerOver={handleOver} onPointerOut={handleOut}>

        {/* Größere unsichtbare Trefferfläche für dicke Finger (Touch) */}
        <mesh visible={false} position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.72, 8, 8]} />
        </mesh>

        {/* ── Pawn body (sits directly on board) ── */}
        <mesh castShadow receiveShadow position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.14, 0.26, 0.34, 20]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={emi} roughness={0.2} metalness={0.5} />
        </mesh>

        {/* ── Neck ── */}
        <mesh castShadow position={[0, 0.39, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.12, 16]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={emi} roughness={0.2} metalness={0.5} />
        </mesh>

        {/* ── Round head ── */}
        <mesh castShadow position={[0, 0.58, 0]}>
          <sphereGeometry args={[0.22, 24, 20]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={emi} roughness={0.18} metalness={0.55} />
        </mesh>

        {/* Specular dot */}
        <mesh position={[0.08, 0.65, 0.14]}>
          <sphereGeometry args={[0.034, 8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0} metalness={1} />
        </mesh>

        {isMovable && <pointLight color={col} intensity={0.9} distance={1.8} decay={2} />}
      </group>

      {/* Spinning selection ring */}
      <mesh ref={ringRef} position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]} visible={false}>
        <ringGeometry args={[0.38, 0.46, 40]} />
        <meshBasicMaterial color={col} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
