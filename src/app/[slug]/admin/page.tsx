import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import AdminClient from "./admin-client";
import type {
  AdminCategory,
  AdminEvent,
  AdminInitial,
  AdminProduct,
  TenantSettings,
} from "./admin-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin-Dashboard" };

interface Props {
  params: Promise<{ slug: string }>;
}

function parseJsonList(raw: string | null | undefined, fallback: unknown[]): unknown[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export default async function TenantAdminPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  const session = await getTenantSession();
  if (!session || session.slug !== slug) {
    redirect("/login");
  }
  const isChef = session.role === "chef";

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) redirect("/login");

  const [dbProducts, dbCategories, dbEvents, dbSuperGroups] = await Promise.all([
    prisma.product.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),
    prisma.category.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),
    prisma.event.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),
    prisma.superGroup.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),
  ]);

  const products: AdminProduct[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description ?? "",
    image: p.image ?? "",
    vegan: Boolean(p.vegan || p.is_vegan),
    is_vegan: Boolean(p.is_vegan),
    is_glutenfree: Boolean(p.is_glutenfree),
    allergens: parseJsonList(p.allergens, []).map(String),
    category_type: p.category_type ?? null,
    category: p.category,
    is_available: p.is_available !== false,
    happy_hour_price: p.happy_hour_price ?? null,
    start_time: p.start_time ?? null,
    end_time: p.end_time ?? null,
    name_en: p.name_en ?? "",
    description_en: p.description_en ?? "",
    related_product_ids: parseJsonList(p.related_product_ids, []).map(Number),
    extras: (() => {
      try {
        const parsed = JSON.parse(p.extras || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
    variants: (() => {
      try {
        const parsed = JSON.parse(p.variants || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
  }));

  const categories: AdminCategory[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    position: c.position ?? null,
    super_group_id: c.super_group_id ?? null,
    extras: c.extras ?? null,
  }));

  const events: AdminEvent[] = dbEvents.map((e) => ({
    id: e.id,
    name: e.name,
    display_name: e.display_name,
    description: e.description ?? "",
    days: parseJsonList(e.days, []).map(String),
    start_time: e.start_time ?? null,
    end_time: e.end_time ?? null,
    mode: e.mode ?? null,
    discount: e.discount ?? null,
    is_active: e.is_active ?? null,
    banner_color: e.banner_color ?? "#dc2626",
    position: e.position ?? null,
  }));

  const superGroups = dbSuperGroups.map((sg) => ({
    id: sg.id,
    name: sg.name,
    color: sg.color || "#374151",
    icon: sg.icon || "",
  }));

  const settings: TenantSettings = {
    address: tenant.address ?? "",
    plz: tenant.plz ?? "",
    ort: tenant.ort ?? "",
    owner_name: isChef ? (tenant.owner_name ?? "") : "",
    owner_street: isChef ? (tenant.owner_street ?? "") : "",
    owner_email: isChef ? (tenant.owner_email ?? "") : "",
    owner_phone: isChef ? (tenant.owner_phone ?? "") : "",
    instagram: tenant.instagram ?? "",
    facebook: tenant.facebook ?? "",
    tiktok: tenant.tiktok ?? "",
    theme: tenant.theme ?? "dark",
    logo_url: tenant.logo_url ?? "",
    logo_url_2: tenant.logo_url_2 ?? "",
    accepts_card_payment: tenant.accepts_card_payment !== false,
    pos_system: tenant.pos_system ?? "none",
    pos_api_url: isChef ? (tenant.pos_api_url ?? "") : "",
    pos_api_key: isChef ? (tenant.pos_api_key ?? "") : "",
    pos_api_secret: isChef ? (tenant.pos_api_secret ?? "") : "",
    pos_location_id: isChef ? (tenant.pos_location_id ?? "") : "",
    pos_active: tenant.pos_active ?? null,
    show_revenue: tenant.show_revenue ?? null,
    is_shishabar: tenant.is_shishabar === true,
  };

  const initial: AdminInitial = {
    slug,
    tenantName: tenant.name,
    sessionName: session.name,
    role: session.role,
    isOwner: session.isOwner,
    products,
    categories,
    events,
    settings,
    superGroups,
    chatEnabled: tenant.chat_enabled === true,
    kdsEnabled: tenant.kds_enabled === true,
    kdsSuperGroupIds: (() => {
      try {
        const parsed = JSON.parse(tenant.kds_super_group_ids || "[]");
        return Array.isArray(parsed)
          ? parsed.map((v) => Number(v)).filter((n) => Number.isFinite(n))
          : [];
      } catch {
        return [];
      }
    })(),
    kdsServiceTypes: (() => {
      try {
        const parsed = JSON.parse(tenant.kds_service_types || '["kohle"]');
        return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
      } catch {
        return [];
      }
    })(),
  };

  return <AdminClient initial={initial} />;
}
