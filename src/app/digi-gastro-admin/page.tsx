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
