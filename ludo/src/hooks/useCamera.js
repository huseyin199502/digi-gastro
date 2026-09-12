/**
 * LudoVerse 3D — useCamera hook
 * Camera animation state and cinematic transitions
 */

import { useRef, useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { gridTo3D } from '../utils/ludoConstants';
import gsap from 'gsap';

export function useCamera(cameraRef) {
  const { cameraSpeed, autoCamera } = useSettingsStore();
  const targetRef = useRef([0, 12, 14]);

  /**
   * Smoothly move camera to look at a board position
   */
  const focusOn = useCallback((col, row, elevated = false) => {
    if (!cameraRef?.current || !autoCamera) return;
    const [x, , z] = gridTo3D(col, row);
    const yOffset = elevated ? 16 : 12;
    const zOffset = elevated ? 18 : 14;

    gsap.to(cameraRef.current.position, {
      x: x * 0.3,
      y: yOffset,
      z: z * 0.3 + zOffset,
      duration: 1.2 / cameraSpeed,
      ease: 'power2.inOut',
    });
  }, [autoCamera, cameraSpeed]);

  /**
   * Reset to default overhead view
   */
  const resetView = useCallback(() => {
    if (!cameraRef?.current) return;
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 14,
      z: 16,
      duration: 1.0 / cameraSpeed,
      ease: 'power2.inOut',
    });
  }, [cameraSpeed]);

  /**
   * Victory cinematic flythrough
   */
  const victoryCamera = useCallback(() => {
    if (!cameraRef?.current) return;
    const tl = gsap.timeline();
    tl.to(cameraRef.current.position, { x: 8, y: 6, z: 8, duration: 1.5, ease: 'power2.inOut' })
      .to(cameraRef.current.position, { x: -8, y: 8, z: 8, duration: 2.0, ease: 'power1.inOut' })
      .to(cameraRef.current.position, { x: 0, y: 18, z: 0, duration: 1.5, ease: 'power2.out' });
  }, []);

  /**
   * Dice roll camera focus (zoom to dice area)
   */
  const focusDice = useCallback(() => {
    if (!cameraRef?.current || !autoCamera) return;
    gsap.to(cameraRef.current.position, {
      x: 5,
      y: 6,
      z: 14,
      duration: 0.8 / cameraSpeed,
      ease: 'power2.out',
    });
  }, [autoCamera, cameraSpeed]);

  return { focusOn, resetView, victoryCamera, focusDice };
}
