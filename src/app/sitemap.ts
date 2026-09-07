import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://digi-gastro.de";
  const currentDate = new Date();

  // Statische Seiten
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/bestellsystem-neuwied`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/datenschutz`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Aktive Restaurant-Seiten (öffentliche Speisekarten)
  let tenantEntries: MetadataRoute.Sitemap = [];
  try {
    const tenants = await prisma.tenant.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { slug: true },
    });
    tenantEntries = tenants.map((t) => ({
      url: `${baseUrl}/${t.slug}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch {
    // DB nicht erreichbar → Sitemap nur mit statischen Seiten ausliefern
  }

  return [...staticEntries, ...tenantEntries];
}
