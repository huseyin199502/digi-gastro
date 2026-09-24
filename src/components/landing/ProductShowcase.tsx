"use client";

import ScrollReveal from "./ScrollReveal";

/** Produkt-Showcase: Sitzplan + KDS als UI-Mockups (Premium-Visual) */
export default function ProductShowcase() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-[#0b0c10] py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <ScrollReveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">
            Produkt
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Sitzplan, KDS und Bestellung —{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              ein Blick
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Was am Tisch bestellt wird, erscheint live in der Küche und im
            Cockpit. Kein Zettel, kein Zuruf, kein Ratespiel.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          {/* Sitzplan mock */}
          <ScrollReveal className="lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-[#11131a] p-4 shadow-2xl shadow-black/40 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Live-Sitzplan
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    Innen · Terrasse
                  </p>
                </div>
                <div className="flex gap-1.5 text-[10px]">
                  <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-400">Frei</span>
                  <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-400">Belegt</span>
                  <span className="rounded-full bg-sky-500/15 px-2 py-1 text-sky-400">Serviert</span>
                </div>
              </div>

              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-orange-400/80">
                Innen
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[
                  { n: "1", s: "belegt", c: "border-amber-500/40 bg-amber-500/10 text-amber-300", m: "20,50 €" },
                  { n: "2", s: "offen", c: "border-amber-500/30 bg-amber-500/5 text-amber-400", m: "1 offen" },
                  { n: "3", s: "serviert", c: "border-sky-500/35 bg-sky-500/10 text-sky-300", m: "7,50 €" },
                  { n: "4", s: "frei", c: "border-white/10 bg-white/[0.02] text-zinc-500", m: "—" },
                  { n: "5", s: "Service", c: "border-red-500/35 bg-red-500/10 text-red-400", m: "Ruf" },
                  { n: "6", s: "frei", c: "border-white/10 bg-white/[0.02] text-zinc-500", m: "—" },
                ].map((t) => (
                  <div
                    key={t.n}
                    className={`rounded-xl border px-2 py-2.5 text-center transition hover:scale-[1.03] ${t.c}`}
                  >
                    <div className="text-sm font-bold leading-none">{t.n}</div>
                    <div className="mt-1 text-[9px] uppercase tracking-wide opacity-80">{t.s}</div>
                    <div className="mt-1 text-[9px] font-medium opacity-90">{t.m}</div>
                  </div>
                ))}
              </div>

              <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-sky-400/80">
                Terrasse
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[
                  { n: "7", s: "belegt", c: "border-amber-500/40 bg-amber-500/10 text-amber-300", m: "14,00 €" },
                  { n: "8", s: "frei", c: "border-white/10 bg-white/[0.02] text-zinc-500", m: "—" },
                  { n: "9", s: "belegt", c: "border-amber-500/40 bg-amber-500/10 text-amber-300", m: "9,50 €" },
                  { n: "10", s: "frei", c: "border-white/10 bg-white/[0.02] text-zinc-500", m: "—" },
                ].map((t) => (
                  <div
                    key={t.n}
                    className={`rounded-xl border px-2 py-2.5 text-center transition hover:scale-[1.03] ${t.c}`}
                  >
                    <div className="text-sm font-bold leading-none">{t.n}</div>
                    <div className="mt-1 text-[9px] uppercase tracking-wide opacity-80">{t.s}</div>
                    <div className="mt-1 text-[9px] font-medium opacity-90">{t.m}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* KDS + stats mock */}
          <ScrollReveal delay={0.1} className="lg:col-span-2">
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#11131a] p-4 shadow-2xl shadow-black/40 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Küchen-Display
                  </p>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Tisch 12</span>
                      <span className="text-[11px] font-semibold text-amber-400">0:14</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-300">2× Cola Zero · 1× Cheeseburger</p>
                    <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      In Zubereitung
                    </span>
                  </div>
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Tisch 7 · Shisha</span>
                      <span className="text-[11px] text-emerald-400">✓</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">1× Kohle nachlegen</p>
                    <span className="mt-2 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                      Serviert
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: "Umsatz heute", v: "1.284 €" },
                  { k: "Offene Tische", v: "4" },
                  { k: "Ø Bon", v: "24,60 €" },
                  { k: "Service-Rufe", v: "1" },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="rounded-xl border border-white/10 bg-[#11131a] px-3 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">{s.k}</p>
                    <p className="mt-1 text-lg font-bold text-white">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
