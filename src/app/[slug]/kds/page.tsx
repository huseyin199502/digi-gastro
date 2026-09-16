import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import KdsClient from "./kds-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "KDS – Küchen-Display" };

interface Props {
  params: Promise<{ slug: string }>;
}

// Eigenständige KDS-Ansicht (Küchen-/Bar-Display). Zeigt live nur die
// Bestellungen der im Admin-Tab „KDS" markierten Hauptgruppen sowie
// Kohle-Nachbestell-Rufe. Servieren läuft über denselben Endpoint wie im
// Live-Tab → Status bleibt synchron. Bezahlte Bestellungen verschwinden,
// weil /api/tablet-status nur aktive Orders liefert.
export default async function KdsPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  const session = await getTenantSession();
  if (!session || session.slug !== slug) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) redirect("/login");

  const [dbSuperGroups, dbCategories, dbProducts] = await Promise.all([
    prisma.superGroup.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),
    prisma.category.findMany({ where: { tenant_slug: slug } }),
    prisma.product.findMany({
      where: { tenant_slug: slug },
      select: { id: true, category: true },
    }),
  ]);

  let visibleSuperGroupIds: number[] = [];
  try {
    const parsed = JSON.parse(tenant.kds_super_group_ids || "[]");
    if (Array.isArray(parsed)) {
      visibleSuperGroupIds = parsed
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n));
    }
  } catch {
    visibleSuperGroupIds = [];
  }

  let serviceTypes: string[] = ["kohle"];
  try {
    const parsed = JSON.parse(tenant.kds_service_types || '["kohle"]');
    if (Array.isArray(parsed)) {
      serviceTypes = parsed.map((v) => String(v));
    }
  } catch {
    serviceTypes = ["kohle"];
  }

  // Kategorie → Hauptgruppe, dann alle Produkte ermitteln, deren Kategorie
  // zu einer sichtbaren Hauptgruppe gehört (darüber wird später gefiltert).
  const catToSuperGroup = new Map<string, number | null>();
  for (const c of dbCategories) {
    catToSuperGroup.set(c.name, c.super_group_id ?? null);
  }
  const visibleSet = new Set(visibleSuperGroupIds);
  const visibleProductIds: number[] = [];
  for (const p of dbProducts) {
    const sg = catToSuperGroup.get(p.category) ?? null;
    if (sg !== null && visibleSet.has(sg)) visibleProductIds.push(p.id);
  }

  const superGroups = dbSuperGroups.map((sg) => ({
    id: sg.id,
    name: sg.name,
    color: sg.color || "#374151",
    icon: sg.icon || "",
  }));

  return (
    <KdsClient
      slug={slug}
      tenantName={tenant.name}
      enabled={tenant.kds_enabled === true}
      visibleSuperGroupIds={visibleSuperGroupIds}
      visibleProductIds={visibleProductIds}
      serviceTypes={serviceTypes}
      superGroups={superGroups}
    />
  );
}
