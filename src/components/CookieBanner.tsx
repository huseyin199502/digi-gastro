"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    // Wird von Seiten mit eigenem Banner (Gästemenü) gesetzt,
    // damit dieser globale Banner dort nicht doppelt erscheint.
    __dgHasLocalCookieBanner?: boolean;
  }
}

// Gleicher Key wie der Menü-Banner: eine Zustimmung gilt überall.
const STORAGE_KEY = "dg-cookie-accepted";

// Globaler Cookie-Hinweis für alle Seiten ohne eigenen Banner
// (Landingpage, Login, Impressum, Datenschutz, Play, Admin, …).
// Es werden nur technisch notwendige Cookies eingesetzt — daher
// reiner Hinweis mit Bestätigung, kein Auswahl-Dialog.
export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const tId = setTimeout(() => {
      if (cancelled) return;
      if (window.__dgHasLocalCookieBanner) return;
      try {
        if (window.localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        return;
      }
      setOpen(true);
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(tId);
    };
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Privater Modus o.ä. — Banner trotzdem schließen.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie-Hinweis"
      className="fixed bottom-4 left-4 z-[90] w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-white/10 bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-md md:bottom-6 md:left-auto md:right-6"
    >
      <h2 className="text-sm font-bold text-white">
        Datenschutz &amp; Cookies
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
        Wir nutzen ausschließlich technisch notwendige Cookies für Login,
        Bestellabwicklung und Sicherheit. Ohne sie kann der Dienst nicht
        angeboten werden.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/datenschutz"
          className="py-1 text-sm font-semibold text-amber-400 underline hover:text-amber-300"
        >
          Datenschutzerklärung
        </Link>
        <button
          onClick={accept}
          className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-amber-300 active:scale-95"
        >
          Einverstanden
        </button>
      </div>
    </div>
  );
}
