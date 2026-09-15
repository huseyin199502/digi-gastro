/**
 * digi-gastro Ludo — Multiplayer (Host-autoritativ)
 * ?net=<ws-url>&name=<name>&mode=create|join|public&room=<code>
 *
 * Der Host (erster Client) simuliert das Spiel inkl. Bots und sendet den Zustand.
 * Gäste senden nur Intents. Der Server relayed (siehe games/src/rooms/LudoRoom.ts).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@colyseus/sdk';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { PLAYER_NAMES } from '../utils/ludoConstants';
import { useGameEngine } from '../hooks/useGameEngine';
import GameScene from '../game/GameScene';
import GameUI from '../game/GameUI';
import PauseModal from '../components/UI/PauseModal';
import VictoryModal from '../components/UI/VictoryModal';

function parentPost(msg) {
  try {
    window.parent?.postMessage(msg, '*');
  } catch {
    /* ignore */
  }
}

function snapshot() {
  const s = useGameStore.getState();
  return {
    players: s.players,
    colors: s.colors,
    tokens: s.tokens,
    currentPlayerIdx: s.currentPlayerIdx,
    currentColor: s.currentColor,
    diceValue: s.diceValue,
    diceRolled: s.diceRolled,
    phase: s.phase,
    capturedThisTurn: s.capturedThisTurn,
    rollCount: s.rollCount,
    winner: s.winner,
    winnerOrder: s.winnerOrder,
    gameOver: s.gameOver,
    moveAnimating: s.moveAnimating,
    selectedTokenId: s.selectedTokenId,
    turnNumber: s.turnNumber,
  };
}

const panel = {
  backgroundColor: 'rgba(30, 20, 70, 0.92)',
  border: '1px solid rgba(255,255,255,0.28)',
  borderRadius: 14,
};

