"use client";

import type { ReactNode } from "react";
import ScrollReveal from "./ScrollReveal";

type FeatureIcon =
  | "nfc"
  | "bell"
  | "wallet"
  | "ticket"
  | "game"
  | "map"
  | "split"
  | "swap"
  | "users"
  | "tablet"
  | "kds"
  | "hookah"
  | "clock"
  | "hand"
  | "link"
  | "box"
  | "chart"
  | "shield"
  | "megaphone"
  | "ad"
  | "globe"
  | "star"
  | "trend";

type Feature = {
  title: string;
  description: string;
  badge?: string;
  icon: FeatureIcon;
};

type Cluster = {
  id: string;
  label: string;
  headline: string;
  intro: string;
  features: Feature[];
};

const iconPaths: Record<FeatureIcon, ReactNode> = {
  nfc: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.1 16.4a5.5 5.5 0 017.8 0M12 20h.01M4.9 12.9a10 10 0 0114.2 0M1.4 9.4a15 15 0 0121.2 0" />
    </>
  ),
  bell: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
  ),
  wallet: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm14 5h.01" />
  ),
  ticket: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8a2 2 0 012-2h12a2 2 0 012 2v1a2 2 0 000 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1a2 2 0 000-4V8z" />
  ),
  game: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h4m-2-2v4m8-3h.01M18 14h.01M7 6h10a4 4 0 014 4v4a4 4 0 01-4 4H7a4 4 0 01-4-4v-4a4 4 0 014-4z" />
  ),
  map: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4l6 2 6-2v14l-6 2-6-2-6 2V6l6-2zm0 0v14m6-12v14" />
  ),
  split: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  ),
  swap: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  ),
  users: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a4 4 0 11-4-4" />
  ),
  tablet: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2zm3 13h6" />
  ),
  kds: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v10H4V6zm4 14h8M9 10h2m2 0h2" />
  ),
  hookah: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2 2 2 4 0 6-2-2-2-4 0-6zm-5 10c0 4 2.5 7 5 7s5-3 5-7H7zm5 7v3m-4 0h8" />
  ),
  clock: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  hand: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V6a2 2 0 114 0v5m0-2a2 2 0 114 0v3m0-1a2 2 0 114 0v5a6 6 0 01-6 6h-1a6 6 0 01-6-6v-3a2 2 0 114 0" />
  ),
  link: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L10 5.93M14 11a5 5 0 00-7.07 0L5.5 12.43a5 5 0 007.07 7.07L14 18.07" />
  ),
  box: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8l-9-5-9 5v8l9 5 9-5V8zm-18 0l9 5 9-5M12 13v9" />
  ),
  chart: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h16M8 16V10m4 6V7m4 9v-4" />
  ),
  shield: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v6c0 5-3.5 8.5-8 9.5C7.5 20.5 4 17 4 12V6l8-3zm-3 9l2 2 4-4" />
  ),
  megaphone: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zm12-1c1.5 1 1.5 4 0 5m2-7c3 2 3 7 0 9" />
  ),
  ad: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4V6zm4 4h8M8 14h5" />
  ),
  globe: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm-9-9h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z" />
  ),
  star: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.05 2.93c.3-.92 1.6-.92 1.9 0l1.5 4.67a1 1 0 00.95.7h4.92c.97 0 1.37 1.24.59 1.81l-3.98 2.89a1 1 0 00-.36 1.12l1.52 4.67c.3.92-.76 1.69-1.54 1.12l-3.98-2.89a1 1 0 00-1.17 0l-3.98 2.89c-.78.57-1.84-.2-1.54-1.12l1.52-4.67a1 1 0 00-.36-1.12L2.99 10.1c-.78-.57-.38-1.81.59-1.81h4.91a1 1 0 00.95-.7l1.51-4.67z" />
  ),
  trend: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  ),
};

