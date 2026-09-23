"use client";

import { useState, useCallback } from "react";
import ScrollReveal from "./ScrollReveal";

type DemoStep = "idle" | "added" | "sent" | "kitchen" | "served";

const STEPS: Record<DemoStep, string> = {
  idle: "Tippe auf das + neben der Cola, um sie in den Warenkorb zu legen.",
  added: "Super! Klicke jetzt auf »Bestellung senden«.",
  sent: "Die Bestellung fliegt in Echtzeit zum Küchen-Display…",
  kitchen: "Angekommen! Die Küche bereitet die Bestellung vor.",
  served: "Serviert! Die Demo ist abgeschlossen.",
};

export default function DemoWidget() {
  const [step, setStep] = useState<DemoStep>("idle");
  const [cartCount, setCartCount] = useState(0);

  const addToCart = useCallback(() => {
    if (step !== "idle" && step !== "added") return;
    setCartCount((c) => c + 1);
    setStep("added");
  }, [step]);

  const sendOrder = useCallback(() => {
    if (step !== "added" || cartCount === 0) return;
    setStep("sent");
    setTimeout(() => setStep("kitchen"), 1200);
    setTimeout(() => setStep("served"), 2800);
  }, [step, cartCount]);

  const reset = useCallback(() => {
    setStep("idle");
    setCartCount(0);
  }, []);

  const total = (cartCount * 3.5).toFixed(2).replace(".", ",");

  return (
    <section id="demo" className="scroll-mt-24 border-y border-white/5 bg-[#0b0c10] py-20 sm:py-24">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <ScrollReveal className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">
            Interaktive Simulation
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            So fühlt sich digi-gastro an
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Vom Gast-Tap bis zum Küchen-Display — in unter 2 Sekunden. Probiere es aus.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative w-[280px] rounded-[2.5rem] border-4 border-zinc-700 bg-[#11131a] p-3 shadow-2xl shadow-black/50">
                <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-zinc-800" />
                <div className="mt-6 rounded-2xl bg-[#0b0c10] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">Tisch</p>
                      <p className="text-lg font-bold text-white">Tisch 1</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                      <div>
                        <p className="text-sm font-medium text-white">Coca Cola Zero</p>
                        <p className="text-xs text-zinc-500">0,33 L</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-amber-400">3,50 €</span>
                        <button
                          onClick={addToCart}
                          disabled={step === "sent" || step === "kitchen" || step === "served"}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-black font-bold text-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-40"
                          aria-label="Cola in den Warenkorb"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 opacity-50">
                      <div>
                        <p className="text-sm font-medium text-white">Premium Cheeseburger</p>
                        <p className="text-xs text-zinc-500">mit Pommes</p>
                      </div>
                      <span className="text-sm font-semibold text-zinc-400">9,50 €</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <button
                      onClick={sendOrder}
                      disabled={step !== "added"}
                      className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                        step === "added"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]"
                          : step === "sent" || step === "kitchen" || step === "served"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-zinc-500"
                      }`}
                    >
                      {step === "idle" && "Warenkorb leer"}
                      {step === "added" && `Bestellung senden (${total} €)`}
                      {(step === "sent" || step === "kitchen" || step === "served") && "Gesendet ✓"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KDS Monitor */}
            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11131a] p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                    Küchen-Monitor (KDS)
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Echtzeit
                  </span>
                </div>

                <div className="min-h-[120px] space-y-3">
                  {(step === "kitchen" || step === "served") && (
                    <div className="animate-[fadeIn_0.5s_ease-out] rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">Tisch 1</span>
                        <span className="text-xs text-zinc-500">gerade eben</span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-300">
                        {cartCount}× Coca Cola Zero
                      </p>
                      <span
                        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          step === "served"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {step === "served" ? "Serviert ✓" : "In Zubereitung"}
                      </span>
                    </div>
                  )}
                  {step === "sent" && (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                    </div>
                  )}
                  {(step === "idle" || step === "added") && (
                    <div className="flex items-center justify-center py-8 text-sm text-zinc-600">
                      Bestellungen erscheinen hier in Echtzeit
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="mb-3 min-h-[2.5rem] text-sm text-zinc-400">{STEPS[step]}</p>
                {step === "served" && (
                  <button
                    onClick={reset}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-400"
                  >
                    Simulation zurücksetzen
                  </button>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
