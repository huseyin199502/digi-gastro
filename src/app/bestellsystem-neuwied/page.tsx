import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://digi-gastro.de";
const WHATSAPP_URL = "https://wa.me/4915228450561?text=Hallo%2C%20ich%20m%C3%B6chte%20digi-gastro%2014%20Tage%20gratis%20testen";

export const metadata: Metadata = {
  title: "Bestellsystem Neuwied — QR-Bestellung & digitale Speisekarte | digi-gastro",
  description:
    "Digitales Bestellsystem für Restaurants, Shisha-Bars & Cafés in Neuwied, Koblenz und dem Westerwald: QR-Speisekarte, NFC-Tischbestellung, Küchen-Display, Stempelkarte — ohne App-Download, ohne Provisionen. 14 Tage gratis testen.",
  keywords: [
    "bestellsystem neuwied",
    "bestellsystem restaurant neuwied",
    "qr bestellsystem neuwied",
    "digitale speisekarte neuwied",
    "bestellsystem koblenz",
    "bestellsystem shisha bar",
    "digitales bestellsystem rheinland-pfalz",
    "bestellsystem westerwald",
    "gastronomie software neuwied",
  ],
  alternates: {
    canonical: "/bestellsystem-neuwied",
  },
  openGraph: {
    title: "Bestellsystem Neuwied — digi-gastro",
    description:
      "Das digitale Bestellsystem aus Neuwied: QR-Speisekarte, Tischbestellung per NFC, Küchen-Display & Stempelkarte — ohne App, ohne Provisionen.",
    url: "/bestellsystem-neuwied",
    locale: "de_DE",
    type: "website",
  },
};

const faqs = [
  {
    q: "Was kostet ein Bestellsystem für mein Restaurant in Neuwied?",
    a: "digi-gastro gibt es 14 Tage kostenlos zum Testen — komplett, ohne Funktionseinschränkung. Danach zahlen Sie einen monatlichen Festpreis ohne Einrichtungsgebühr und ohne Provisionsanteile an Bestellungen. Schreiben Sie uns auf WhatsApp, Sie erhalten den Preis sofort und unverbindlich.",
  },
  {
    q: "Brauchen meine Gäste eine App?",
    a: "Nein. Ihre Gäste scannen den QR-Code am Tisch oder tippen auf einen NFC-Aufkleber — die Speisekarte öffnet sich direkt im Browser, auf iOS und Android. Kein Download, keine Registrierung für die Bestellung.",
  },
  {
    q: "Welches Bestellsystem eignet sich für Shisha-Bars?",
    a: "digi-gastro wurde mit Shisha-Loungens entwickelt: Tischplan mit Zonen, Tab-Bestellungen über mehrere Stunden, Kombis, Services-Rufe und Stempelkarten für Apple & Google Wallet. Die Deer Lounge zeigt es live im Einsatz.",
  },
  {
    q: "Wie schnell ist das Bestellsystem einsatzbereit?",
    a: "In unter 30 Minuten: Speisekarte anlegen (oder per CSV importieren), Tische festlegen, QR-Codes drucken und auf die Tische kleben. Hardware, die Sie vielleicht schon haben — ein Tablet oder Smartphone im Servicebereich — genügt vollständig.",
  },
  {
    q: "Ist das Bestellsystem finanzamtsicher (GoBD)?",
    a: "Ja. Jede Bestellung, Stornierung und Zahlung wird manipulationssicher im Audit-Log aufgezeichnet, Stornos erfordern eine Mitarbeiter-PIN. Export als PDF oder Excel mit einem Klick — bereit für die Steuerprüfung.",
  },
  {
    q: "Arbeiten Sie auch mit Lokalen außerhalb von Neuwied?",
    a: "Ja. Unser Schwerpunkt ist Neuwied, Koblenz, Andernach, Mayen und der Westerwald — digital betreuen wir aber Lokale in ganz Deutschland. Vor-Ort-Service gibt es in einem Umkreis von etwa 50 km um Neuwied.",
  },
];

export default function BestellsystemNeuwiedPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Digitales Bestellsystem Neuwied — digi-gastro",
        serviceType: "Digitales Bestellsystem & QR-Speisekarte für die Gastronomie",
        provider: {
          "@type": "Organization",
          name: "digi-gastro",
          url: BASE_URL,
        },
        areaServed: [
          { "@type": "City", name: "Neuwied" },
          { "@type": "City", name: "Koblenz" },
          { "@type": "City", name: "Andernach" },
          { "@type": "City", name: "Mayen" },
          { "@type": "AdministrativeArea", name: "Westerwaldkreis" },
          { "@type": "AdministrativeArea", name: "Rheinland-Pfalz" },
        ],
        description:
          "Digitales Bestellsystem für Restaurants, Shisha-Bars und Cafés: QR-Speisekarte, NFC-Tischbestellung, Küchen-Display und Stempelkarte — ohne App-Download, ohne Provisionen.",
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          priceCurrency: "EUR",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#050507] text-white antialiased">
        <Navbar />
        <main className="relative">
          {/* Hero */}
          <section className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              📍 Lokaler Anbieter aus Neuwied
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Bestellsystem Neuwied —{" "}
              <span className="text-amber-400">digitale QR-Bestellung</span> für
              Restaurants &amp; Shisha-Bars
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Gäste scannen den QR-Code am Tisch und bestellen direkt per
              Speisekarte im Browser — Ihre Küche sieht jede Bestellung
              sofort auf dem Küchen-Display. Ohne App-Download, ohne
              Provisionen pro Bestellung. Entwickelt und betreut aus{" "}
              <strong className="text-white">Neuwied</strong> — für Lokale in
              Koblenz, Andernach, Mayen und dem Westerwald.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
              >
                14 Tage gratis testen
              </a>
              <Link
                href="/deer-lounge"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Live-Demo ansehen →
              </Link>
            </div>
          </section>

          {/* Features */}
          <section className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="text-center text-3xl font-bold">
              Alles drin, was Ihr Lokal braucht
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "📱",
                  title: "QR- & NFC-Bestellung",
                  text: "Gäste bestellen selbst am Tisch — falsch verstandene Bestellungen und Wartezeiten am Tisch entfallen. Optional NFC-Aufkleber statt QR.",
                },
                {
                  icon: "🖥️",
                  title: "Küchen-Display (KDS)",
                  text: "Jede Bestellung landet in Echtzeit auf dem Küchenbildschirm — inklusive Statusverfolgung (zubereiten → serviert). Drucker optional.",
                },
                {
                  icon: "🧾",
                  title: "GoBD-konforme Kasse",
                  text: "Manipulationssicheres Audit-Log, Storno nur mit PIN, Export als PDF/Excel. Bereit für jede Steuerprüfung.",
                },
                {
                  icon: "🎫",
                  title: "Stempelkarte im Wallet",
                  text: "Treuekarten für Apple Wallet & Google Wallet — automatische Stempel bei jeder Bestellung, Push-Nachrichten an Ihre Stammgäste.",
                },
                {
                  icon: "🪑",
                  title: "Tischplan & Umbuchung",
                  text: "Zonen, Live-Status pro Tisch, Teilzahlungen, Bon-Splitting und sichere Umbuchung — perfekt für Shisha-Loungens mit langer Sitzdauer.",
                },
                {
                  icon: "📣",
                  title: "Events & Sonderpreise",
                  text: "Happy Hours, Rabattaktionen und Kombi-Angebote mit Zeitplanung — das Laufband auf der Speisekarte verkauft mit.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-amber-400/40"
                >
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Ablauf */}
          <section className="mx-auto max-w-4xl px-6 py-12">
            <h2 className="text-center text-3xl font-bold">
              In 3 Schritten live — heute angefragt, morgen bestellt
            </h2>
            <ol className="mt-10 space-y-6">
              {[
                {
                  t: "1. WhatsApp schreiben",
                  d: "Sie erhalten sofort einen Zugang und legen Ihre Speisekarte an — oder schicken uns Ihre Karte als PDF/Foto, wir übernehmen das für Sie.",
                },
                {
                  t: "2. Tische & QR-Codes festlegen",
                  d: "Tischplan anlegen, QR-Codes drucken, auf die Tische kleben. Fertig — ein Tablet im Servicebereich genügt als Kassenstation.",
                },
                {
                  t: "3. Gäste bestellen, Sie verkaufen mehr",
                  d: "Durchschnittlich steigt die Bestellfrequenz, weil Gäste nicht auf die Bedienung warten. Sie sehen jeden Euro live im Cockpit.",
                },
              ].map((s) => (
                <li key={s.t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <div>
                    <h3 className="text-lg font-bold text-amber-300">{s.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                      {s.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Für wen */}
          <section className="mx-auto max-w-4xl px-6 py-12">
            <h2 className="text-center text-3xl font-bold">
              Das richtige Bestellsystem für jedes Lokal
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  t: "🍽️ Restaurants & Gasthäuser",
                  d: "Klassische Tischbestellung mit Bedienung oder Gästeselbstbedienung — Sie entscheiden pro Tisch.",
                },
                {
                  t: "💨 Shisha-Bars & Lounges",
                  d: "Tab-Bestellungen über Stunden, Kombis, Kohle- & Service-Rufe, Stempelkarten. Die Spezialität von digi-gastro.",
                },
                {
                  t: "☕ Cafés & Bistros",
                  d: "Schnelle Abwicklung am Tresen oder am Tisch, GoBD-konform ab Rechnung 1.",
                },
                {
                  t: "🍦 Eisdielen & Imbisse",
                  d: "Selbstbedienung per QR am Tisch oder am Fenster — ohne Extra-Kassensystem-Hardware.",
                },
              ].map((f) => (
                <div key={f.t} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="font-bold">{f.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mx-auto max-w-3xl px-6 py-12">
            <h2 className="text-center text-3xl font-bold">
              Häufige Fragen zum Bestellsystem in Neuwied
            </h2>
            <div className="mt-8 space-y-4">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 open:border-amber-400/40"
                >
                  <summary className="cursor-pointer list-none font-semibold text-white marker:hidden">
                    <span className="mr-2 text-amber-400 group-open:hidden">+</span>
                    <span className="mr-2 hidden text-amber-400 group-open:inline">−</span>
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
            <h2 className="text-3xl font-bold">
              Überzeugt? Testen Sie es 14 Tage — kostenlos.
            </h2>
            <p className="mt-3 text-zinc-300">
              Lokal aus Neuwied, persönlich per WhatsApp erreichbar, Vor-Ort-Service
              im Umkreis von 50 km.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
            >
              Jetzt kostenlos testen →
            </a>
            <p className="mt-6 text-sm text-zinc-500">
              Mehr zur Plattform:{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                digi-gastro.de
              </Link>
            </p>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