const clusters: Cluster[] = [
  {
    id: "gaeste",
    label: "Für Gäste",
    headline: "Bestellen ohne Warten. Ohne App.",
    intro:
      "Der Gast tippt — die Küche und das Team wissen Bescheid. Kontaktlos, in Sekunden, auf jedem Smartphone.",
    features: [
      {
        title: "NFC Tap-to-Order & QR",
        description:
          "Handy an den Chip am Tisch halten oder QR scannen — Speisekarte in unter 1 Sekunde. Kein Download, kein Account-Zwang.",
        badge: "<1s bis Speisekarte",
        icon: "nfc",
      },
      {
        title: "Service rufen & Bestellstatus",
        description:
          "Kellner rufen, Rechnung anfordern, Bestellung live verfolgen — der Gast hat die Kontrolle, das Team den Überblick.",
        icon: "bell",
      },
      {
        title: "Digitale Stempelkarte",
        description:
          "Apple Wallet & Google Wallet statt Papier. Push für Angebote, Stufen von Neu bis VIP, automatisch nach dem Besuch.",
        badge: "Apple & Google Wallet",
        icon: "wallet",
      },
      {
        title: "Gutscheine & Tisch-Chat",
        description:
          "Rabattcodes am Tisch einlösen, Fragen stellen — moderiert und ohne fremde Messenger-Gruppen.",
        icon: "ticket",
      },
      {
        title: "Spiele im Betrieb",
        description:
          "Quiz, Ludo, Kart & mehr zwischen den Bestellungen — Gäste bleiben länger, bestellen öfter.",
        badge: "Einzigartig",
        icon: "game",
      },
    ],
  },
  {
    id: "team",
    label: "Fürs Team",
    headline: "Ein Cockpit für Service & Kasse.",
    intro:
      "Live-Sitzplan, Teilzahlung, Personal-PINs — weniger Rechenfehler, mehr Zeit für die Gäste.",
    features: [
      {
        title: "Live-Sitzplan",
        description:
          "Drag-Drop mit Zonen, farbcodierte Status (frei / belegt / serviert / Service), Tische zusammenführen und verschieben.",
        badge: "Echtzeit",
        icon: "map",
      },
      {
        title: "Teilzahlung & Split-Pay",
        description:
          "Einzelne Artikel auszahlen, Rechnung teilen — „Wer zahlt was?“ ohne Zettel und ohne Rechenfehler.",
        icon: "split",
      },
      {
        title: "Manuelle Bestellungen & Transfer",
        description:
          "Bestellungen am Tablet erfassen, Positionen übertragen, Tische mergen, Stornos nur mit PIN.",
        icon: "swap",
      },
      {
        title: "Personal & Schichtplan",
        description:
          "Schichten, Urlaubsanträge, Verfügbarkeiten, Statistiken — das ganze Team in einem Tab.",
        icon: "users",
      },
      {
        title: "Tablet- & Geräte-Status",
        description:
          "Heartbeat für Kellner-Devices, Rollen (Chef / Kellner), Session-Schutz für sensible Aktionen.",
        icon: "tablet",
      },
    ],
  },
  {
    id: "kueche",
    label: "Küche & Shisha",
    headline: "KDS, Kohle, alles im Flow.",
    intro:
      "Was am Tisch bestellt wird, landet sofort am richtigen Display — inklusive Shisha-Sonderlogik.",
    features: [
      {
        title: "Küchen-Display (KDS)",
        description:
          "Echtzeit-Tickets nach Super-Gruppen gefiltert, Status Serviert schließt automatisch — kein Papierbon nötig.",
        badge: "Echtzeit",
        icon: "kds",
      },
      {
        title: "Shisha-Modus",
        description:
          "Kohle per Klick nachlegen. Anfrage geht an den Kohlemeister, Shakes & Snacks an Bar/Küche.",
        badge: "Einzigartig am Markt",
        icon: "hookah",
      },
      {
        title: "Happy Hour & Events",
        description:
          "Zeitfenster, Wochentage, Kombi-Sets und Event-Preise — serverseitig berechnet, nicht manipulierbar.",
        icon: "clock",
      },
      {
        title: "Kellner-Service-Modus",
        description:
          "Service-Rufe, Bar/Karte-Wahl, Zahlungsmarken — der Ablauf bleibt auch bei vollen Haus am Stück.",
        icon: "hand",
      },
    ],
  },
  {
    id: "betrieb",
    label: "Betrieb & Zahlen",
    headline: "Vom Lager bis zum Steuerberater.",
    intro:
      "Reporting, Bestand, Marketing und Compliance — alles, was nach Ladenschluss passiert.",
    features: [
      {
        title: "Universal-POS-Anbindung",
        description:
          "Lightspeed, SumUp, Tillhub, HelloCash oder Custom per Webhook. Kein Vendor-Lock-in, keine neue Kasse.",
        badge: "Kein Lock-in",
        icon: "link",
      },
      {
        title: "Lager & Rezepte",
        description:
          "Bestände, Lieferanten, Inventur, Rezepturen und Bestellungen — Ausverkauftes wird automatisch sichtbar.",
        icon: "box",
      },
      {
        title: "Reports, PDF & Excel",
        description:
          "Tages-/Monatsreport, Bon-Export, Einzelbon als PDF — für dich und den Steuerberater in einem Klick.",
        icon: "chart",
      },
      {
        title: "GoBD & Audit-Log",
        description:
          "Jede Stornierung und Zahlung manipulationssicher protokolliert, Stornos mit Mitarbeiter-PIN.",
        badge: "GoBD-konform",
        icon: "shield",
      },
      {
        title: "Wallet-Push & Geofencing",
        description:
          "Kampagnen an Stammgäste senden, Benachrichtigungen am Standort auslösen — mehr Wiederkehrer.",
        icon: "megaphone",
      },
      {
        title: "Werbung in der Speisekarte",
        description:
          "Eigene Werbeflächen in der Digitalen Karte verkaufen — Zusatzumsatz pro Betrieb.",
        badge: "Ad-Revenue",
        icon: "ad",
      },
      {
        title: "Restaurant-Website & Landing",
        description:
          "Willkommen, Galerie, Events, Öffnungszeiten — Mini-Site und Speisekarte aus einem System.",
        icon: "globe",
      },
      {
        title: "Google-Review-Booster",
        description:
          "Nach dem Bezahlen zufriedene Gäste direkt zur Google-Bewertung leiten — mehr lokale Sichtbarkeit.",
        icon: "star",
      },
      {
        title: "3-Schicht-Upselling",
        description:
          "Manuelle Empfehlungen + Auto-Regeln + Co-Occurrence — das System lernt, was zusammenkauft wird.",
        icon: "trend",
      },
    ],
  },
];

