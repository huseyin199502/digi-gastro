/**
 * LudoVerse 3D — FPS Counter
 */

import React, { useRef, useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

export default function FPSCounter() {
  const { showFPS } = useSettingsStore();
  const [fps, setFPS] = useState(0);
  const frameRef = useRef(0);
  const lastRef = useRef(performance.now());
  const rafRef = useRef();

  useEffect(() => {
    if (!showFPS) return;
    const tick = () => {
      frameRef.current++;
      const now = performance.now();
      if (now - lastRef.current >= 1000) {
        setFPS(frameRef.current);
        frameRef.current = 0;
        lastRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [showFPS]);

  if (!showFPS) return null;

  const color = fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className={`fixed top-4 left-4 z-50 font-mono text-xs font-bold ${color} bg-black/50 px-2 py-1 rounded backdrop-blur-sm`}>
      {fps} FPS
    </div>
  );
}
