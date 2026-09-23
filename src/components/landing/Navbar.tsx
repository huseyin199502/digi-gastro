"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const WHATSAPP_URL =
  "https://wa.me/4915228450561?text=Hallo%2C%20ich%20m%C3%B6chte%20digi-gastro%2014%20Tage%20gratis%20testen";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Demo" },
  { href: "#how-it-works", label: "So geht's" },
  { href: "#preis", label: "Preis" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
          scrolled
            ? "border-b border-white/5 bg-[#050507]/90 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            digi-<span className="text-amber-400">gastro</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-amber-400"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2.5 md:flex">
            <Link
              href="/login"
              className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-amber-500/40"
            >
              Login
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
            >
              14 Tage gratis
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white md:hidden"
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-[#050507]/97 backdrop-blur-xl md:hidden">
          <div className="flex min-h-full flex-col justify-center gap-1 px-6 pt-20 pb-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-lg font-semibold text-white hover:bg-white/5 hover:text-amber-400"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-emerald-500 px-6 py-3.5 text-center font-semibold text-white"
              >
                14 Tage gratis testen
              </a>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-center font-semibold text-white"
              >
                Restaurant-Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
