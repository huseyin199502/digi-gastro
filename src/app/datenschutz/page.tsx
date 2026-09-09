import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutz — digi-gastro",
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">Datenschutzerklärung</h1>
      <div className="space-y-6 text-zinc-300">
        <div>
          <h4 className="mb-2 font-bold">1. Datenschutz auf einen Blick</h4>
          <p>
            Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Nachfolgend
            informieren wir Sie darüber, welche Daten wir beim Besuch unserer Website und
            bei der Nutzung unserer Dienste erheben und verarbeiten.
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-bold">2. Verantwortliche Stelle</h4>
          <p>
            Verantwortlich für die Datenverarbeitung ist Mehmet Can Ipek
            (Vorgründungsphase), Anschrift: folgt, E-Mail: folgt.
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-bold">3. Erhebung und Speicherung personenbezogener Daten</h4>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Registrierungsdaten:</strong> Bei der Anmeldung eines Restaurants
              erheben wir Name, E-Mail-Adresse und Passwort, um den Account bereitzustellen.
            </li>
            <li>
              <strong>Nutzungsdaten:</strong> Im Rahmen des Betriebs der Plattform werden
              Bestelldaten und Einstellungen der Restaurants gespeichert.
            </li>
            <li>
              <strong>Technische Daten:</strong> Beim Aufruf unserer Website werden
              automatisch Informationen vom Browser übermittelt (z. B. Browsertyp,
              Betriebssystem, Referrer-URL, IP-Adresse), die für den technischen Betrieb der
              Plattform erforderlich sind.
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-bold">4. Cookies</h4>
          <p>
            Unsere Website verwendet Cookies, um die Nutzung der Plattform zu ermöglichen
            und zu verbessern. Session-Cookies werden für den Login und die
            Bestellabwicklung zwingend benötigt. Sie können Cookies in Ihren
            Browser-Einstellungen deaktivieren; dies kann jedoch die Funktionalität der
            Plattform einschränken.
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-bold">5. Weitergabe von Daten</h4>
          <p>
            Eine Weitergabe Ihrer personenbezogenen Daten an Dritte erfolgt nur, soweit wir
            gesetzlich dazu verpflichtet sind oder Sie ausdrücklich eingewilligt haben.
            Bestelldaten werden ausschließlich im Rahmen der Vertragsabwicklung zwischen
            Restaurant und Gast verarbeitet.
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-bold">6. Ihre Rechte</h4>
          <p>
            Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und
            Einschränkung der Verarbeitung Ihrer gespeicherten personenbezogenen Daten.
            Anfragen richten Sie bitte an: E-Mail folgt.
          </p>
        </div>
      </div>
      <Link href="/" className="mt-10 text-sm text-zinc-400 underline hover:text-zinc-200">
        ← Zurück zur Startseite
      </Link>
    </main>
  );
}