function FeatureBadgeIcon({ name }: { name: FeatureIcon }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 ring-1 ring-amber-500/25">
      <svg
        className="h-5 w-5 text-amber-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        {iconPaths[name]}
      </svg>
    </span>
  );
}

export default function FeaturesGrid() {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Alles dabei. Nichts überflüssig.
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Vier Bereiche, ein Login: Gäste, Team, Küche und Betrieb — ohne
            Tool-Paradies aus fünf Abos.
          </p>
        </ScrollReveal>

        <div className="mt-14 space-y-16 sm:space-y-20">
          {clusters.map((cluster) => (
            <div key={cluster.id} id={cluster.id} className="scroll-mt-24">
              <ScrollReveal>
                <div className="mb-6 border-b border-white/10 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                    {cluster.label}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                    {cluster.headline}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
                    {cluster.intro}
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cluster.features.map((f, i) => (
                  <ScrollReveal key={f.title} delay={Math.min(i * 0.04, 0.16)}>
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#14161e] to-[#11131a] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-amber-500/35 hover:shadow-xl hover:shadow-amber-500/5">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 transition group-hover:opacity-100"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-base font-semibold text-white">{f.title}</h4>
                        <FeatureBadgeIcon name={f.icon} />
                      </div>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                        {f.description}
                      </p>
                      {f.badge ? (
                        <span className="mt-4 inline-flex w-fit rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                          {f.badge}
                        </span>
                      ) : null}
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
