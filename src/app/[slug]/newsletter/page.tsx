import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAppleConfigured, isGoogleConfigured } from "@/lib/walletPass";
import NewsletterClient from "./newsletter-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  return { title: `${tenant?.name ?? slug} — Stempelkarte` };
}

export default async function NewsletterLandingPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) notFound();

  const card = await prisma.loyaltyCard.findFirst({
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

  return (
    <NewsletterClient
      slug={slug}
      tenantName={tenant.name}
      logo={tenant.logo_url || tenant.logo_path || null}
      card={card ?? null}
      appleConfigured={isAppleConfigured()}
      googleConfigured={isGoogleConfigured()}
    />
  );
}
