"use client";

import { useEffect, useRef } from "react";
import ScrollReveal from "./ScrollReveal";

const features = [
  {
    title: "NFC Tap-to-Order",
    description:
      "Gäste halten ihr Handy an den NFC-Chip am Tisch — die Speisekarte öffnet sich in unter 1 Sekunde. Kein QR-Code-Foto, kein Suchen, kein Warten. NFC ist 2026 — QR-Codes sind 2020.",
    stats: ["<1s bis Speisekarte", "0€ App-Kosten", "100% kontaktlos"],
    icon: (
      <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    highlight: true,
  },
  {
    title: "Shisha-Modus",
    description:
      "Kohle per Klick nachlegen. Gäste ordern am Smartphone, die Anfrage landet beim Kohlemeister. Shakes & Snacks gehen automatisch an Bar/Küche.",
    badge: "Einzigartig am Markt",
    icon: (
      <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  {
    title: "3-Schicht-Upselling",
    description:
      "Manuelle Empfehlungen + Auto-Rules + KI-Co-Occurrence. Die Software lernt was zusammengekauft wird und empfiehlt es automatisch im Warenkorb.",
    badge: "Bis zu 25% mehr Umsatz",
    icon: (
      <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "Universal-POS",
    description:
      "Lightspeed, SumUp, Tillhub oder Custom — verbinde dein bestehendes Kassensystem per Webhook. Kein Vendor-Lock-in, kein neues Gerät nötig.",
    badge: "Kein Vendor-Lock-in",
    icon: (
      <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: "Live-Sitzplan",
    description:
      "Drag-Drop Editor mit Zonen (Drinnen/Draußen). Farbcodierte Tisch-Status in Echtzeit: Frei, Belegt, Serviert, Ruft Service.",
    badge: "Echtzeit-Übersicht",
    icon: (
      <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    title: "Teilzahlung & Split-Pay",
    description:
      "Einzelne Artikel auszahlbar. »Wer zahlt was?« — kein Stress mehr. Kellner teilen auf dem Tablet auf, blitzschnell und ohne Rechenfehler.",
    badge: "Kein Rechenfehler",
    icon: (
      <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Google-Review-Booster",
    description:
      "Nach dem Bezahlen leitet das System zufriedene Gäste direkt zur Google-Bewertung weiter. Mehr 5-Sterne-Rezensionen, mehr lokale Sichtbarkeit.",
    badge: "Mehr Sterne = mehr Gäste",
    icon: (
      <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: "GoBD & Krypto-Audit-Log",
    description:
      "Jede Stornierung, jede Änderung, jeder Bezahlvorgang wird manipulationssicher kryptografisch verschlüsselt aufgezeichnet. Stornos erfordern Mitarbeiter-PIN. Steuerberater-Export als PDF/Excel mit einem Klick.",
    badge: "100% Finanzamtsicher",
    icon: (
      <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function FeaturesGrid() {
  const stackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── 3D Stapel-Effekt: Jede Karte pinnt per sticky GESTAFFELT im
  // Viewport (top = base + i*gap → Kanten des Stapels bleiben sichtbar).
  // Sobald nachfolgende Karten ankommen, rücken frühere per Scale +
  // Abdunklung nach hinten. Reversibel beim Hochscrollen, identisch auf
  // Desktop und Mobile. ──
  useEffect(() => {
    const stacks = stackRefs.current;
    const cards = cardRefs.current;
    const shades = shadeRefs.current;
    if (stacks.length === 0) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId = 0;

    const update = () => {
      let pinnedAfter = 0;
      for (let i = stacks.length - 1; i >= 0; i--) {
        const wrap = stacks[i];
        const card = cards[i];
        if (!wrap || !card) continue;

        if (!reduceMotion) {
          // Tiefe: je mehr spätere Karten bereits über dieser liegen,
          // desto weiter rückt diese Karte nach hinten.
          const scale = 1 - Math.min(pinnedAfter * 0.05, 0.22);
          card.style.transform = `scale(${scale.toFixed(4)})`;
          const shade = shades[i];
          if (shade) {
            shade.style.opacity = Math.min((1 - scale) * 2.4, 0.5).toFixed(3);
          }
        }

        // Sticky-Top der Karte aus den CSS-Variablen ableiten
        const style = getComputedStyle(wrap);
        const base = parseFloat(style.getPropertyValue("--stack-base")) || 92;
        const gap = parseFloat(style.getPropertyValue("--stack-gap")) || 12;
        if (wrap.getBoundingClientRect().top <= base + i * gap + 1) {
          pinnedAfter++;
        }
      }
      rafId = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section id="features" className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0c10]/70 to-transparent" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
        <ScrollReveal className="mb-16 text-center sm:mb-20">
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Alles dabei. Nichts überflüssig.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-400 sm:text-lg">
            8 Features, die deinen Betrieb transformieren — von NFC-Bestellung bis GoBD-Audit-Log.
          </p>
        </ScrollReveal>

        {/* 3D Karten-Stapel: Karten pinnen nacheinander gestaffelt übereinander */}
        <div style={{ perspective: "1400px" }}>
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => {
                stackRefs.current[index] = el;
              }}
              className={`feature-stack-item sticky ${index < features.length - 1 ? "pb-[42vh] sm:pb-[46vh]" : ""}`}
              style={{
                top: `calc(var(--stack-base) + ${index} * var(--stack-gap))`,
                zIndex: index + 1,
              }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`group relative overflow-hidden rounded-2xl border shadow-xl shadow-black/30 will-change-transform ${
                  feature.highlight
                    ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-[#11131a]"
                    : "border-white/10 bg-[#11131a]"
                }`}
                style={{ transformOrigin: "center top" }}
              >
                {/* Abdunklungs-Overlay für Tiefe */}
                <div
                  ref={(el) => {
                    shadeRefs.current[index] = el;
                  }}
                  className="pointer-events-none absolute inset-0 z-20 bg-black"
                  style={{ opacity: 0 }}
                />
                <div className="relative z-10 p-5 sm:p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-amber-500/10 p-3 ring-1 ring-amber-500/20">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mb-4 leading-relaxed text-zinc-400">{feature.description}</p>
                  {feature.stats ? (
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                      {feature.stats.map((stat) => (
                        <div key={stat} className="text-center">
                          <div className="text-xs font-bold text-amber-400 sm:text-sm">{stat}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {feature.badge ? (
                    <div className="mt-3 inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                      {feature.badge}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
