/**
 * digi-gastro Ludo — Mobile-first HUD (Hochformat)
 * Kompakte Info-Leiste oben, Spieler-Chips, Würfel unten (Daumen-Zone).
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useSettingsStore } from '../store/settingsStore';
import { PLAYER_COLORS, TOKEN_STATE } from '../utils/ludoConstants';
import DiceRollButton from '../components/UI/DiceRollButton';
import FPSCounter from '../components/UI/FPSCounter';

function NotificationToast({ notification, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(notification.id), notification.duration);
    return () => clearTimeout(t);
  }, [notification.id]);
  const colors = {
    capture: 'rgba(180,30,30,0.9)',
    rank: 'rgba(160,110,0,0.9)',
    info: 'rgba(40,60,180,0.9)',
  };
  return (
    <motion.div
      style={{
        backgroundColor: colors[notification.type] || colors.info,
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 999,
        padding: '7px 14px',
        color: 'white',
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
      initial={{ opacity: 0, y: -16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.9 }}
    >
      {notification.message}
    </motion.div>
  );
}

function PlayerChip({ player, currentColor, gameOver, tokens }) {
  const ci = PLAYER_COLORS[player.color] || PLAYER_COLORS.red;
  const list = tokens[player.color] || [];
  const active = player.color === currentColor && !gameOver;
  return (
    <div
      className="ludo-chip"
      style={{
        color: ci.primary,
        borderColor: active ? ci.primary : 'rgba(255,255,255,0.22)',
        boxShadow: active ? `0 0 14px ${ci.primary}66` : 'none',
      }}
    >
      <div className="nm">
        {player.name}
        {player.isAI ? ' 🤖' : ''}
        {player.rank ? ` #${player.rank}` : ''}
      </div>
      <div className="dots">
        {list.map((t) => {
          const home = t.state === TOKEN_STATE.HOME;
          const done = t.state === TOKEN_STATE.FINISHED;
          return (
            <span
              key={t.id}
              className="dot"
              style={{
                background: done ? ci.primary : home ? 'transparent' : ci.primary,
                borderColor: ci.primary,
                boxShadow: done ? `0 0 6px ${ci.primary}` : 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function GameUI() {
  const players      = useGameStore(s => s.players);
  const tokens       = useGameStore(s => s.tokens);
  const currentColor = useGameStore(s => s.currentColor);
  const gameOver     = useGameStore(s => s.gameOver);
  const { setPause, notifications, removeNotification } = useUIStore();
  const { showFPS }  = useSettingsStore();

  const colorInfo = PLAYER_COLORS[currentColor] || PLAYER_COLORS.red;
  const currentPlayer = players.find(p => p.color === currentColor);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setPause(true); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div className="ludo-hud">
      {showFPS && <FPSCounter />}

      {/* ── TOP: Marke · Am Zug · Pause ── */}
      <div className="ludo-top">
        <div className="ludo-brand">
          <span style={{ fontSize: 15 }}>🎲</span>
          <span>digi-gastro Ludo</span>
        </div>
        <div className="ludo-turn" style={{ borderColor: colorInfo.primary }}>
          <span className="dot" style={{ background: colorInfo.primary, boxShadow: `0 0 8px ${colorInfo.primary}` }} />
          <span>{gameOver ? 'Spiel beendet' : (currentPlayer?.name || currentColor)}</span>
        </div>
        <button className="ludo-pause" onClick={() => setPause(true)} aria-label="Pause">⏸</button>
      </div>

      {/* ── Spieler-Chips ── */}
      <div className="ludo-players">
        {players.map((p) => (
          <PlayerChip key={p.color} player={p} currentColor={currentColor} gameOver={gameOver} tokens={tokens} />
        ))}
      </div>

      {/* ── Benachrichtigungen ── */}
      <div className="ludo-notifs">
        <AnimatePresence>
          {notifications.map((n) => (
            <NotificationToast key={n.id} notification={n} onRemove={removeNotification} />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Würfel unten (Daumen) ── */}
      {!gameOver && (
        <div className="ludo-dice">
          <DiceRollButton />
        </div>
      )}
    </div>
  );
}
