"use client";

// ──────────────────────────────────────────────────────────────────
// Onboarding-/Neuigkeiten-Popup für das Tenant-Dashboard.
// Gerätespezifisch: erscheint 1x pro Gerät (Cookie admin_device) —
// gleiche Zugangsdaten auf Handy/Tablet/PC → jedes neue Gerät sieht
// die Neuigkeit einmal. Animierte Karte (framer-motion).
// ──────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Announcement {
  id: number;
  title: string;
  body: string;
  icon: string | null;
  created_at: string;
}

export default function AnnouncementsPopup({ slug }: { slug: string }) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/${slug}/admin/announcements`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { announcements: Announcement[] };
        if (data.announcements.length > 0) {
          setItems(data.announcements);
          setIndex(0);
          setOpen(true);
        }
      } catch {
        // ignore — keine Neuigkeiten, kein Popup
      } finally {
        setLoaded(true);
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [slug]);

  const markSeen = useCallback(async () => {
    try {
      await Promise.all(
        items.map((a) =>
          fetch(`/api/${slug}/admin/announcements`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ id: a.id }),
          })
        )
      );
    } catch {
      // ignorieren — Popup kommt sonst beim nächsten Mal erneut
    }
  }, [items, slug]);

  const close = useCallback(() => {
    setOpen(false);
    void markSeen();
  }, [markSeen]);

  const next = useCallback(() => {
    if (index < items.length - 1) {
      setIndex((i) => i + 1);
    } else {
      close();
    }
  }, [index, items.length, close]);

  if (!loaded || !open || items.length === 0) return null;

  const current = items[index];
  const isLast = index === items.length - 1;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="announcement-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            key={`announcement-card-${current.id}`}
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          >
            {/* Deko-Header */}
            <div className="relative shrink-0 bg-gradient-to-br from-emerald-600/30 via-zinc-900 to-zinc-900 px-6 pb-5 pt-7 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-4xl shadow-inner">
                <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 34 }}>
                  {current.icon || "celebration"}
                </span>
              </div>
              <span className="mb-1 inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Neuigkeit
              </span>
              <h2 className="text-lg font-bold text-white">{current.title}</h2>
            </div>

            {/* Inhalt */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                {current.body}
              </p>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-800 px-6 py-4">
              <div className="flex gap-1.5">
                {items.length > 1 ? (
                  items.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === index ? "w-4 bg-emerald-500" : "w-1.5 bg-zinc-700"
                      }`}
                    />
                  ))
                ) : null}
              </div>
              <button
                onClick={next}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-500 active:scale-95"
              >
                {isLast ? "Los geht's" : "Weiter"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
