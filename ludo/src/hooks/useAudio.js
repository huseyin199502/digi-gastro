/**
 * LudoVerse 3D — useAudio hook
 * Wraps audioManager with settings reactivity
 */

import { useEffect, useCallback } from 'react';
import audioManager from '../utils/audioManager';
import { useSettingsStore } from '../store/settingsStore';

export function useAudio() {
  const { musicEnabled, sfxEnabled, musicVolume, sfxVolume } = useSettingsStore();

  useEffect(() => {
    audioManager.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  useEffect(() => {
    audioManager.setSfxEnabled(sfxEnabled);
  }, [sfxEnabled]);

  useEffect(() => {
    audioManager.setMusicVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    audioManager.setSfxVolume(sfxVolume);
  }, [sfxVolume]);

  const initAudio = useCallback(() => {
    audioManager.init();
    audioManager.resume();
  }, []);

  return {
    initAudio,
    playDiceRoll: () => audioManager.playDiceRoll(),
    playTokenMove: () => audioManager.playTokenMove(),
    playTokenEnter: () => audioManager.playTokenEnter(),
    playCapture: () => audioManager.playCapture(),
    playVictory: () => audioManager.playVictory(),
    playClick: () => audioManager.playClick(),
    playHover: () => audioManager.playHover(),
    playSelect: () => audioManager.playSelect(),
  };
}
