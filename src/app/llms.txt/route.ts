export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://digi-gastro.de";

const CONTENT = `# digi-gastro

> Digitales Bestellsystem und Gastro-Betriebssystem für Restaurants, Shisha-Bars und Cafés in Deutschland.
> QR-Code- und NFC-Bestellung am Tisch ohne App-Download, digitale Speisekarte, Küchen-Display (KDS),
> Wallet-Stempelkarte für Apple & Google Wallet, Gast-Chats, Sitzplan-Verwaltung mit Tisch-Zusammenlegung,
> Teilzahlung und Event-/Happy-Hour-Preisen. Monatlicher Festpreis, keine Provision pro Bestellung,
> keine Einrichtungsgebühr, in unter 30 Minuten live.

## Product / Kernfunktionen

- [Startseite](${BASE_URL}/): Übersicht, Feature-Vergleich, Demo-Speisekarte und 14-Tage-Testzugang
- [Bestellsystem Neuwied](${BASE_URL}/bestellsystem-neuwied): Lokale Landingpage mit Preis-, Eignungs- und GoBD-FAQ

## Besonderheiten gegenüber anderen Bestellsystemen

- Stempelkarte direkt in Apple Wallet & Google Wallet — ohne eigene App
- Werbe-Modul: Gastronomiebetriebe verkaufen Werbeflächen in ihrer Speisekarte und verdienen mit
- Betriebsmodi: vollständig (Bestellung), menu_only (nur digitale Speisekarte), stempelkarte_only (nur Loyalty)
- GoBD-Unterstützung: manipulationssicheres Audit-Log, Stornos nur mit Mitarbeiter-PIN, PDF-/Excel-Export
- Betreibtisch-Cockpit: Tische zusammenlegen, Bestellungen übertragen, Einzelpositionen stornieren oder teilen

## Contact

- WhatsApp: https://wa.me/4915228450561
- Website: ${BASE_URL}
- Impressum: ${BASE_URL}/impressum
`;

export function GET() {
  return new Response(CONTENT, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
