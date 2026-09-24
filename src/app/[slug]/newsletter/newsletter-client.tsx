"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export interface NewsletterCard {
  id: number;
  name: string;
  description: string | null;
  stamps_required: number | null;
  reward_name: string;
  color_hex: string | null;
  icon: string | null;
}

export default function NewsletterClient({
  slug,
  tenantName,
  logo,
  card,
  appleConfigured,
  googleConfigured,
}: {
  slug: string;
  tenantName: string;
  logo: string | null;
  card: NewsletterCard | null;
  appleConfigured: boolean;
  googleConfigured: boolean;
}) {
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  // Pre-fetch Google-Wallet save_url
  useEffect(() => {
    if (!googleConfigured) return;
    let cancelled = false;
    const to = window.setTimeout(() => {
      fetch(`/${slug}/loyalty/pass/google`, { headers: { Accept: "application/json" } })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { save_url?: string } | null) => {
          if (!cancelled && d?.save_url) setGoogleUrl(d.save_url);
        })
        .catch(() => {
          if (!cancelled) setGoogleUrl(null);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(to);
    };
  }, [slug, googleConfigured]);

  const markSaved = () => {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `loyalty_${slug}=saved; expires=${expires}; path=/; SameSite=Lax`;
    try {
      window.localStorage.setItem(`loyalty_saved_${slug}`, "true");
    } catch {
      // ignore
    }
  };

  const onApple = () => {
    markSaved();
    showToast("✅ Wird zu Apple Wallet hinzugefügt...");
  };

  const onGoogle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!googleUrl) {
      e.preventDefault();
      return;
    }
    markSaved();
    window.open(googleUrl, "_blank");
    showToast("✅ Wird zu Google Wallet hinzugefügt...");
  };

  const stars = card ? Array.from({ length: card.stamps_required ?? 10 }) : [];
  const cardColor = card?.color_hex ?? "#6366f1";

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={tenantName} className="mx-auto mb-4 h-20 w-20 rounded-xl object-contain" />
        ) : (
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-800 text-3xl font-bold text-amber-400">
            {tenantName.charAt(0)}
          </div>
        )}

        <h1 className="text-lg font-bold sm:text-xl lg:text-2xl">{tenantName}</h1>
        <p className="mt-1 text-zinc-400">Digitale Stempelkarte — jetzt sichern!</p>

        {card ? (
          <div
            className="mt-6 rounded-2xl p-6 text-white shadow-xl"
            style={{ background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}CC 100%)` }}
          >
            <div className="text-sm font-medium uppercase tracking-wider opacity-80">
              {card.name}
            </div>
            <div className="mt-1 text-xl font-bold">{card.reward_name}</div>
            <div className="mt-1 text-sm opacity-90">
              Sammle {card?.stamps_required ?? 10} Stempel
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {stars.map((_, i) => (
                <span key={i} className="text-2xl opacity-70">
                  ⭐
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {appleConfigured ? (
            <a
              href={`/${slug}/loyalty/pass/apple`}
              onClick={onApple}
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-800"
            >
              🍎 Apple Wallet hinzufügen
            </a>
          ) : null}
          {googleConfigured ? (
            <a
              href={googleUrl ?? "#"}
              onClick={onGoogle}
              style={googleUrl ? {} : { pointerEvents: "none", opacity: 0.5 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-zinc-900"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Wallet hinzufügen
            </a>
          ) : null}
        </div>

        <Link href="/" className="mt-6 inline-block text-sm text-zinc-500 hover:text-zinc-300">
          Später
        </Link>

        <div className="mt-8 text-xs text-zinc-600">
          Powered by digi-gastro — Stempel sofort im Wallet
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </main>
  );
}