"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BottomSheet from "@/components/play/BottomSheet";

interface PlayProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string | null;
  is_available: boolean;
}

interface Highlight {
  id: number;
  name: string;
  game: string | null;
  text: string | null;
  score: number | null;
  created_at: string;
}

interface PlayRecord {
  game: string;
  best_score: number;
  best_name: string;
  updated_at: string;
}

interface Props {
  slug: string;
  tenantName: string;
  logoUrl: string | null;
  table: string | null;
  token: string | null;
  isShisha: boolean;
  ordersEnabled: boolean;
  products: PlayProduct[];
}

const eur = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

// Tastenbelegung des Kart-Spiels (WASD/Pfeile/Leertaste/E/Enter).
const K = {
  left: "KeyA",
  right: "KeyD",
  gas: "KeyW",
  brake: "KeyS",
  drift: "Space",
  item: "KeyE",
  confirm: "Enter",
} as const;

// Standard-Start des Ludo-Spiels: 1 Mensch (rot) gegen 3 Bots.
const LUDO_SRC = "/ludo/index.html?players=4&mode=ai&ai=blue,green,yellow";
// Standard-Start der Quizshow: 1 Mensch gegen 3 Bots (ohne net).
const QUIZ_SRC = "/quiz/index.html?auto=1";
// 3D-Brettspiele (Bingo, Würfel-Poker, Lügen-Dice) teilen eine App.
const BOARD_GAMES = [
  { id: "bingo", title: "Bingo", emoji: "🔢", grad: "from-rose-500/90 to-orange-500/90", desc: "3D-Zahlenkäfig · Linie gewinnt" },
  { id: "poker", title: "Würfel-Poker", emoji: "🎲", grad: "from-emerald-500/90 to-teal-600/90", desc: "5 Würfel · 13 Kategorien" },
  { id: "liar", title: "Lügen-Dice", emoji: "🤥", grad: "from-amber-500/90 to-red-600/90", desc: "Bieten & Zweifeln" },
] as const;
type BoardGameId = (typeof BOARD_GAMES)[number]["id"];

// Anzeigenamen aller Spiele (für Highscore/Rekorde).
const GAME_LABELS: Record<string, string> = {
  kart: "Kart-Rennen",
  ludo: "Mensch ärgere dich nicht",
  quiz: "Quiz Show",
  bingo: "Bingo",
  poker: "Würfel-Poker",
  liar: "Lügen-Dice",
};
const gameLabel = (id: string): string => GAME_LABELS[id] ?? id;

