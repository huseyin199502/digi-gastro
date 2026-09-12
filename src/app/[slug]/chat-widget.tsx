"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ──────────────────────────────────────────────────────────────────
// Gast-Chat-Widget für die Speisekarte (mobile-first):
// FAB rechts unten (milchig-weißes Glass-Design wie die anderen
// Buttons, mit dauerhafter roter Badge als Chat-Hinweis) →
// Bottom-Sheet. Identität = Tischnamen aus dem QR-Scan (vom Server
// vergeben, kein freier Name — Betrugsschutz). Eigene Nachrichten
// können Gäste binnen 5 Minuten selbst löschen. Aktives Polling
// (4 s offen / 30 s geschlossen für den Unread-Badge).
// ──────────────────────────────────────────────────────────────────

interface ChatMsg {
  id: number;
  nickname: string;
  body: string;
  is_admin: boolean;
  is_deleted: boolean;
  created_at: string;
  own: boolean;
}

const CD = {
  de: {
    title: "Gast-Chat",
    rules: "Freundlich bleiben — das Restaurant moderiert den Chat.",
    privacy: "Datenschutz",
    placeholder: "Nachricht schreiben…",
    send: "Senden",
    deleted: "Nachricht wurde entfernt.",
    banned: "Du kannst aktuell nicht in den Chat schreiben.",
    disabled: "Der Chat ist derzeit deaktiviert.",
    restaurant: "Restaurant",
    as_name: "Du schreibst als",
    wait: "Kurz warten",
    empty: "Noch keine Nachrichten — schreib den ersten Gruß!",
    label: "Chat",
    delete: "Nachricht löschen",
  },
  en: {
    title: "Guest Chat",
    rules: "Be kind — the restaurant moderates this chat.",
    privacy: "Privacy",
    placeholder: "Write a message…",
    send: "Send",
    deleted: "Message was removed.",
    banned: "You are currently not allowed to write in the chat.",
    disabled: "The chat is currently disabled.",
    restaurant: "Restaurant",
    as_name: "You are writing as",
    wait: "One moment",
    empty: "No messages yet — say hello!",
    label: "Chat",
    delete: "Delete message",
  },
  tr: {
    title: "Misafir Sohbet",
    rules: "Nazik olun — sohbeti restoran denetler.",
    privacy: "Gizlilik",
    placeholder: "Mesaj yaz…",
    send: "Gönder",
    deleted: "Mesaj kaldırıldı.",
    banned: "Şu anda sohbete yazma izniniz yok.",
    disabled: "Sohbet şu anda devre dışı.",
    restaurant: "Restoran",
    as_name: "Şu isimle yazıyorsunuz",
    wait: "Biraz bekleyin",
    empty: "Henüz mesaj yok — ilk selamı sen gönder!",
    label: "Sohbet",
    delete: "Mesajı sil",
  },
  ar: {
    title: "دردشة الضيوف",
    rules: "كن لطيفًا — المطعم يشرف على الدردشة.",
    privacy: "الخصوصية",
    placeholder: "اكتب رسالة…",
    send: "إرسال",
    deleted: "تمت إزالة الرسالة.",
    banned: "لا يمكنك الكتابة في الدردشة حاليًا.",
    disabled: "الدردشة معطلة حاليًا.",
    restaurant: "المطعم",
    as_name: "أنت تكتب باسم",
    wait: "انتظر قليلاً",
    empty: "لا توجد رسائل بعد — أرسل أول تحية!",
    label: "دردشة",
    delete: "حذف الرسالة",
  },
} as const;

type ChatLang = keyof typeof CD;

/** Gäste dürfen eigene Nachrichten 5 Minuten lang selbst löschen. */
const EDIT_WINDOW_MS = 5 * 60 * 1000;

/** Spiele, die aus dem Chat heraus gestartet werden können. */
const PLAY_GAMES = [
  { id: "kart", emoji: "🏎️", title: "Kart-Rennen" },
  { id: "ludo", emoji: "🎲", title: "Mensch ärgere dich nicht" },
  { id: "quiz", emoji: "🎬", title: "Quiz Show" },
  { id: "bingo", emoji: "🔢", title: "Bingo" },
  { id: "poker", emoji: "🎲", title: "Würfel-Poker" },
  { id: "liar", emoji: "🤥", title: "Lügen-Dice" },
] as const;