export default function NetLudo() {
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : '',
  );
  const net = params.get('net');
  const myName = params.get('name') || 'Tisch';
  const mode = params.get('mode') || 'public';
  const roomParam = params.get('room') || '';

  const [status, setStatus] = useState('connecting'); // connecting | lobby | playing | error
  const [isHost, setIsHost] = useState(false);
  const [roster, setRoster] = useState({ ids: [], names: [] });
  const [code, setCode] = useState(roomParam);
  const [error, setError] = useState('');
  const [countdownEndsAt, setCountdownEndsAt] = useState(0);
  const [, forceTick] = useState(0);

  const roomRef = useRef(null);
  const isHostRef = useRef(false);
  const rosterRef = useRef({ ids: [], names: [] });
  const myIdRef = useRef('');
  // Original-Store-Aktionen, falls wir als Gast überschreiben (Host-Wechsel).
  const originalsRef = useRef(null);

  // Sounds/Notifications
  useGameEngine();

  // Countdown-Anzeige während der Server-Countdown läuft.
  useEffect(() => {
    if (!countdownEndsAt) return undefined;
    const id = setInterval(() => forceTick((t) => t + 1), 150);
    return () => clearInterval(id);
  }, [countdownEndsAt]);

  const applyConfig = useCallback((config) => {
    const store = useGameStore.getState();
    store.initGame(config.playerCount, config.aiPlayers || []);
    const names = config.names || [];
    const players = useGameStore.getState().players.map((p, i) =>
      i < names.length ? { ...p, name: names[i] } : p,
    );
    useGameStore.setState({ players });
    setStatus('playing');
  }, []);

  const startHost = useCallback(() => {
    const r = rosterRef.current;
    const humans = Math.max(1, Math.min(4, r.ids.length || 1));
    const aiPlayers = PLAYER_NAMES.slice(humans);
    const config = {
      playerCount: 4,
      aiPlayers,
      names: (r.names || []).slice(0, humans),
    };
    // Nur der Server startet: er führt den Countdown aus und schickt „start"
    // an ALLE (auch an den Host). Kein lokaler Start mehr.
    roomRef.current?.send('start', config);
  }, []);

  // Verbindung + Nachrichten
  useEffect(() => {
    if (!net) {
      setStatus('error');
      setError('Kein Server (net) konfiguriert.');
      return undefined;
    }
    const client = new Client(net);
    let room = null;
    const joining =
      mode === 'create'
        ? client.create('ludo', { name: myName, mode: 'create' })
        : roomParam
          ? client.joinById(roomParam, { name: myName, mode: 'join' })
          : client.joinOrCreate('ludo', { name: myName, mode: 'public' });

    joining
      .then((r) => {
        room = r;
        roomRef.current = r;
        myIdRef.current = r.sessionId ?? '';
        setCode(r.roomId);
        parentPost({ type: 'kart:room', roomId: r.roomId });

        r.onMessage('role', (m) => {
          isHostRef.current = !!m.isHost;
          setIsHost(!!m.isHost);
        });
        r.onMessage('roster', (m) => {
          rosterRef.current = { ids: m.ids || [], names: m.names || [] };
          setRoster({ ids: m.ids || [], names: m.names || [] });
          // Host zuverlässig bestimmen (erster Client), unabhängig vom role-Timing.
          const first = rosterRef.current.ids[0];
          const iAmHost = !!first && first === myIdRef.current;
          isHostRef.current = iAmHost;
          setIsHost(iAmHost);
        });
        r.onMessage('start', (m) => applyConfig(m));
        // Server-Countdown sichtbar machen (Host und Gäste gleich).
        r.onStateChange((state) => {
          const phase = state?.phase;
          const endsAt = state?.countdownEndsAt;
          if (phase === 'countdown' && endsAt) setCountdownEndsAt(endsAt);
          if (phase === 'playing') setCountdownEndsAt(0);
        });
        r.onMessage('lobby:closed', (m) => {
          setError(m?.reason || 'Das Spiel läuft bereits.');
          setStatus('error');
        });
        r.onMessage('state', (m) => {
          if (!isHostRef.current) {
            useGameStore.setState(m);
            // Neue Runde → Sieges-Overlay der Gäste schließen.
            if (m && m.gameOver === false) useUIStore.getState().closeVictory?.();
          }
        });
        r.onMessage('restart', () => {
          // Nur der Host reagiert: neue Runde starten + an alle verteilen.
          if (!isHostRef.current) return;
          useUIStore.getState().closeVictory?.();
          useGameStore.getState().resetGame();
        });
        r.onMessage('intent', (m) => {
          if (!isHostRef.current) return;
          const idx = rosterRef.current.ids.indexOf(m.from);
          const color = PLAYER_NAMES[idx];
          const s = useGameStore.getState();
          if (!color || color !== s.currentColor) return;
          if (m.type === 'roll') s.rollDiceAction();
          else if (m.type === 'select' && m.tokenId) s.selectToken(m.tokenId);
        });
        r.send('hello');
        setStatus('lobby');
      })
      .catch((e) => {
        const message = String(e?.message || e);
        setError(message);
        setStatus('error');
        parentPost({ type: 'kart:room-error', message });
      });

    return () => {
      try {
        room?.leave();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spielmodus: Host sendet Zustand, Gäste senden Intents
  useEffect(() => {
    if (status !== 'playing') return undefined;
    const room = roomRef.current;
    if (!room) return undefined;

    if (!isHostRef.current) {
      if (!originalsRef.current) {
        const s = useGameStore.getState();
        originalsRef.current = {
          rollDiceAction: s.rollDiceAction,
          selectToken: s.selectToken,
          processAITurn: s.processAITurn,
          endTurn: s.endTurn,
          resetGame: s.resetGame,
        };
      }
      useGameStore.setState({
        rollDiceAction: async () => {
          room.send('intent', { type: 'roll' });
          return null;
        },
        selectToken: async (tokenId) => {
          room.send('intent', { type: 'select', tokenId });
        },
        processAITurn: async () => {},
        endTurn: () => {},
        // "Nochmal" eines Gastes fragt den Host an (dieser startet neu).
        resetGame: () => {
          room.send('restart');
        },
      });
      return undefined;
    }

    // Host (ggf. nach Host-Wechsel): Original-Aktionen wiederherstellen.
    if (originalsRef.current) {
      useGameStore.setState(originalsRef.current);
      originalsRef.current = null;
    }

    // Host: Zustand bei Änderungen senden (gedrosselt ~8/s, letzte Änderung immer).
    let last = 0;
    let pending = null;
    const flush = () => {
      pending = null;
      last = performance.now();
      try {
        room.send('state', snapshot());
      } catch {
        /* ignore */
      }
    };
    const unsub = useGameStore.subscribe(() => {
      const now = performance.now();
      if (now - last > 120) flush();
      else if (!pending) pending = setTimeout(flush, 120 - (now - last));
    });
    flush();
    return () => {
      unsub();
      if (pending) clearTimeout(pending);
    };
  }, [status, isHost]);

  // Ergebnis an den Wrapper melden (Highscore/Rekord) – einmal pro Spiel.
  useEffect(() => {
    if (status !== 'playing') return undefined;
    let posted = false;
    const unsub = useGameStore.subscribe((s) => {
      if (s.gameOver && !posted) {
        posted = true;
        const idx = rosterRef.current.ids.indexOf(myIdRef.current);
        const myColor = PLAYER_NAMES[idx];
        const score = s.winner === myColor ? 1 : 0;
        try {
          window.parent?.postMessage({ type: 'game:score', game: 'ludo', score }, '*');
        } catch {
          /* ignore */
        }
      }
      if (!s.gameOver) posted = false;
    });
    return unsub;
  }, [status]);

  if (status === 'playing') {
    return (
      <div className="fixed inset-0 bg-black overflow-hidden">
        <div className="absolute inset-0">
          <GameScene />
        </div>
        <GameUI />
        <PauseModal />
        <VictoryModal />
      </div>
    );
  }

  const humans = roster.ids.length;
  const myIndex = roster.ids.indexOf(myIdRef.current);
  const colorName = myIndex >= 0 ? PLAYER_NAMES[myIndex] : '';

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center text-white"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)' }}
    >
      <div style={{ ...panel, padding: '22px 20px', width: '100%', maxWidth: 360 }}>
        <div style={{ fontSize: 34 }}>🎲</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: '6px 0 2px' }}>digi-gastro Ludo</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 14 }}>
          {status === 'connecting' ? 'Verbinde…' : 'Tisch-Duell'}
        </p>

        {code ? (
          <div style={{ ...panel, padding: '10px 12px', marginBottom: 14, background: 'rgba(0,0,0,0.35)' }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
              Raum-Code
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2 }}>{code}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              Freunde: gleichen Code eingeben
            </div>
          </div>
        ) : null}

        {error ? (
          <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>{error}</p>
        ) : null}

        {status === 'lobby' ? (
          <>
            <div style={{ textAlign: 'left', fontSize: 13, marginBottom: 14 }}>
              {roster.ids.map((id, i) => (
                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>
                    <span style={{ color: ['#ef4444', '#3b82f6', '#22c55e', '#eab308'][i] }}>●</span>{' '}
                    {roster.names[i] || `Tisch ${i + 1}`}
                    {id === myIdRef.current ? ' (Du)' : ''}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{['rot', 'blau', 'grün', 'gelb'][i]}</span>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - humans) }).map((_, i) => (
                <div key={`bot-${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'rgba(255,255,255,0.45)' }}>
                  <span>🤖 Bot</span>
                  <span>{['rot', 'blau', 'grün', 'gelb'][humans + i]}</span>
                </div>
              ))}
            </div>

            {countdownEndsAt > 0 ? (
              <div style={{ ...panel, padding: '14px', marginBottom: 12, textAlign: 'center', background: 'rgba(0,0,0,0.4)' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Startet in</div>
                <div style={{ fontSize: 36, fontWeight: 900 }}>
                  {Math.max(0, Math.ceil((countdownEndsAt - Date.now()) / 1000))}
                </div>
              </div>
            ) : null}

            {isHost ? (
              <button
                onClick={startHost}
                disabled={countdownEndsAt > 0}
                style={{ width: '100%', padding: '16px', borderRadius: 14, background: '#eab308', color: '#111', fontWeight: 900, fontSize: 15, cursor: countdownEndsAt > 0 ? 'default' : 'pointer', opacity: countdownEndsAt > 0 ? 0.6 : 1 }}
              >
                🚀 Spiel starten
              </button>
            ) : (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{countdownEndsAt > 0 ? 'Gleich geht\u2019s los…' : 'Warte auf den Host…'}</p>
            )}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>
              {humans < 2 ? 'Allein? Einfach mit Bots starten.' : `${humans} Spieler verbunden.`}
              {colorName ? ` Du spielst ${colorName}.` : ''}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
