"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const faqs = [
  {
    question: "Brauche ich spezielle Hardware?",
    answer:
      "Nein. digi-gastro läuft im Browser auf Tablet, Smartphone oder PC (iOS, Android, Windows). Für NFC reichen Aufkleber ab ca. 1 € pro Tisch. Kein App-Store, kein Techniker.",
  },
  {
    question: "Brauchen meine Gäste eine App?",
    answer:
      "Nein. QR scannen oder NFC tippen — die Speisekarte öffnet sich direkt im Browser. Funktioniert auf iOS und Android gleich.",
  },
  {
    question: "Was kostet digi-gastro?",
    answer:
      "Monatlicher Flatrate-Preis, 0 % Provision, kein Setup-Fee. Den passenden Preis für deinen Betrieb schicken wir dir unverbindlich per WhatsApp — meist in Minuten. 14 Tage kannst du gratis testen, ohne Kreditkarte.",
  },
  {
    question: "Falls Provisionen pro Bestellung an?",
    answer:
      "Nein. Du behältst 100 % deines Umsatzes. Es gibt keine versteckten Kosten pro Bestellung oder Gast.",
  },
  {
    question: "Ist digi-gastro GoBD-konform?",
    answer:
      "Ja. Stornos, Änderungen und Zahlungen laufen über ein manipulationssicheres Audit-Log. Stornos erfordern eine Mitarbeiter-PIN. Steuerberater-Export als PDF/Excel ist ein Klick.",
  },
  {
    question: "Wie lange dauert das Setup?",
    answer:
      "Ca. 5 Minuten: Account, Logo, Produkte per CSV oder KI-Bildern, QR ausdrucken, NFC auf die Tische. Keine Beratung, keine Wartezeit.",
  },
  {
    question: "Kann ich meine bestehende Kasse behalten?",
    answer:
      "Ja. Lightspeed, SumUp, Tillhub, HelloCash und Custom-Webhooks sind vorgesehen. Kein Vendor-Lock-in, keine Pflicht zur neuen Hardware.",
  },
  {
    question: "Gibt es Küchen-Display, Personal und Lager?",
    answer:
      "Ja — alles im selben Dashboard: KDS in Echtzeit, Schichtplan & Urlaub, Inventur & Rezepte, Reports, Loyalty, Chat und Mini-Website für den Betrieb.",
  },
  {
    question: "Wo liegen die Daten?",
    answer:
      "Auf Servern in Deutschland, DSGVO-konform. Du kannst Inhalte und Exporte jederzeit mitnehmen — kein Lock-in.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-white/5 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Häufig gestellte Fragen
          </h2>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#11131a]">
      <button
        id={buttonId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/5 sm:px-6"
      >
        <span className="text-base font-semibold text-white sm:text-lg">
          {question}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 text-sm leading-relaxed text-zinc-400 sm:px-6 sm:pb-6">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}