/** Erkennt eine Play-World-Einladung im Nachrichtentext. */
function extractPlayLink(body: string): { text: string; href: string } | null {
  const m = body.match(/(\S*\/play\?g=[A-Za-z0-9_-]+)/);
  if (!m) return null;
  const raw = m[1];
  const href = raw.startsWith("http") ? raw : `${window.location.origin}${raw}`;
  const text = body.replace(raw, "").replace(/\s+/g, " ").trim();
  return { text, href };
}

// Klang-Feedback bei neuen Chat-Nachrichten (gleiche Konvention wie
// menu-client/admin-client: Audio-Objekt auf Modulebene, preload).
const chatNotifyAudio =
  typeof Audio !== "undefined" ? new Audio("/sounds/chat-message.wav") : null;
if (chatNotifyAudio) chatNotifyAudio.preload = "auto";

function playChatNotifySound() {
  if (!chatNotifyAudio) return;
  try {
    chatNotifyAudio.currentTime = 0;
    void chatNotifyAudio.play().catch(() => {
      /* Autoplay-Blockierung ohne User-Interaktion → stumm ignorieren */
    });
  } catch {
    // ignore
  }
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatWidget({
  slug,
  lang,
  guestFabVisible,
  onOpenPrivacy,
}: {
  slug: string;
  lang: ChatLang;
  /** Gast-FAB-Stack (Service/Rechnung/Warenkorb) sichtbar? → Chat-FAB darüber stapeln. */
  guestFabVisible: boolean;
  onOpenPrivacy: () => void;
}) {
  const cd = CD[lang];
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [banned, setBanned] = useState(false);
  const [identity, setIdentity] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [unread, setUnread] = useState(0);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [pickerOpen, setPickerOpen] = useState(false);
  const lastIdRef = useRef(0);
  const primedRef = useRef(false);
  const openRef = useRef(false);
  const unreadRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const mergeMessages = useCallback((incoming: ChatMsg[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      for (const m of incoming) byId.set(m.id, m);
      return [...byId.values()].sort((a, b) => a.id - b.id);
    });
    const maxId = incoming[incoming.length - 1].id;
    // Erster Voll-Load = Basislinie setzen, NICHT als ungelesen zählen.
    if (!primedRef.current) {
      primedRef.current = true;
      lastIdRef.current = maxId;
      return;
    }
    if (maxId > lastIdRef.current) {
      const fresh = incoming.filter((m) => m.id > lastIdRef.current && !m.own);
      lastIdRef.current = maxId;
      if (fresh.length > 0) {
        // Ton bei JEDER neuen Nachricht von anderen (offen & geschlossen)
        playChatNotifySound();
        if (!openRef.current) {
          unreadRef.current += fresh.length;
          setUnread(unreadRef.current);
        }
      }
    }
  }, []);

  const fetchChat = useCallback(
    async (incremental: boolean) => {
      try {
        const isFull = !(incremental && lastIdRef.current > 0);
        const after = isFull ? "" : `?after=${lastIdRef.current}`;
        const url = `/api/${slug}/chat/messages${after}${isFull ? "?identity=1" : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          enabled: boolean;
          banned: boolean;
          identity: string | null;
          messages: ChatMsg[];
        };
        setEnabled(data.enabled);
        if (!data.enabled) {
          setOpen(false);
          setMessages([]);
          return;
        }
        setBanned(data.banned);
        if (data.identity && data.identity !== "Gast") {
          setIdentity(data.identity);
        }
        mergeMessages(data.messages);
      } catch {
        // Netzwerkfehler → nächster Poll
      }
    },
    [slug, mergeMessages]
  );

  // Polling: 4 s offen, 30 s geschlossen (Unread-Badge). Initial-Fetch
  // deferred (setTimeout 0) — gleiche Konvention wie admin-client.tsx.
  useEffect(() => {
    openRef.current = open;
    const iv = window.setInterval(
      () => void fetchChat(true),
      open ? 4000 : 30000
    );
    const to = window.setTimeout(() => void fetchChat(!open), 0);
    return () => {
      window.clearInterval(iv);
      window.clearTimeout(to);
    };
  }, [open, fetchChat]);

  // Cooldown-Countdown nach 429 + Tick für das 5-Min-Löschfenster
  useEffect(() => {
    if (cooldown <= 0 && !open) return;
    const iv = window.setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
      setNowTs(Date.now());
    }, 1000);
    return () => window.clearInterval(iv);
  }, [cooldown, open]);

  // Offenes Sheet: bei neuen Nachrichten nach unten scrollen
  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  /** Eigene, noch löschbare Nachricht (5-Minuten-Fenster). */
  const canSelfDelete = useCallback(
    (m: ChatMsg) =>
      m.own &&
      !m.is_deleted &&
      !m.is_admin &&
      nowTs - new Date(m.created_at).getTime() < EDIT_WINDOW_MS,
    [nowTs]
  );

  const deleteOwn = useCallback(
    async (m: ChatMsg) => {
      try {
        const res = await fetch(`/api/${slug}/chat/messages/${m.id}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          // Sofort lokal markieren (inkrementelle Polls liefern alte IDs
          // nicht erneut zurück)
          setMessages((prev) =>
            prev.map((x) =>
              x.id === m.id ? { ...x, is_deleted: true, body: "" } : x
            )
          );
        }
      } catch {
        // ignore — Poll holt den Zustand später
      }
    },
    [slug]
  );

  const sendText = useCallback(
    async (text: string) => {
      if (!text || sending || cooldown > 0 || banned) return;
      setSending(true);
      try {
        const res = await fetch(`/api/${slug}/chat/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ body: text }),
        });
        if (res.status === 429) {
          const data = (await res.json().catch(() => ({}))) as { retry_after_s?: number };
          setCooldown(data.retry_after_s ?? 3);
          return;
        }
        if (res.status === 403) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (data.error === "banned") setBanned(true);
          return;
        }
        if (res.ok) {
          const msg = (await res.json()) as ChatMsg;
          if (msg.nickname) setIdentity(msg.nickname);
          mergeMessages([msg]);
          setInput("");
        }
      } catch {
        // Verbindungsfehler — Eingabe bleibt erhalten
      } finally {
        setSending(false);
      }
    },
    [sending, cooldown, banned, slug, mergeMessages]
  );

  const send = useCallback(() => void sendText(input.trim()), [sendText, input]);

  const sendInvite = useCallback(
    (g: (typeof PLAY_GAMES)[number]) => {
      setPickerOpen(false);
      const link = `${window.location.origin}/${slug}/play?g=${g.id}`;
      void sendText(`🎮 Spiel-Einladung: ${g.emoji} ${g.title} · ${link}`);
    },
    [slug, sendText]
  );

  /** Nachrichtentext rendern; Play-World-Einladungen werden zum Start-Button. */
  const renderBody = useCallback(
    (body: string) => {
      const inv = extractPlayLink(body);
      if (!inv) return body;
      return (
        <>
          {inv.text ? <span>{inv.text}</span> : null}
          <a
            href={inv.href}
            className="mt-1.5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white no-underline shadow-sm active:scale-95"
          >
            ▶ Spiel starten
          </a>
        </>
      );
    },
    []
  );

  if (!enabled) return null;

  // Gast-FAB-Stack: 3 Items à (48px Button + 4px + ~16px Label) + 2 × 10px
  // Gap ≈ 224px (14rem). Chat-FAB sitzt 0,5rem darüber, sonst auf
  // Grundhöhe — Buttons exakt bündig (gleiche w-14-Wrapper, right-6).
  const fabBottom = guestFabVisible
    ? "calc(1.5rem + 14.5rem + env(safe-area-inset-bottom))"
    : "calc(1.5rem + env(safe-area-inset-bottom))";

  return (
    <>
      {/* FAB — milchig-weißes Glass-Design passend zu Service/Rechnung/Warenkorb */}
      {!open ? (
        <div
          className="fixed right-6 z-40 flex w-14 flex-col items-center gap-1"
          style={{ bottom: fabBottom }}
        >
          <button
            onClick={() => {
              unreadRef.current = 0;
              setUnread(0);
              setOpen(true);
            }}
            aria-label={cd.title}
            title={cd.title}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white hover:scale-110 active:scale-90 ${
              unread > 0 ? "chat-fab-alert" : ""
            }`}
          >
            {/* Pulsierender Ring — zieht Aufmerksamkeit auf neue Nachrichten */}
            {unread > 0 ? (
              <span className="chat-fab-ring absolute inset-0 rounded-full" />
            ) : null}
            <span className="material-symbols-outlined text-xl">chat_bubble</span>
            {/* Rote Badge NUR bei echten ungelesenen Nachrichten (sonst aus) */}
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-md ring-2 ring-white">
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </button>
          <span className="whitespace-nowrap rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-600 shadow-sm backdrop-blur">
            {cd.label}
          </span>
        </div>
      ) : null}

      {/* Bottom-Sheet */}
      {open ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[75dvh] flex-col rounded-t-3xl bg-white/95 shadow-2xl backdrop-blur-2xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-gray-700">forum</span>
              <h2 className="text-base font-bold text-gray-900">{cd.title}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenPrivacy}
                className="rounded-full px-2.5 py-1.5 text-[11px] font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                {cd.privacy}
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Regeln */}
          <div className="px-4 pt-2 text-[11px] text-gray-400">{cd.rules}</div>

          {/* Nachrichten */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-24 items-center justify-center text-center text-sm text-gray-400">
                {cd.empty}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {messages.map((m) =>
                  m.is_deleted ? (
                    <div key={m.id} className="text-center text-[11px] italic text-gray-300">
                      {cd.deleted}
                    </div>
                  ) : m.is_admin ? (
                    /* Restaurant-Nachricht — deutlich hervorgehoben */
                    <div key={m.id} className="mr-auto flex max-w-[85%] flex-col items-start">
                      <span className="mb-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
                        {cd.restaurant}
                      </span>
                      <div className="rounded-2xl rounded-bl-sm border-2 border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-md">
                        {renderBody(m.body)}
                      </div>
                      <span className="mt-0.5 text-[10px] font-bold text-amber-600">
                        {m.nickname} · {fmtTime(m.created_at)}
                      </span>
                    </div>
                  ) : m.own ? (
                    <div key={m.id} className="ml-auto flex max-w-[85%] flex-col items-end">
                      <div className="flex items-center gap-1">
                        {canSelfDelete(m) ? (
                          <button
                            onClick={() => void deleteOwn(m)}
                            aria-label={cd.delete}
                            title={cd.delete}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                              delete
                            </span>
                          </button>
                        ) : null}
                        <div className="rounded-2xl rounded-br-sm bg-gray-900 px-3.5 py-2 text-sm text-white shadow-sm">
                          {renderBody(m.body)}
                        </div>
                      </div>
                      <span className="mt-0.5 text-[10px] text-gray-400">
                        {m.nickname} · {fmtTime(m.created_at)}
                      </span>
                    </div>
                  ) : (
                    <div key={m.id} className="mr-auto flex max-w-[85%] flex-col items-start">
                      <span className="mb-0.5 text-[11px] font-bold text-gray-500">
                        {m.nickname}
                      </span>
                      <div className="rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-sm">
                        {renderBody(m.body)}
                      </div>
                      <span className="mt-0.5 text-[10px] text-gray-300">
                        {fmtTime(m.created_at)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Eingabe */}
          <div className="border-t border-gray-100 px-4 py-3">
            {/* Identität — vom Server vergebener Tischname, nicht editierbar */}
            {identity ? (
              <div className="mb-2 text-[11px] text-gray-400">
                {cd.as_name} <b className="text-gray-600">{identity}</b>
              </div>
            ) : null}

            {banned ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-center text-xs font-semibold text-red-500">
                {cd.banned}
              </div>
            ) : (
              <>
                {pickerOpen ? (
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    {PLAY_GAMES.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => sendInvite(g)}
                        className="flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-[11px] font-bold text-emerald-800 active:scale-95"
                      >
                        <span className="text-base">{g.emoji}</span>
                        <span className="truncate">{g.title}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => setPickerOpen((v) => !v)}
                    aria-label="Spiel einladen"
                    title="Spiel einladen"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md transition-all active:scale-90 ${
                      pickerOpen ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <span className="material-symbols-outlined">sports_esports</span>
                  </button>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, 300))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    rows={1}
                    placeholder={cd.placeholder}
                    className="max-h-24 min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
                  />
                  <button
                    onClick={() => void send()}
                    disabled={sending || !input.trim() || cooldown > 0}
                    aria-label={cd.send}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-md transition-all hover:bg-amber-600 active:scale-90 disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </>
            )}
            {cooldown > 0 ? (
              <div className="mt-1 text-center text-[11px] text-gray-400">
                {cd.wait} ({cooldown}s)
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
