import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import DemoWidget from "@/components/landing/DemoWidget";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import SchemaMarkup from "@/components/landing/SchemaMarkup";
import ScrollReveal from "@/components/landing/ScrollReveal";
import ScrollVideo from "@/components/landing/ScrollVideo";

export const dynamic = "force-dynamic";

const WHATSAPP_URL = "https://wa.me/4915228450561?text=Hallo%2C%20ich%20m%C3%B6chte%20digi-gastro%2014%20Tage%20gratis%20testen";

export default async function LandingPage() {
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
      <main className="relative flex-1 text-white antialiased overflow-x-clip">
        {/* Fester Video-Hintergrund über die gesamte Seite:
            läuft scroll-synchron Frame-by-Frame mit (Footer = Sekunde 8),
            beim Hochscrollen läuft er rückwärts. */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <ScrollVideo
            src="https://res.cloudinary.com/bkgwgoqc/video/upload/v1787147124/Creating_logo_animation_202608191540_m6th87.mp4"
            poster="/hero-poster.png"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/55 via-[#050507]/35 to-[#050507]/85" />
        </div>

        <div className="relative z-10">
          <Navbar />
          <HeroSection />
          <SocialProof tenantCount={tenants.length} />
          <FeaturesGrid />
          <DemoWidget />
          <HowItWorks />
          <Testimonials />
          <FAQ />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Social Proof Section
// ─────────────────────────────────────────────────────────────────────────────
function SocialProof({ tenantCount }: { tenantCount: number }) {
  const stats = [
    { value: `${tenantCount}+`, label: "Aktive Restaurants" },
    { value: "24/7", label: "Bestellungen" },
    { value: "0%", label: "Provision" },
    { value: "DE", label: "Made in Germany" },
  ];

  return (
    <section className="relative border-y border-white/5 bg-[#0b0c10]/60 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400/80">
            Vertrauen von Gastronomen
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-12">
                {i > 0 && <div className="hidden h-12 w-px bg-white/10 sm:block" />}
                <div className="text-center">
                  <div className="text-4xl font-bold text-white md:text-5xl">{stat.value}</div>
                  <div className="mt-2 text-sm text-zinc-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Final CTA Section
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <ScrollReveal>
          <h2 className="text-4xl font-bold text-white md:text-6xl">
            Bereit für das <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Gastro-OS der Zukunft</span>?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Starte in 5 Minuten. Keine Kreditkarte nötig. Kein App-Download für Gäste. Keine Verträge.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-5 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              14 Tage gratis testen
            </a>
            <Link
              href="#features"
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-10 py-5 text-lg font-semibold text-white backdrop-blur-sm transition hover:scale-105 hover:border-amber-500/50 hover:bg-white/10"
            >
              Mehr erfahren
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
            <span>Keine App</span>
            <span>·</span>
            <span>Kein Setup</span>
            <span>·</span>
            <span>Jederzeit kündbar</span>
            <span>·</span>
            <span>GoBD-konform</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
