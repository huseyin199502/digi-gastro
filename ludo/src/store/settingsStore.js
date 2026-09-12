/**
 * LudoVerse 3D — Settings Store (Zustand)
 * Persisted in localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Audio
      musicEnabled: true,
      sfxEnabled: true,
      musicVolume: 0.5,
      sfxVolume: 0.7,

      // Graphics
      graphicsQuality: 'high', // 'low' | 'medium' | 'high' | 'ultra'
      showFPS: false,
      shadows: true,
      bloom: true,
      ambientOcclusion: true,
      particles: true,

      // Camera
      cameraSpeed: 1.0,
      autoCamera: true,
      cameraFOV: 60,

      // Animation
      animationSpeed: 1.0,

      // Display
      darkMode: true,
      fullscreen: false,

      // Actions
      setMusicEnabled: (v) => set({ musicEnabled: v }),
      setSfxEnabled: (v) => set({ sfxEnabled: v }),
      setMusicVolume: (v) => set({ musicVolume: v }),
      setSfxVolume: (v) => set({ sfxVolume: v }),
      setGraphicsQuality: (v) => set({ graphicsQuality: v }),
      setShowFPS: (v) => set({ showFPS: v }),
      setShadows: (v) => set({ shadows: v }),
      setBloom: (v) => set({ bloom: v }),
      setAO: (v) => set({ ambientOcclusion: v }),
      setParticles: (v) => set({ particles: v }),
      setCameraSpeed: (v) => set({ cameraSpeed: v }),
      setAutoCamera: (v) => set({ autoCamera: v }),
      setCameraFOV: (v) => set({ cameraFOV: v }),
      setAnimationSpeed: (v) => set({ animationSpeed: v }),
      setDarkMode: (v) => set({ darkMode: v }),
      toggleFullscreen: () => {
        const fs = !get().fullscreen;
        set({ fullscreen: fs });
        if (fs) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      },
    }),
    {
      name: 'ludoverse-settings',
    }
  )
);
