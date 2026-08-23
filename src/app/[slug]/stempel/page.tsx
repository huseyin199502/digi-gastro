import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import ScannerClient from "./scanner-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  return { title: `Stempel — ${tenant?.name ?? slug}` };
}

export default async function LoyaltyScannerPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  // SECURITY: nur eingeloggte Chef/Kellner dürfen Stempel vergeben
  const session = await getTenantSession();
  if (!session || session.slug !== slug) {
    redirect(`/login?redirect=stempel`);
  }
  if (session.role !== "chef" && session.role !== "kellner") {
    notFound();
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  const cards = await prisma.loyaltyCard.findMany({
    where: { tenant_slug: slug, is_active: true },
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      stamps_required: true,
      reward_name: true,
      color_hex: true,
      icon: true,
    },
  });

  if (cards.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-xl font-bold">Keine Stempelkarte aktiv</h2>
          <p className="mt-2 text-zinc-400">
            Dieser Betrieb hat noch keine digitale Stempelkarte eingerichtet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <ScannerClient
      slug={slug}
      tenantName={tenant.name}
      logo={tenant.logo_url || tenant.logo_path || null}
    />
  );
}
