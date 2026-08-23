"use client";

const WHATSAPP_URL = "https://wa.me/4915228450561?text=Hallo%2C%20ich%20m%C3%B6chte%20digi-gastro%2014%20Tage%20gratis%20testen";

export default function HeroSection() {
  return (
    // Das eigentliche Video liegt als feste Hintergrund-Ebene hinter der
    // gesamten Seite (siehe page.tsx) und läuft scroll-synchron mit —
    // hier steht nur noch der Inhalt.
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-20">
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          Plug &amp; Play Gastro-OS
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
          Das Gastro-OS, das in{" "}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            5 Minuten live
          </span>{" "}
          ist.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300 sm:text-xl">
          Ohne App. Ohne Beratung. Ohne Vendor-Lock-in. Gäste bestellen per NFC oder QR — Umsatz steigt, Stress sinkt. GoBD-sicher, Kassen-Anbindung, Shisha-Modus.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-emerald-500/40"
          >
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            14 Tage gratis testen
          </a>
          <a
            href="#features"
            className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-amber-500/50 hover:bg-white/10"
          >
            Features entdecken
          </a>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Keine App
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            GoBD-konform
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Server in Deutschland
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Jederzeit kündbar
          </span>
        </div>

        {/* Scroll-Hinweis: Video läuft per Scroll mit */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500">
          <span className="text-[11px] font-bold uppercase tracking-widest">Scrollen</span>
          <span className="material-symbols-outlined animate-bounce text-xl">keyboard_double_arrow_down</span>
        </div>
      </div>
    </section>
  );
}
