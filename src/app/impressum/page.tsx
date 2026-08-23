import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Impressum — digi-gastro" };

export default function ImpressumPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">Impressum</h1>
      <div className="space-y-4 text-zinc-300">
        <div>
          <h4 className="mb-2 font-bold">Anbieterkennzeichnung gem. § 5 DDG</h4>
          <p>
            <strong>Mehmet Can Ipek</strong>
            <br />
            <em>(Vorgründungsphase)</em>
          </p>
        </div>
        <div>
          <p>
            <strong>Anschrift:</strong>
            <br />
            folgt
          </p>
        </div>
        <div>
          <p>
            <strong>Kontakt:</strong>
            <br />
            E-Mail: folgt
            <br />
            Telefon: folgt
          </p>
        </div>
        <div>
          <p>
            <strong>Umsatzsteuer-Identifikationsnummer gem. § 27a UStG:</strong>
            <br />
            folgt
          </p>
        </div>
        <div>
          <p>
            <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong>
            <br />
            Mehmet Can Ipek
            <br />
            Anschrift: folgt
          </p>
        </div>
        <p className="text-sm text-zinc-500">
          <em>
            Hinweis: Das Unternehmen befindet sich aktuell in der Vorgründungsphase. Die
            endgültigen Unternehmensdaten (Anschrift, Kontakt, Steuernummern, ggf.
            Handelsregistereintrag) werden nach Abschluss der Gründung an dieser Stelle
            nachgetragen.
          </em>
        </p>
      </div>
      <Link href="/" className="mt-10 text-sm text-zinc-400 underline hover:text-zinc-200">
        ← Zurück zur Startseite
      </Link>
    </main>
  );
}