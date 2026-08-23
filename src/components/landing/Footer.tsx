import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/4915228450561?text=Hallo%2C%20ich%20m%C3%B6chte%20digi-gastro%2014%20Tage%20gratis%20testen";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#050507] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-tight text-white">
              digi-<span className="text-amber-400">gastro</span>
            </Link>
            <p className="mt-4 max-w-sm text-zinc-400">
              Das Betriebssystem für die moderne Gastronomie. Digitale Speisekarte, NFC- &amp; QR-Bestellung,
              Küchen-Display und Wallet-Stempelkarte — aus Neuwied für ganz Deutschland.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              14 Tage gratis testen
            </a>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Produkt</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="#features" className="transition-colors hover:text-amber-400">Features</Link></li>
              <li><Link href="#demo" className="transition-colors hover:text-amber-400">Live-Demo</Link></li>
              <li><Link href="#how-it-works" className="transition-colors hover:text-amber-400">So funktioniert&apos;s</Link></li>
              <li><Link href="#faq" className="transition-colors hover:text-amber-400">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Rechtliches</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/impressum" className="transition-colors hover:text-amber-400">Impressum</Link></li>
              <li><Link href="/datenschutz" className="transition-colors hover:text-amber-400">Datenschutz</Link></li>
              <li><Link href="/login" className="transition-colors hover:text-amber-400">Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/5 pt-8 text-center text-sm text-zinc-500">
          © {currentYear} digi-gastro · Neuwied, Rheinland-Pfalz. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
