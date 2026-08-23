"use client";

import ScrollReveal from "./ScrollReveal";

const testimonials = [
  {
    quote:
      "Bestellvorgänge sind 3x schneller geworden. Die Gäste lieben das NFC-Tap vom ersten Tag an. Wir brauchten keine Schulung — es funktioniert einfach.",
    author: "Ferhad",
    role: "Inhaber · Shisha-Bar",
    initials: "F",
  },
  {
    quote:
      "Endlich kein Stress mehr mit Stempelkarten aus Papier. Die Wallet-Push-Marketing-Funktion bringt uns Stammgäste zurück, die wir seit Monaten nicht gesehen hatten.",
    author: "Memo Team",
    role: "Geschäftsführung · Lounge",
    initials: "M",
  },
  {
    quote:
      "Setup in 5 Minuten, kein IT-Mensch nötig. Die GoBD-Exporte gibt mir mein Steuerberater direkt durch. Hätte nie gedacht, dass das so einfach geht.",
    author: "Ahmed",
    role: "Inhaber · Restaurant",
    initials: "A",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400/80 mb-3">
            Erfolgsgeschichten
          </p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">Was Gastronomen sagen.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Echte Stimmen aus echten Betrieben — keine erfundenen Werbesprüche.
          </p>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <ScrollReveal key={t.author} delay={index * 0.1}>
              <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-[#11131a] p-8 transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-6 flex-1 text-zinc-300 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-400 ring-1 ring-amber-500/20">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.author}</div>
                    <div className="text-xs text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