export default function PlayClient({
  slug,
  table,
  token,
  isShisha,
  ordersEnabled,
  products,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [gameState, setGameState] = useState<string>("title");
  const [sheetTab, setSheetTab] = useState<"order" | "service">("order");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [activeCatSel, setActiveCatSel] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [orderMsg, setOrderMsg] = useState<string | null>(null);

  const [serviceMsg, setServiceMsg] = useState<string | null>(null);
  const [serviceBusy, setServiceBusy] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [now, setNow] = useState(0);

  const [hlOpen, setHlOpen] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [records, setRecords] = useState<PlayRecord[]>([]);

  const [controls, setControls] = useState(true);
  const [name, setName] = useState("");
  const [nameReady, setNameReady] = useState(true);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [game, setGame] = useState<"kart" | "ludo" | "quiz" | "board">("kart");
  const [iframeSrc, setIframeSrc] = useState("/kart/index.html");
  const [ludoSrc, setLudoSrc] = useState(LUDO_SRC);
  const [ludoSheet, setLudoSheet] = useState(false);
  const [quizSrc, setQuizSrc] = useState(QUIZ_SRC);
  const [quizSheet, setQuizSheet] = useState(false);
  const [boardSrc, setBoardSrc] = useState("/board/index.html?game=poker");
  const [boardGame, setBoardGame] = useState<BoardGameId>("poker");
  const [boardSheet, setBoardSheet] = useState(false);
  const [roomSheet, setRoomSheet] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [roomErr, setRoomErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    game: string;
    score: number;
    record: boolean;
    best: number;
    previousBest: number | null;
  } | null>(null);
  // Aktuell gehaltene Touch-Tasten (mehrere gleichzeitig, Multi-Touch).
  const heldKeys = useRef<Set<string>>(new Set());

  function netUrl(): string {
    const env = process.env.NEXT_PUBLIC_GAMES_URL;
    if (env) return env;
    const https = typeof window !== "undefined" && window.location.protocol === "https:";
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.endsWith(".local");
    // Lokal/Dev → eigener Port 2567; Produktion → same-origin über den Proxy (/games).
    const suffix = isLocal ? ":2567" : "/games";
    return `${https ? "wss" : "ws"}://${host}${suffix}`;
  }

  function buildSrc(n: string, mode?: "create" | "join", room?: string): string {
    const params = new URLSearchParams({ net: netUrl(), name: n || "Gast", color: "#34d399" });
    if (mode === "create") params.set("mode", "create");
    else if (mode === "join" && room) {
      params.set("mode", "join");
      params.set("room", room.trim());
    }
    return `/kart/index.html?${params.toString()}`;
  }

  function buildLudoSrc(mode: "create" | "join" | "public", room?: string): string {
    const params = new URLSearchParams({ net: netUrl(), name: name || "Gast" });
    if (mode === "create") params.set("mode", "create");
    else if (mode === "join" && room) {
      params.set("mode", "join");
      params.set("room", room.trim());
    }
    return `/ludo/index.html?${params.toString()}`;
  }

  function buildQuizSrc(mode: "create" | "join" | "public", room?: string): string {
    const params = new URLSearchParams({ net: netUrl(), name: name || "Gast" });
    if (mode === "create") params.set("mode", "create");
    else if (mode === "join" && room) {
      params.set("mode", "join");
      params.set("room", room.trim());
    }
    return `/quiz/index.html?${params.toString()}`;
  }

  function startGame(mode: "public" | "create" | "join", room?: string) {
    setGame("kart");
    setRoomErr(null);
    setActiveRoom(null);
    setRoomSheet(false);
    const n = name || "Gast";
    let src = buildSrc(n);
    if (mode === "create") src = buildSrc(n, "create");
    else if (mode === "join" && room) src = buildSrc(n, "join", room);
    setIframeSrc(src);
    setPlaying(true);
  }

  function startLudoLocal() {
    setGame("ludo");
    setRoomErr(null);
    setActiveRoom(null);
    setLudoSrc(LUDO_SRC);
    setLudoSheet(false);
    setPlaying(true);
  }

  function startLudoNet(mode: "create" | "join" | "public", room?: string) {
    setGame("ludo");
    setRoomErr(null);
    setActiveRoom(null);
    setLudoSrc(buildLudoSrc(mode, room));
    setLudoSheet(false);
    setPlaying(true);
  }

  function startQuizLocal() {
    setGame("quiz");
    setRoomErr(null);
    setActiveRoom(null);
    setQuizSrc(QUIZ_SRC);
    setQuizSheet(false);
    setPlaying(true);
  }

  function startQuizNet(mode: "create" | "join" | "public", room?: string) {
    setGame("quiz");
    setRoomErr(null);
    setActiveRoom(null);
    setQuizSrc(buildQuizSrc(mode, room));
    setQuizSheet(false);
    setPlaying(true);
  }

  function buildBoardSrc(gameId: BoardGameId, mode: "bots" | "create" | "join", room?: string): string {
    const params = new URLSearchParams({ game: gameId });
    if (mode === "bots") { params.set("auto", "1"); return `/board/index.html?${params.toString()}`; }
    params.set("net", netUrl());
    params.set("name", name || "Gast");
    if (mode === "create") params.set("mode", "create");
    else if (mode === "join" && room) {
      params.set("mode", "join");
      params.set("room", room.trim());
    }
    return `/board/index.html?${params.toString()}`;
  }

  function startBoard(gameId: BoardGameId, mode: "bots" | "create" | "join", room?: string) {
    setGame("board");
    setRoomErr(null);
    setActiveRoom(null);
    setBoardSrc(buildBoardSrc(gameId, mode, room));
    setBoardSheet(false);
    setPlaying(true);
  }

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const stored =
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem("dg-player-name") || localStorage.getItem("dg-kart-name"))) ||
      "";
    const clean = stored.trim().slice(0, 20);
    const src = buildSrc(clean);
    const t = window.setTimeout(() => {
      setName(clean);
      setNameReady(clean.length > 0);
      setIframeSrc(src);
      if (clean.length > 0) localStorage.setItem("dg-player-name", clean);
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-Link aus dem Chat (?g=<spiel>) → passendes Start-Menü öffnen.
  useEffect(() => {
    if (playing) return undefined;
    const g = new URLSearchParams(window.location.search).get("g");
    if (!g) return undefined;
    const t = window.setTimeout(() => {
      if (g === "kart") setRoomSheet(true);
      else if (g === "ludo") setLudoSheet(true);
      else if (g === "quiz") setQuizSheet(true);
      else if (g === "bingo" || g === "poker" || g === "liar") {
        setBoardGame(g);
        setBoardSheet(true);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("g");
      window.history.replaceState({}, "", url.toString());
    }, 0);
    return () => window.clearTimeout(t);
  }, [playing]);

  // Spielzustand aus dem iframe lesen (Menü vs. Rennen) für saubere Overlays.
  useEffect(() => {
    if (!playing || game !== "kart") return;
    const id = window.setInterval(() => {
      const frame = document.getElementById("kart-frame") as HTMLIFrameElement | null;
      const g = (frame?.contentWindow as unknown as { __turboKartRush?: { currentState?: string } } | null)?.__turboKartRush;
      if (g?.currentState) setGameState(g.currentState);
    }, 300);
    return () => window.clearInterval(id);
  }, [playing, game]);

  // Multi-Touch-Robustheit beim Kart: nur FAHR-Tasten (keine Edge-Aktionen
  // wie Item/OK) regelmäßig neu senden, solange die Steuerung sichtbar ist.
  useEffect(() => {
    const active =
      playing && game === "kart" && controls && (gameState === "racing" || gameState === "countdown");
    if (!active) {
      heldKeys.current.forEach((c) => sendKey(c, "keyup"));
      heldKeys.current.clear();
      return undefined;
    }
    const raceKeys = [K.left, K.right, K.gas, K.brake, K.drift];
    const iv = window.setInterval(() => {
      raceKeys.forEach((c) => {
        if (heldKeys.current.has(c)) sendKey(c, "keydown");
      });
    }, 180);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, game, controls, gameState]);

  // Beim Verlassen des Spiels/Frames alle gehaltenen Tasten lösen.
  useEffect(() => {
    return () => {
      heldKeys.current.forEach((c) => sendKey(c, "keyup"));
      heldKeys.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, game]);

  function openNameEditor() {
    setNameInput(name || "");
    setNameError(null);
    setNameReady(false);
  }

  function submitName() {
    const n = nameInput.trim().replace(/\s+/g, " ").slice(0, 20);
    if (n.length < 1) {
      setNameError("Bitte gib zuerst deinen Namen ein.");
      return;
    }
    localStorage.setItem("dg-player-name", n);
    setName(n);
    setNameReady(true);
    setIframeSrc(buildSrc(n));
  }

  const loadHighlights = useCallback(async () => {
    try {
      const r = await fetch(`/api/play/highlights?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const j = await r.json();
      if (j?.success) {
        setHighlights(j.highlights as Highlight[]);
        setRecords((j.records as PlayRecord[]) ?? []);
      }
    } catch {
      /* ignore */
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHighlights();
  }, [loadHighlights]);

  // Raum-Code + Spielergebnis aus dem Spiel (iframe) empfangen.
  useEffect(() => {
    async function submitScore(gameId: string, score: number) {
      if (!gameId || !Number.isFinite(score)) return;
      try {
        const r = await fetch(`/api/play/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, game: gameId, name: name || "Gast", score }),
        });
        const j = (await r.json().catch(() => ({}))) as {
          success?: boolean;
          record?: boolean;
          best?: number;
          previousBest?: number | null;
        };
        if (j?.success) {
          setScoreResult({
            game: gameId,
            score,
            record: !!j.record,
            best: Number(j.best ?? score),
            previousBest: j.previousBest ?? null,
          });
          void loadHighlights();
          window.setTimeout(() => setScoreResult(null), 6500);
        }
      } catch {
        /* ignore */
      }
    }
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { type?: string; roomId?: string; message?: string; game?: string; score?: number } | null;
      if (!d || typeof d !== "object") return;
      if (d.type === "kart:room" && d.roomId) setActiveRoom(d.roomId);
      else if (d.type === "kart:room-error") {
        setActiveRoom(null);
        setRoomErr(d.message ?? "Raum nicht gefunden.");
      } else if (d.type === "game:score" && d.game && typeof d.score === "number") {
        void submitScore(d.game, d.score);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, name]);

  // ── Touch → Tastatur-Events ins Spiel (same-origin iframe) ──
  function sendKey(code: string, type: "keydown" | "keyup") {
    const frame = document.getElementById("kart-frame") as HTMLIFrameElement | null;
    const w = frame?.contentWindow;
    if (!w) return;
    const key = code === "Space" ? " " : code.startsWith("Key") ? code.slice(3).toLowerCase() : code;
    w.dispatchEvent(new KeyboardEvent(type, { code, key, bubbles: true }));
  }

  function hold(code: string) {
    return {
      onPointerDown: (e: React.PointerEvent) => {
        // Multi-Touch: Gesten verhindern + Pointer am Button "fangen",
        // damit der Finger beim Verrutschen nicht die Taste verliert.
        e.preventDefault();
        e.stopPropagation();
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        heldKeys.current.add(code);
        sendKey(code, "keydown");
      },
      onPointerUp: (e: React.PointerEvent) => {
        e.preventDefault();
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        heldKeys.current.delete(code);
        sendKey(code, "keyup");
      },
      // Nur echte Abbrüche (z. B. Systemgeste) lösen die Taste.
      onPointerCancel: (e: React.PointerEvent) => {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        heldKeys.current.delete(code);
        sendKey(code, "keyup");
      },
    };
  }

  async function callService(type: string) {
    if (!table) {
      setServiceMsg("Service ist nur an einem Tisch möglich.");
      return;
    }
    if ((cooldowns[type] ?? 0) > Date.now()) {
      setServiceMsg("Bitte kurz warten…");
      return;
    }
    setServiceBusy(type);
    setServiceMsg(null);
    try {
      const r = await fetch(`/api/${slug}/call-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, table, token }),
      });
      const j = await r.json();
      if (j?.success) {
        setCooldowns((c) => ({ ...c, [type]: Date.now() + 60000 }));
        setServiceMsg(type === "kohle" ? "Kohle-Nachbestellung gesendet ✓" : "Kellner gerufen ✓");
      } else setServiceMsg(j?.error ?? "Service nicht möglich.");
    } catch {
      setServiceMsg("Netzwerkfehler.");
    } finally {
      setServiceBusy(null);
    }
  }

  async function submitOrder() {
    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ product_id: Number(id), quantity: qty, note: null as string | null }));
    if (items.length === 0) return;
    if (!ordersEnabled || !table) {
      setOrderStatus("error");
      setOrderMsg("Bestellen ist nur an einem Tisch möglich.");
      return;
    }
    setOrderStatus("sending");
    setOrderMsg(null);
    try {
      const idem =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const r = await fetch(`/${slug}/bestellen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, items, idempotency_key: idem }),
      });
      const j = await r.json();
      if (j?.success) {
        setOrderStatus("sent");
        setOrderMsg(`Bestellung #${j.order_id} gesendet · kommt an den Tisch`);
        setCart({});
        window.setTimeout(() => setOrderStatus("idle"), 4000);
      } else {
        setOrderStatus("error");
        setOrderMsg(j?.error ?? "Bestellung fehlgeschlagen.");
      }
    } catch {
      setOrderStatus("error");
      setOrderMsg("Netzwerkfehler.");
    }
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((x) => x.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);
  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === Number(id)), qty }))
    .filter((x) => x.product && x.qty > 0);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);
  const activeCat = activeCatSel || categories[0] || "";
  const visibleProducts = products.filter((p) => p.category === activeCat && p.is_available);

  // ── Namens-Onboarding (Pflicht vor dem ersten Spiel) ──
  const nameModal = !nameReady ? (
    <div className="fixed inset-0 z-[400] flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 p-5 text-white shadow-2xl ring-1 ring-white/10">
        <div className="mb-1 text-4xl">👋</div>
        <h2 className="text-xl font-black">Wie heißt du?</h2>
        <p className="mb-4 mt-1 text-sm text-zinc-400">
          Dein Name erscheint im Spiel und im Chat. So wissen Freunde, wer mitspielt.
        </p>
        <input
          autoFocus
          value={nameInput}
          onChange={(e) => { setNameInput(e.target.value.slice(0, 20)); setNameError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") submitName(); }}
          placeholder="z. B. Lena"
          className="h-14 w-full rounded-2xl bg-white/5 px-4 text-lg font-black text-white outline-none ring-1 ring-white/15 placeholder:text-zinc-500"
        />
        {nameError ? <p className="mt-2 text-xs font-bold text-red-400">{nameError}</p> : null}
        <button onClick={submitName} className="mt-4 w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-wide active:scale-[0.98]">
          Los geht&apos;s
        </button>
        <p className="mt-3 text-center text-[11px] text-zinc-500">Nur für dieses Gerät gespeichert.</p>
      </div>
    </div>
  ) : null;

  // ── Highscore-Banner (Rekord geknackt oder nicht) ──
  const scoreBanner = scoreResult ? (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[350] flex justify-center px-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 4.25rem)" }}
    >
      <div
        className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl ring-1 ${
          scoreResult.record ? "bg-amber-400/95 text-black ring-amber-200" : "bg-zinc-900/95 text-white ring-white/15"
        }`}
      >
        <span className="text-2xl">{scoreResult.record ? "🏆" : "🎯"}</span>
        <div className="min-w-0">
          <div className="text-sm font-black">
            {scoreResult.record ? "Neuer Rekord geknackt!" : "Kein neuer Rekord"}
          </div>
          <div className="text-xs font-semibold opacity-80">
            {gameLabel(scoreResult.game)} · {scoreResult.score} Punkte
            {scoreResult.record
              ? scoreResult.previousBest != null
                ? ` (vorher ${scoreResult.previousBest})`
                : " (erster Eintrag)"
              : ` · Rekord: ${scoreResult.best}`}
          </div>
        </div>
        <button
          onClick={() => setScoreResult(null)}
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/10 text-current"
          aria-label="Schließen"
        >
          ✕
        </button>
      </div>
    </div>
  ) : null;

  // ── Play-World-Hub (Spiele-Übersicht) ──
  if (!playing) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-white">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(16,185,129,0.18),transparent),radial-gradient(50%_40%_at_100%_100%,rgba(59,130,246,0.14),transparent)]" />
        <header className="mx-auto flex w-full max-w-md items-center justify-between gap-2 px-4 py-4">
          <Link href={`/${slug}`} className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-white active:scale-95">
            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            Speisekarte
          </Link>
          <span className="text-sm font-black">digi-gastro <span className="text-emerald-400">Play World</span> <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-300">Beta</span></span>
          <button onClick={openNameEditor} className="flex h-9 items-center gap-1 rounded-full bg-white/10 px-3 text-xs font-bold text-white active:scale-95">
            <span className="material-symbols-outlined text-base">person</span>
            <span className="hidden max-w-20 truncate sm:inline">{name || "Gast"}</span>
          </button>
        </header>

        <main className="mx-auto w-full max-w-md px-5 pb-10">
          <h1 className="mb-1 text-3xl font-black tracking-tight">Play World <span className="align-middle rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-amber-300">Beta</span></h1>
          <p className="mb-5 text-sm text-zinc-400">Wähle ein Spiel.</p>

          <button
            onClick={() => { setRoomErr(null); setRoomSheet(true); }}
            className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/90 to-emerald-600/90 p-5 text-left shadow-2xl active:scale-[0.99]"
          >
            <div className="text-5xl">🏎️</div>
            <div className="mt-2 text-2xl font-black text-black">Kart-Rennen</div>
            <div className="text-sm font-semibold text-black/70">3D-Rennen · gegen Freunde oder Bots</div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">Mehrspieler</span>
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">Live</span>
            </div>
          </button>

          <button
            onClick={() => { setLudoSheet(true); setRoomErr(null); }}
            className="relative mt-3 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/90 to-purple-700/90 p-5 text-left shadow-2xl active:scale-[0.99]"
          >
            <div className="text-5xl">🎲</div>
            <div className="mt-2 text-2xl font-black text-black">Mensch ärgere dich nicht</div>
            <div className="text-sm font-semibold text-black/70">3D-Brettspiel · gegen Bots oder Freunde</div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">3D</span>
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">Bots</span>
            </div>
          </button>

          <button
            onClick={() => { setQuizSheet(true); setRoomErr(null); }}
            className="relative mt-3 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-500/90 to-sky-600/90 p-5 text-left shadow-2xl active:scale-[0.99]"
          >
            <div className="text-5xl">🎬</div>
            <div className="mt-2 text-2xl font-black text-black">Quiz Show</div>
            <div className="text-sm font-semibold text-black/70">3D-Quizshow · gegen Bots oder Freunde</div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">3D</span>
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">Mehrspieler</span>
            </div>
          </button>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {BOARD_GAMES.map((g) => (
              <button
                key={g.id}
                onClick={() => { setBoardGame(g.id); setBoardSheet(true); setRoomErr(null); }}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${g.grad} p-4 text-left shadow-xl active:scale-[0.98]`}
              >
                <div className="text-3xl">{g.emoji}</div>
                <div className="mt-1 text-lg font-black text-black">{g.title}</div>
                <div className="text-[11px] font-semibold text-black/70">{g.desc}</div>
                <div className="mt-2 flex gap-1">
                  <span className="rounded-full bg-black/25 px-2 py-0.5 text-[9px] font-black uppercase text-white">3D</span>
                  <span className="rounded-full bg-black/25 px-2 py-0.5 text-[9px] font-black uppercase text-white">Mehrspieler</span>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500">Bestellen &amp; Service sind direkt im Spiel verfügbar.</p>
        </main>

        {/* Modal: Kart-Rennen starten / Raum-Code */}
        {roomSheet ? (
          <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-sm rounded-3xl bg-zinc-900 p-5 text-white shadow-2xl ring-1 ring-white/10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">🏎️ Kart-Rennen</h2>
                <button onClick={() => setRoomSheet(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-label="Schließen">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <button onClick={() => startGame("public")} className="mb-2 w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-wide active:scale-[0.98]">
                Allein / öffentlich starten
              </button>
              <button onClick={() => startGame("create")} className="mb-4 w-full rounded-2xl bg-white/10 py-4 text-sm font-black uppercase tracking-wide active:scale-[0.98]">
                Neuen Raum erstellen (Tisch-Duell)
              </button>
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-400">Mit Code beitreten</p>
              <div className="flex gap-2">
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="RAUM-CODE"
                  className="h-12 min-w-0 flex-1 rounded-xl bg-white/5 px-4 font-black tracking-widest text-white outline-none ring-1 ring-white/10 placeholder:text-zinc-500"
                />
                <button onClick={() => { if (roomInput.trim()) startGame("join", roomInput.trim()); }} disabled={!roomInput.trim()} className="rounded-xl bg-amber-500 px-5 font-black text-black disabled:opacity-40">
                  Los
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-zinc-500">Ein Tisch erstellt den Raum und teilt den Code – der andere Tisch tritt bei.</p>
            </div>
          </div>
        ) : null}

        {/* Modal: Ludo starten / Raum-Code */}
        {ludoSheet ? (
          <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-sm rounded-3xl bg-zinc-900 p-5 text-white shadow-2xl ring-1 ring-white/10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">🎲 Mensch ärgere dich nicht</h2>
                <button onClick={() => setLudoSheet(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-label="Schließen">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <button onClick={startLudoLocal} className="mb-2 w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-wide active:scale-[0.98]">
                Allein gegen Bots starten
              </button>
              <button onClick={() => startLudoNet("create")} className="mb-4 w-full rounded-2xl bg-white/10 py-4 text-sm font-black uppercase tracking-wide active:scale-[0.98]">
                Neuen Raum erstellen (Tisch-Duell)
              </button>
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-400">Mit Code beitreten</p>
              <div className="flex gap-2">
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="RAUM-CODE"
                  className="h-12 min-w-0 flex-1 rounded-xl bg-white/5 px-4 font-black tracking-widest text-white outline-none ring-1 ring-white/10 placeholder:text-zinc-500"
                />
                <button onClick={() => { if (roomInput.trim()) startLudoNet("join", roomInput.trim()); }} disabled={!roomInput.trim()} className="rounded-xl bg-amber-500 px-5 font-black text-black disabled:opacity-40">
                  Los
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-zinc-500">Ein Tisch erstellt den Raum und teilt den Code – der andere Tisch tritt bei.</p>
            </div>
        </div>
        ) : null}

        {/* Modal: Quiz Show starten / Raum-Code */}
        {quizSheet ? (
          <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-sm rounded-3xl bg-zinc-900 p-5 text-white shadow-2xl ring-1 ring-white/10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">🎬 Quiz Show</h2>
                <button onClick={() => setQuizSheet(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-label="Schließen">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <button onClick={startQuizLocal} className="mb-2 w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-wide active:scale-[0.98]">
                Allein gegen Bots starten
              </button>
              <button onClick={() => startQuizNet("create")} className="mb-4 w-full rounded-2xl bg-white/10 py-4 text-sm font-black uppercase tracking-wide active:scale-[0.98]">
                Neuen Raum erstellen (Tisch-Duell)
              </button>
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-400">Mit Code beitreten</p>
              <div className="flex gap-2">
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="RAUM-CODE"
                  className="h-12 min-w-0 flex-1 rounded-xl bg-white/5 px-4 font-black tracking-widest text-white outline-none ring-1 ring-white/10 placeholder:text-zinc-500"
                />
                <button onClick={() => { if (roomInput.trim()) startQuizNet("join", roomInput.trim()); }} disabled={!roomInput.trim()} className="rounded-xl bg-amber-500 px-5 font-black text-black disabled:opacity-40">
                  Los
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-zinc-500">Ein Tisch erstellt den Raum und teilt den Code – der andere Tisch tritt bei.</p>
            </div>
          </div>
        ) : null}

        {/* Modal: 3D-Brettspiel starten / Raum-Code */}
        {boardSheet ? (
          <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-sm rounded-3xl bg-zinc-900 p-5 text-white shadow-2xl ring-1 ring-white/10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">
                  {BOARD_GAMES.find((g) => g.id === boardGame)?.emoji} {BOARD_GAMES.find((g) => g.id === boardGame)?.title}
                </h2>
                <button onClick={() => setBoardSheet(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-label="Schließen">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <button onClick={() => startBoard(boardGame, "bots")} className="mb-2 w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-wide active:scale-[0.98]">
                Allein gegen Bots starten
              </button>
              <button onClick={() => startBoard(boardGame, "create")} className="mb-4 w-full rounded-2xl bg-white/10 py-4 text-sm font-black uppercase tracking-wide active:scale-[0.98]">
                Neuen Raum erstellen (Tisch-Duell)
              </button>
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-400">Mit Code beitreten</p>
              <div className="flex gap-2">
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="RAUM-CODE"
                  className="h-12 min-w-0 flex-1 rounded-xl bg-white/5 px-4 font-black tracking-widest text-white outline-none ring-1 ring-white/10 placeholder:text-zinc-500"
                />
                <button onClick={() => { if (roomInput.trim()) startBoard(boardGame, "join", roomInput.trim()); }} disabled={!roomInput.trim()} className="rounded-xl bg-amber-500 px-5 font-black text-black disabled:opacity-40">
                  Los
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-zinc-500">Ein Tisch erstellt den Raum und teilt den Code – der andere Tisch tritt bei.</p>
            </div>
          </div>
        ) : null}

        {nameModal}
        {scoreBanner}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {nameModal}
      {scoreBanner}
      {/* Spiel (3D) – Vollbild; Portrait-Layout übernimmt die Spiel-CSS */}
      <iframe
        key={game === "kart" ? iframeSrc : game === "ludo" ? ludoSrc : game === "quiz" ? quizSrc : boardSrc}
        id="kart-frame"
        src={game === "kart" ? iframeSrc : game === "ludo" ? ludoSrc : game === "quiz" ? quizSrc : boardSrc}
        title={game === "kart" ? "digi-gastro Kart" : game === "ludo" ? "digi-gastro Ludo" : game === "quiz" ? "digi-gastro Quiz" : "digi-gastro Play"}
        className="absolute inset-0 h-full w-full border-0"
        allow="fullscreen; gamepad; autoplay"
        onLoad={(e) => e.currentTarget.contentWindow?.focus()}
      />

      {/* Topbar */}
      <div
        className="absolute inset-x-0 top-0 z-[200] flex flex-nowrap items-center justify-between gap-2 px-3"
        style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
      >
        <button
          onClick={() => { setPlaying(false); setActiveRoom(null); setRoomErr(null); }}
          className="flex items-center gap-1 rounded-full bg-black/60 px-3 py-2.5 text-sm font-black text-white shadow-lg backdrop-blur-md active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Spiele
        </button>
        <div className="pointer-events-none hidden items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md sm:flex">
          <span className="text-emerald-400">digi-gastro</span>
          <span>{game === "ludo" ? "Ludo" : game === "quiz" ? "Quiz" : game === "board" ? (BOARD_GAMES.find((g) => g.id === boardGame)?.title ?? "Spiel") : "Kart"}</span>
        </div>
        {game === "kart" ? (
        <div className="flex items-center gap-2">
          {activeRoom ? (
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(activeRoom);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* ignore */
                }
              }}
              className="flex h-11 items-center gap-1 rounded-full bg-amber-500 px-2.5 text-xs font-black text-black shadow-lg active:scale-95"
              aria-label="Raum-Code kopieren"
            >
              <span className="material-symbols-outlined text-base">{copied ? "check" : "key"}</span>
              <span className="max-w-16 truncate tracking-wide">{copied ? "Kopiert!" : activeRoom}</span>
            </button>
          ) : null}
          <button
            onClick={openNameEditor}
            className="flex h-11 items-center gap-1 rounded-full bg-black/60 px-3 text-xs font-bold text-white shadow-lg backdrop-blur-md active:scale-95"
            aria-label="Name ändern"
          >
            <span className="material-symbols-outlined text-base">person</span>
            <span className="hidden max-w-20 truncate sm:inline">{name || "Gast"}</span>
          </button>
          <button
            onClick={() => setHlOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-amber-400 shadow-lg backdrop-blur-md active:scale-95"
            aria-label="Highlights"
          >
            <span className="material-symbols-outlined">emoji_events</span>
          </button>
          <button
            onClick={() => setControls((c) => !c)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-md active:scale-95"
            aria-label="Touch-Steuerung"
          >
            <span className="material-symbols-outlined">sports_esports</span>
          </button>
        </div>
        ) : null}
        {game !== "kart" && activeRoom ? (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(activeRoom);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* ignore */
                }
              }}
              className="flex h-11 items-center gap-1 rounded-full bg-amber-500 px-3 text-xs font-black text-black shadow-lg active:scale-95"
              aria-label="Raum-Code kopieren"
            >
              <span className="material-symbols-outlined text-base">{copied ? "check" : "key"}</span>
              <span className="max-w-24 truncate tracking-wide">{copied ? "Kopiert!" : activeRoom}</span>
            </button>
          </div>
        ) : null}
      </div>

      {roomErr ? (
        <div className="absolute left-1/2 top-20 z-[210] -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white shadow-lg">
          {roomErr}
        </div>
      ) : null}

      {/* In-Game: Bestellen + Service (links; bei den Brettspielen ausgeblendet) */}
      {game !== "board" ? (
      <div
        className="absolute left-3 z-40 flex flex-col items-start gap-2"
        style={{ bottom: game === "quiz" ? "calc(12.5rem + env(safe-area-inset-bottom))" : "calc(6.5rem + env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={() => { setSheetTab("service"); setSheetOpen(true); }}
          className="flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-3 text-sm font-black text-white shadow-xl ring-1 ring-white/15 backdrop-blur active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">notifications_active</span>
          Service
        </button>
        {products.length > 0 ? (
          <button
            onClick={() => { setSheetTab("order"); setSheetOpen(true); }}
            className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-4 font-black text-white shadow-2xl active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">local_bar</span>
            Bestellen
            {cartCount > 0 ? (
              <span className="ml-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-700">{cartCount}</span>
            ) : null}
          </button>
        ) : null}
      </div>
      ) : null}

      {/* Touch-Steuerung – nur während des Rennens */}
      {game === "kart" && controls && (gameState === "racing" || gameState === "countdown") ? (
        <div className="play-controls absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-2 px-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          {/* Lenken (linker Daumen) */}
          <div className="flex gap-2">
            <button {...hold(K.left)} className="flex h-[4.5rem] w-[4.5rem] select-none items-center justify-center rounded-full bg-white/15 text-3xl font-black text-white backdrop-blur active:bg-white/30" aria-label="Links">◀</button>
            <button {...hold(K.right)} className="flex h-[4.5rem] w-[4.5rem] select-none items-center justify-center rounded-full bg-white/15 text-3xl font-black text-white backdrop-blur active:bg-white/30" aria-label="Rechts">▶</button>
          </div>

          {/* Aktionen (rechter Daumen): oben Drift/Item, unten Bremse/Gas */}
          <div className="grid grid-cols-2 gap-2">
            <button {...hold(K.drift)} className="flex h-16 w-16 select-none items-center justify-center rounded-full bg-sky-500/80 text-[11px] font-black uppercase text-white backdrop-blur active:bg-sky-400" aria-label="Drift">Drift</button>
            <button {...hold(K.item)} className="flex h-16 w-16 select-none items-center justify-center rounded-full bg-amber-500/90 text-xl backdrop-blur active:bg-amber-400" aria-label="Item">✨</button>
            <button {...hold(K.brake)} className="flex h-16 w-16 select-none items-center justify-center rounded-full bg-red-500/80 text-[11px] font-black uppercase text-white backdrop-blur active:bg-red-400" aria-label="Bremse">Brem</button>
            <button {...hold(K.gas)} className="flex h-16 w-16 select-none items-center justify-center rounded-full bg-emerald-500/90 text-2xl backdrop-blur active:bg-emerald-400" aria-label="Gas">⛽</button>
          </div>
        </div>
      ) : null}

      {/* Enter/OK für Menüs */}
      {game === "kart" && controls && gameState !== "racing" && gameState !== "countdown" ? (
        <button
          {...hold(K.confirm)}
          className="play-controls absolute bottom-6 left-1/2 z-30 -translate-x-1/2 select-none rounded-full bg-white/15 px-6 py-3 text-xs font-black uppercase tracking-wide text-white backdrop-blur active:bg-white/30"
        >
          OK / Start
        </button>
      ) : null}

      {/* Sheet: Bestellen + Service */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        snapPoints={[0.16, 0.55, 0.92]}
        initialSnap={1}
        header={
          <div className="border-b border-zinc-100 px-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={() => setSheetTab("order")} className={`rounded-full px-4 py-2 text-sm font-black ${sheetTab === "order" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600"}`}>Bestellen</button>
                <button onClick={() => setSheetTab("service")} className={`rounded-full px-4 py-2 text-sm font-black ${sheetTab === "service" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600"}`}>Service</button>
              </div>
              <button onClick={() => setSheetOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500" aria-label="Schließen">
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {table ? `Tisch ${table}` : "Kein Tisch erkannt"} · das Spiel läuft weiter
            </p>
          </div>
        }
      >
        {sheetTab === "order" ? (
          <>
            {!ordersEnabled ? (
              <div className="mx-4 mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">Bestellen ist nur an einem Tisch möglich. Scanne den QR-Code an deinem Tisch.</div>
            ) : null}
            <div className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-zinc-100 bg-white/95 px-4 py-3 backdrop-blur">
              {categories.map((c) => (
                <button key={c} onClick={() => setActiveCatSel(c)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${activeCat === c ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600"}`}>{c}</button>
              ))}
            </div>
            <div className="px-4 py-2">
              {visibleProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-400">Keine Artikel.</p>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {visibleProducts.map((p) => {
                    const qty = cart[p.id] ?? 0;
                    return (
                      <div key={p.id} className="flex items-center gap-3 py-3">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="h-12 w-12 rounded-xl bg-zinc-100 object-contain p-1" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-300"><span className="material-symbols-outlined">restaurant</span></div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-zinc-900">{p.name}</div>
                          <div className="text-sm font-black text-emerald-600">{eur(p.price)}</div>
                        </div>
                        {qty > 0 ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => setCart((c) => { const n = { ...c }; if ((n[p.id] ?? 0) <= 1) delete n[p.id]; else n[p.id] = (n[p.id] ?? 0) - 1; return n; })} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-lg font-black text-zinc-700">−</button>
                            <span className="w-5 text-center font-black text-zinc-900">{qty}</span>
                            <button onClick={() => setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }))} className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-lg font-black text-white">+</button>
                          </div>
                        ) : (
                          <button onClick={() => setCart((c) => ({ ...c, [p.id]: 1 }))} className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-lg font-black text-white active:scale-90" aria-label="Hinzufügen">+</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {cartItems.length > 0 ? (
              <div className="sticky bottom-0 border-t border-zinc-100 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
                <div className="mb-2 flex items-center justify-between text-sm font-black text-zinc-900">
                  <span>{cartCount} Artikel</span>
                  <span className="text-emerald-600">{eur(cartTotal)}</span>
                </div>
                <button onClick={() => void submitOrder()} disabled={orderStatus === "sending" || !ordersEnabled} className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-wide text-white active:scale-[0.98] disabled:opacity-50">
                  {orderStatus === "sending" ? "Sendet…" : "Jetzt bestellen"}
                </button>
              </div>
            ) : null}
            {orderMsg ? (
              <div className={`mx-4 mb-4 mt-2 rounded-xl px-4 py-3 text-sm font-semibold ${orderStatus === "sent" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{orderMsg}</div>
            ) : null}
          </>
        ) : (
          <div className="space-y-3 px-4 py-4">
            {!table ? <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">Service ist nur an einem Tisch möglich.</div> : null}
            <ServiceButton icon="🛎️" title="Kellner rufen" desc="Ein Mitarbeiter kommt an den Tisch" disabled={serviceBusy === "kellner" || (cooldowns["kellner"] ?? 0) > now} cooldown={cooldowns["kellner"]} now={now} onClick={() => void callService("kellner")} />
            {isShisha ? <ServiceButton icon="💨" title="Kohle nachbestellen" desc="Frische Kohle für die Shisha" disabled={serviceBusy === "kohle" || (cooldowns["kohle"] ?? 0) > now} cooldown={cooldowns["kohle"]} now={now} onClick={() => void callService("kohle")} /> : null}
            {serviceMsg ? <p className="rounded-xl bg-zinc-100 px-4 py-3 text-center text-sm font-semibold text-zinc-700">{serviceMsg}</p> : null}
            <p className="pt-2 text-center text-xs text-zinc-400">Anfragen gehen direkt an das Personal dieses Tisches.</p>
          </div>
        )}
      </BottomSheet>

      {/* Highlights / Rekorde */}
      {hlOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white text-zinc-900 shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-black"><span className="material-symbols-outlined text-amber-500">emoji_events</span> Rekorde &amp; Highlights</h2>
              <button onClick={() => setHlOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <p className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">Highlights entstehen automatisch, wenn jemand einen Rekord bricht.</p>
              {records.length > 0 ? (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">Rekorde</p>
                  <div className="space-y-2">
                    {records.map((r) => (
                      <div key={r.game} className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
                        <span className="text-lg">🏆</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-black text-zinc-900">{gameLabel(r.game)}</div>
                          <div className="text-xs text-zinc-500">{r.best_name} · {r.best_score} Punkte</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">Highlights</p>
              <div className="space-y-2">
                {highlights.length === 0 ? (
                  <p className="py-6 text-center text-sm text-zinc-400">Noch keine Highlights.</p>
                ) : (
                  highlights.map((h) => (
                    <div key={h.id} className="flex items-start gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
                      <span className="mt-0.5 text-lg">🏆</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-black">{h.name}</span>
                          {h.score != null ? <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-black">{h.score} P</span> : null}
                        </div>
                        {h.text ? <div className="text-sm text-zinc-600">{h.text}</div> : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ServiceButton({
  icon,
  title,
  desc,
  disabled,
  cooldown,
  now,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  disabled: boolean;
  cooldown?: number;
  now: number;
  onClick: () => void;
}) {
  const left = cooldown && cooldown > now ? Math.ceil((cooldown - now) / 1000) : 0;
  return (
    <button onClick={onClick} disabled={disabled} className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-left active:scale-[0.99] disabled:opacity-50">
      <span className="text-3xl">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-black text-zinc-900">{title}</span>
        <span className="block text-xs text-zinc-500">{desc}</span>
      </span>
      <span className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-black text-white">{left > 0 ? `${left}s` : "Senden"}</span>
    </button>
  );
}
