import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import DemoWidget from "@/components/landing/DemoWidget";
import HowItWorks from "@/components/landing/HowItWorks";
import ProductShowcase from "@/components/landing/ProductShowcase";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import SchemaMarkup from "@/components/landing/SchemaMarkup";
import ScrollReveal from "@/components/landing/ScrollReveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "digi-gastro — Digitales Bestellsystem für Restaurants & Gastronomie",
  alternates: { canonical: "/" },
  description:
    "Gastro-OS in 5 Minuten live: NFC/QR-Bestellung, Küchen-Display, Sitzplan, Personal, Lager, Loyalty & GoBD. 0 % Provision, Server in Deutschland, 14 Tage gratis.",
};

const WHATSAPP_URL =
  "https://wa.me/4915228450561?text=Hallo%2C%20ich%20m%C3%B6chte%20digi-gastro%2014%20Tage%20gratis%20testen";

export default async function LandingPage() {
  const session = await getTenantSession();
  if (session) redirect(`/${session.slug}/admin`);

  const tenants = await prisma.tenant.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      logo_url: true,
      logo_path: true,
      ort: true,
      operating_mode: true,
      loyalty_enabled: true,
    },
  });

  return (
    <>
      <SchemaMarkup tenants={tenants} />
      <main className="relative flex-1 text-white antialiased">
        <div className="bg-[#050507]">
          <Navbar />
          <HeroSection />
          <StatsBar />
          <TrustBar />
          <PainSection />
          <ProductShowcase />
          <FeaturesGrid />
          <DemoWidget />
          <HowItWorks />
          <PricingTeaser />
          <Testimonials />
          <FAQ />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </>
  );
}

function StatsBar() {
  const stats = [
    {
      value: "5 Min",
      label: "Setup",
      hint: "Konto → live",
    },
    {
      value: "0 %",
      label: "Provision",
      hint: "100 % Umsatz bei dir",
    },
    {
      value: "<1 s",
      label: "bis Speisekarte",
      hint: "NFC oder QR",
    },
  ];

  return (
    <section className="border-b border-white/5 bg-[#050507] py-10">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-[#11131a] px-4 py-5 text-center shadow-lg shadow-black/20"
              >
                <dt className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                    {s.value}
                  </span>
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-200">{s.label}</dd>
                <p className="mt-0.5 text-xs text-zinc-500">{s.hint}</p>
              </div>
            ))}
          </dl>
        </ScrollReveal>
      </div>
    </section>
  );
}

function TrustBar() {
  const integrations = [
    "Lightspeed",
    "SumUp",
    "Tillhub",
    "HelloCash",
    "Apple Wallet",
    "Google Wallet",
    "CSV-Import",
  ];
  const values = [
    { title: "0 % Provision", text: "Du behältst jeden Euro Umsatz." },
    { title: "Server in Deutschland", text: "DSGVO-konform gehostet." },
    { title: "Keine App nötig", text: "Läuft im Browser jedes Smartphones." },
    { title: "Jederzeit kündbar", text: "Keine Mindestlaufzeit, kein Lock-in." },
  ];

  return (
    <section className="border-b border-white/5 bg-[#0b0c10] py-14">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-amber-400/80">
            Passt zu deiner Kasse — ohne neue Hardware
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {integrations.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-zinc-300 transition hover:border-amber-500/40 hover:text-white"
              >
                {name}
              </span>
            ))}
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <dt className="text-base font-semibold text-white">{v.title}</dt>
                <dd className="mt-1 text-sm text-zinc-400">{v.text}</dd>
              </div>
            ))}
          </dl>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PainSection() {
  const pains = [
    {
      title: "Chaos am Tisch",
      text: "Warten auf den Kellner, falsche Bestellungen, Streit beim Bezahlen — Gäste sind unzufrieden und das Team kommt nicht nach.",
      fix: "Gäste bestellen selbst per NFC/QR. Split-Pay erledigt den Rest.",
    },
    {
      title: "Zettel & Stempelkarten",
      text: "Papier-Stempel, verlorene Gutscheine, keine Daten über Stammgäste — Marketing passiert im Bauchgefühl.",
      fix: "Digitale Wallet-Karte, Push-Kampagnen, Gutscheine & Reviews automatisch.",
    },
    {
      title: "Bürokratie frisst Zeit",
      text: "Schichtpläne, Inventur, Steuerberater-Export, Kassa-Chaos — abends bleibt keine Zeit für den Betrieb.",
      fix: "Personal, Lager, Reports und GoBD-Audit in einem Cockpit.",
    },
  ];

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">
            Das Problem
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Gastro läuft. Deine Tools nicht.
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Die meisten Betriebe kleben Software aus fünf Systemen zusammen.
            digi-gastro ersetzt den Wust — vom ersten Tap bis zum Steuerberater.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pains.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 0.08}>
              <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-[#14161e] to-[#11131a] p-6 transition hover:border-red-500/25 hover:shadow-lg hover:shadow-red-500/5">
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-sm font-bold text-red-400 ring-1 ring-red-500/20">
                  !
                </span>
                <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{p.text}</p>
                <p className="mt-4 border-t border-white/10 pt-4 text-sm font-medium text-emerald-400">
                  {p.fix}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section id="preis" className="border-y border-white/5 bg-[#0b0c10] py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <ScrollReveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">
            Preis
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Fairer Flatrate-Preis. Keine Provision.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Keine versteckten Kosten pro Bestellung oder Gast. Du bekommst den
            passenden monatlichen Preis unverbindlich und sofort per WhatsApp —
            ohne Sales-Call und ohne Kreditkarte.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              { t: "0 % Provision", d: "100 % deines Umsatzes bleiben bei dir" },
              { t: "Kein Setup-Fee", d: "In 5 Minuten startklar" },
              { t: "Jederzeit kündbar", d: "Keine Mindestlaufzeit" },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#14161e] to-[#11131a] p-5 text-left shadow-lg shadow-black/20 transition hover:border-amber-500/30"
              >
                <div className="font-semibold text-white">{x.t}</div>
                <div className="mt-1 text-sm text-zinc-400">{x.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-emerald-400"
            >
              Preis erfragen &amp; 14 Tage gratis testen
            </a>
            <p className="mt-3 text-sm text-zinc-500">
              Antwort in der Regel in wenigen Minuten · unverbindlich
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(245,158,11,0.1)_0%,transparent_55%)]"
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            In 5 Minuten live —{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              ohne Beratungstermin
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
            Konto anlegen, Speisekarte importieren, QR ausdrucken — fertig. Keine
            App für Gäste, keine Hardware-Pflicht.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/bestellsystem-neuwied"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-amber-500/50 hover:bg-white/10"
            >
              Live in Neuwied ansehen
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110"
            >
              14 Tage gratis testen
            </a>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            Keine App · Kein Setup-Termin · Jederzeit kündbar · GoBD-konform
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
