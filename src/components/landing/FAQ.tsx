"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const faqs = [
  {
    question: "Brauche ich spezielle Hardware?",
    answer:
      "Nein! digi-gastro läuft auf jedem Tablet, Smartphone oder Computer — im Browser. Egal ob iOS, Android oder Windows. Für NFC brauchst du nur NFC-Aufkleber (ab ~1 €/Stück) auf die Tische legen. Kein App-Store, kein App-Download.",
  },
  {
    question: "Brauchen meine Gäste eine App?",
    answer:
      "Nein, überhaupt nicht. Deine Gäste scannen einfach den QR-Code am Tisch oder tippen auf den NFC-Chip und die Speisekarte öffnet sich direkt im Browser ihres Smartphones. Das funktioniert auf iOS und Android gleichermaßen.",
  },
  {
    question: "Wie funktioniert die digitale Stempelkarte?",
    answer:
      "Nach der Bestellung erhält der Gast einen Link, um die Stempelkarte zu seinem Apple Wallet oder Google Wallet hinzuzufügen. Bei jedem Besuch wird der Stempel automatisch digital erfasst — inklusive Push-Benachrichtigungen für Angebote.",
  },
  {
    question: "Fallen Provisionen pro Bestellung an?",
    answer:
      "Nein. digi-gastro arbeitet mit einem fairen monatlichen Flatrate-Modell. Es gibt keine versteckten Kosten und keine Provisionen pro Bestellung oder Gast. Du behältst 100 % deines Umsatzes.",
  },
  {
    question: "Ist das Finanzamtsicher?",
    answer:
      "Ja! Jede Stornierung, jede Änderung und jeder Bezahlvorgang wird manipulationssicher in einem kryptografisch verschlüsselten Audit-Log aufgezeichnet. Stornos erfordern eine Mitarbeiter-PIN. Der GoBD-konforme Steuerberater-Export (PDF/Excel) ist mit einem Klick generierbar.",
  },
  {
    question: "Wie lange dauert das Setup?",
    answer:
      "5 Minuten. Account erstellen, Logo hochladen, Produkte per CSV importieren (oder KI-Bilder generieren lassen), QR-Codes ausdrucken, NFC-Aufkleber auf Tische kleben — fertig. Keine Beratung, kein Techniker, keine Wartezeit.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative border-t border-white/5 py-32">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white md:text-5xl">Häufig gestellte Fragen</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Alles Wissenswerte über das Betriebssystem der modernen Gastronomie.
          </p>
        </ScrollReveal>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
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
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/5"
      >
        <span className="pr-4 text-lg font-semibold text-white">{question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-amber-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 text-zinc-400 leading-relaxed">{answer}</div>
        </div>
      </div>
    </div>
  );
}
