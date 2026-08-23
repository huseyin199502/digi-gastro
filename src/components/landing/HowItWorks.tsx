"use client";

import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    step: "01",
    title: "QR scannen oder NFC tippen",
    description: "Deine Gäste scannen den QR-Code am Tisch oder halten das Handy an den NFC-Chip. Keine App nötig, funktioniert auf jedem Smartphone.",
  },
  {
    step: "02",
    title: "Bestellung aufgeben",
    description: "Gäste wählen ihre Speisen und Getränke aus und senden die Bestellung in Echtzeit direkt an das Küchen-Display.",
  },
  {
    step: "03",
    title: "Genießen & Stempel sammeln",
    description: "Das Essen wird serviert. Gleichzeitig sammeln Gäste automatisch digitale Stempel im Apple & Google Wallet.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative border-y border-white/5 bg-[#0b0c10]/60 py-32">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white md:text-5xl">So einfach funktioniert&apos;s</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            In drei Schritten zum modernen Gastronomie-Erlebnis.
          </p>
        </ScrollReveal>

        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((item, index) => (
            <ScrollReveal key={item.step} delay={index * 0.15} className="relative">
              <div className="mb-6 text-6xl font-black text-amber-500/20">{item.step}</div>
              <h3 className="mb-3 text-2xl font-bold text-white">{item.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{item.description}</p>
              {index < steps.length - 1 && (
                <div className="absolute top-8 right-0 hidden h-px w-1/2 bg-gradient-to-r from-amber-500/50 to-transparent md:block -translate-x-1/2" />
              )}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
