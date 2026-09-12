import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPlatformSession } from "@/lib/auth";
import AdminPanel from "./admin-panel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plattform-Administration" };

export default async function PlatformAdminPage() {
  const authorized = await getPlatformSession();
  if (!authorized) redirect("/login");

  const [tenants, announcements] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        email: true,
        active: true,
        orders_enabled: true,
        loyalty_enabled: true,
        chat_enabled: true,
        enabled_features: true,
        show_revenue: true,
        operating_mode: true,
        tier: true,
        tagesumsatz: true,
        bestellungen_gesamt: true,
        is_setup_completed: true,
        _count: {
          select: { products: true, orders: true, loyaltyCustomers: true },
        },
      },
    }),
    prisma.announcement.findMany({
      orderBy: [{ position: "asc" }, { id: "desc" }],
    }),
  ]);

  // Play-World-Onboarding (einmal pro Gerät im Tenant-Dashboard).
  await prisma.announcement.upsert({
    where: { key: "play_world" },
    update: {},
    create: {
      key: "play_world",
      title: "Play World ist für Sie aktiviert 🎮",
      body:
        "Wir haben Play World für Sie freigeschaltet – exklusiv bei digi-gastro! Kein anderes Bestellsystem hat das. " +
        "Ihre Gäste spielen direkt im Browser: Kart-Rennen, Mensch ärgere dich nicht, Quiz Show, Bingo, Würfel-Poker und Lügen-Dice – " +
        "allein gegen Bots oder gemeinsam an mehreren Tischen (einfach Raum-Code teilen). Alles ist fürs Handy optimiert. " +
        "Play World lässt sich im Plattform-Admin pro Restaurant an- und ausschalten.",
      icon: "sports_esports",
      is_active: true,
      position: 0,
    },
  });

  return (
    <main className="flex-1">
      <header className="border-b border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-xl font-bold">
            digi-gastro <span className="text-amber-400">Plattform-Admin</span>
          </h1>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-500"
          >
            Zurück
          </Link>
        </div>
      </header>

      <AdminPanel tenants={tenants} announcements={announcements} />
    </main>
  );
}
