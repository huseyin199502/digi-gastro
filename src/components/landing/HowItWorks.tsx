"use client";

import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    step: "01",
    title: "QR scannen oder NFC tippen",
    description:
      "Gäste scannen den Code am Tisch oder halten das Handy an den Chip. Die Speisekarte öffnet sich im Browser — keine App.",
  },
  {
    step: "02",
    title: "Bestellung live in die Küche",
    description:
      "Warenkorb abschicken: KDS, Sitzplan und Service-Tablets aktualisieren sich in Echtzeit. Preise kommen vom Server.",
  },
  {
    step: "03",
    title: "Servieren, zahlen, Stempel sammeln",
    description:
      "Split-Pay am Tablet, Review-Link nach dem Bezahlen, Wallet-Stempel automatisch — der Kreis schließt sich.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-y border-white/5 bg-[#0b0c10] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">
            In 3 Schritten
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            So einfach funktioniert&apos;s
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Kein Techniker, kein Projektwochenende — Setup in unter fünf Minuten.
          </p>
        </ScrollReveal>

        <ol className="grid gap-3 sm:gap-4 md:grid-cols-3 lg:gap-6">
          {steps.map((item, index) => (
            <ScrollReveal key={item.step} delay={index * 0.1}>
              <li className="relative h-full rounded-2xl border border-white/10 bg-[#11131a] p-6">
                <div className="mb-4 text-4xl font-black text-amber-500/25">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
