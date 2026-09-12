/**
 * LudoVerse 3D — Game Camera
 * Orbit controls with smooth follow and cinematic transitions
 */

import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSettingsStore } from '../../store/settingsStore';
import { useGameStore } from '../../store/gameStore';
import { GAME_PHASE } from '../../utils/ludoConstants';
import gsap from 'gsap';

export default function GameCamera() {
  const controlsRef = useRef();
  const { camera, size } = useThree();
  const { cameraSpeed, autoCamera, cameraFOV } = useSettingsStore();
  const phase = useGameStore(s => s.phase);
  const winner = useGameStore(s => s.winner);

  // Kamera an das Seitenverhältnis anpassen (Hochformat: ganzes Brett einpassen)
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    if (aspect < 1) {
      const vfov = (cameraFOV * Math.PI) / 180;
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
      const half = Math.min(vfov, hfov) / 2;
      const dist = (9.8 / Math.sin(half)) * 1.06;
      const elev = (60 * Math.PI) / 180;
      camera.position.set(0, dist * Math.sin(elev), dist * Math.cos(elev));
    } else {
      camera.position.set(0, 14, 16);
    }
    camera.fov = cameraFOV;
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [size.width, size.height, cameraFOV]);

  // Update FOV when settings change
  useEffect(() => {
    camera.fov = cameraFOV;
    camera.updateProjectionMatrix();
  }, [cameraFOV]);

  // Cinematic camera on victory
  useEffect(() => {
    if (phase === GAME_PHASE.FINISHED && winner && autoCamera) {
      const tl = gsap.timeline();
      tl.to(camera.position, { x: 8, y: 6, z: 10, duration: 2, ease: 'power2.inOut' })
        .to(camera.position, { x: -8, y: 8, z: 8, duration: 2.5, ease: 'power1.inOut' })
        .to(camera.position, { x: 0, y: 18, z: 2, duration: 2, ease: 'power2.out' });
    }
  }, [phase, winner]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={90}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={Math.PI / 8}
      zoomSpeed={0.8 * cameraSpeed}
      rotateSpeed={0.6 * cameraSpeed}
      panSpeed={0.8 * cameraSpeed}
      dampingFactor={0.08}
      enableDamping
      target={[0, 0, 0]}
    />
  );
}
