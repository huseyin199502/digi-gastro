/**
 * LudoVerse 3D — Game Page
 * Full game wrapper: 3D scene + 2D HUD + modals
 */

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useAudio } from '../hooks/useAudio';
import { useGameEngine } from '../hooks/useGameEngine';

import GameScene from './GameScene';
import GameUI from './GameUI';
import PauseModal from '../components/UI/PauseModal';
import VictoryModal from '../components/UI/VictoryModal';

export default function GamePage() {
  const [searchParams] = useSearchParams();
  const { initGame } = useGameStore();
  const { setLoading } = useUIStore();
  const { initAudio } = useAudio();

  // Initialize game engine (side effects: sounds, notifications)
  useGameEngine();

  // Parse URL config and start game
  useEffect(() => {
    const mode    = searchParams.get('mode') || 'multiplayer';
    const count   = Math.min(Math.max(parseInt(searchParams.get('players') || '4'), 2), 4);
    const aiParam = searchParams.get('ai') || '';
    const aiPlayers = aiParam ? aiParam.split(',').filter(Boolean) : [];

    // Brief loading screen
    setLoading(true, 20);
    initAudio();

    const timer = setTimeout(() => {
      setLoading(true, 70);

      setTimeout(() => {
        initGame(count, aiPlayers);
        setLoading(false, 100);

        // If first player is AI, trigger AI turn
        setTimeout(() => {
          const state = useGameStore.getState();
          if (state.players[state.currentPlayerIdx]?.isAI) {
            useGameStore.getState().processAITurn();
          }
        }, 200);
      }, 400);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0" onClick={initAudio}>
        <GameScene />
      </div>

      {/* 2D HUD Overlay */}
      <GameUI />

      {/* Modals */}
      <PauseModal />
      <VictoryModal />
    </div>
  );
}
