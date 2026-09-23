import Link from "next/link";

const WHATSAPP_URL =
  "https://wa.me/4915228450561?text=Hallo%2C%20ich%20m%C3%B6chte%20digi-gastro%2014%20Tage%20gratis%20testen";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#050507] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              digi-<span className="text-amber-400">gastro</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-zinc-400">
              Das Betriebssystem für die moderne Gastronomie. Digitale Speisekarte,
              NFC- &amp; QR-Bestellung, KDS und Wallet-Stempelkarte — aus Neuwied
              für ganz Deutschland.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3.5 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/25"
            >
              14 Tage gratis testen
            </a>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Produkt</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="#features" className="hover:text-amber-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-amber-400">
                  Live-Demo
                </Link>
              </li>
              <li>
                <Link href="#preis" className="hover:text-amber-400">
                  Preis
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-amber-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/bestellsystem-neuwied" className="hover:text-amber-400">
                  Bestellsystem Neuwied
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Rechtliches</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/impressum" className="hover:text-amber-400">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-amber-400">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-center text-sm text-zinc-500">
          © {currentYear} digi-gastro · Neuwied, Rheinland-Pfalz. Alle Rechte
          vorbehalten.
        </div>
      </div>
    </footer>
  );
}
