"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const WHATSAPP_URL = "https://wa.me/4915228450561?text=Hallo%2C%20ich%20m%C3%B6chte%20digi-gastro%2014%20Tage%20gratis%20testen";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#demo", label: "Live-Demo" },
    { href: "#how-it-works", label: "So funktioniert's" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#050507]/80 backdrop-blur-xl border-b border-white/5 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              digi-<span className="text-amber-400">gastro</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-zinc-300 transition-colors hover:text-amber-400">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              14 Tage gratis
            </a>
            <Link
              href="/login"
              className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-amber-400"
            >
              Restaurant-Login
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white md:hidden"
            aria-label="Menü öffnen"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-[#050507]/95 backdrop-blur-xl md:hidden">
          <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 py-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-semibold text-white transition-colors hover:text-amber-400"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-8 py-4 text-center text-lg font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
              >
                14 Tage gratis testen
              </a>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-amber-500 px-8 py-4 text-center text-lg font-semibold text-black transition-all hover:bg-amber-400"
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
