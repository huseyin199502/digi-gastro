"use client";

const WHATSAPP_URL =
  "https://wa.me/4915228450561?text=Hallo%2C%20ich%20m%C3%B6chte%20digi-gastro%2014%20Tage%20gratis%20testen";

const bullets = [
  "Keine App für Gäste",
  "0 % Provision",
  "Server in Deutschland",
  "GoBD-konform",
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.14)_0%,transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-10">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-400 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            Plug &amp; Play Gastro-OS
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
            Das Gastro-OS, das in{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              5 Minuten
            </span>{" "}
            live ist.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg lg:mx-0 mx-auto lg:max-w-lg">
            NFC- &amp; QR-Bestellung, Küchen-Display, Sitzplan, Personal, Lager
            und Loyalty — ein System statt fünf Tools. Ohne App, ohne Vendor-Lock-in.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:shadow-emerald-500/40 hover:brightness-110"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              14 Tage gratis testen
            </a>
            <a
              href="#features"
              className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:border-amber-500/50 hover:bg-white/10"
            >
              Alle Features
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-zinc-400 lg:justify-start">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Product mockup: Phone + floating KDS */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-b from-amber-500/15 via-transparent to-emerald-500/10 blur-2xl" />

          <div className="relative grid grid-cols-5 items-start gap-3">
            {/* Phone */}
            <div className="col-span-3 rounded-[1.75rem] border border-white/15 bg-[#0e1016] p-2 shadow-2xl shadow-black/60">
              <div className="rounded-[1.35rem] border border-white/5 bg-[#08090c] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Tisch</p>
                    <p className="text-sm font-bold text-white">Tisch 12 · Innen</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Live
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { n: "Cola Zero", p: "3,50 €", add: true },
                    { n: "Cheeseburger", p: "9,50 €" },
                    { n: "Halloumi Bowl", p: "12,90 €" },
                  ].map((item) => (
                    <div
                      key={item.n}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-white">{item.n}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-amber-400">{item.p}</span>
                        {item.add ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[13px] font-bold leading-none text-black">
                            +
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2 text-center text-[11px] font-bold text-black">
                  Bestellung senden · 13,00 €
                </div>
                <div className="mt-2 flex justify-center gap-3 text-[9px] text-zinc-500">
                  <span>Service rufen</span>
                  <span>·</span>
                  <span>Stempel sammeln</span>
                </div>
              </div>
            </div>

            {/* KDS card */}
            <div className="col-span-2 mt-8 rounded-2xl border border-amber-500/25 bg-[#11131a] p-3 shadow-xl shadow-black/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">KDS</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Echtzeit
                </span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
                  <div className="flex justify-between text-[10px] font-bold text-white">
                    <span>#1842</span>
                    <span className="text-amber-400">12s</span>
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-300">2× Cola · 1× Burger</p>
                  <span className="mt-1.5 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-300">
                    Zubereitung
                  </span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                  <div className="flex justify-between text-[10px] font-bold text-white">
                    <span>#1841</span>
                    <span className="text-emerald-400">✓</span>
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-400">1× Halloumi Bowl</p>
                </div>
              </div>
            </div>

            {/* Mini sitzplan chip */}
            <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[#11131a]/95 px-3 py-2 shadow-lg backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium text-zinc-300">
                3 Tische aktiv · 1 Service-Ruf
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
