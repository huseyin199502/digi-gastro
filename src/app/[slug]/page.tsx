import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import {
  guestCookieName,
  isCookieSessionValid,
  parseActiveTableNum,
  parseGuestCookieValue,
  resolveTable,
} from "@/lib/guestSession";
import {
  getTenantMenu,
  TenantNotFoundError,
  TenantSuspendedError,
} from "@/lib/menu";
import { MenuClient } from "./menu-client";
import RestaurantJsonLd from "@/components/RestaurantJsonLd";
import "../digigastro/menu-0.css";
import "../digigastro/menu-premium.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const menu = await getTenantMenu(slug);
    const t = menu.tenant;
    const ort = t.ort ? ` in ${t.ort}` : "";
    const beschreibung = t.orders_enabled
      ? `${t.name}${ort}: Speisekarte digital ansehen und direkt am Tisch bestellen — ohne App-Download. Gekocht von digi-gastro.`
      : `${t.name}${ort}: Digitale Speisekarte — ansehen, entdecken, wiederkommen. Gekocht von digi-gastro.`;
    return {
      title: `${t.name}${ort} — Speisekarte`,
      description: beschreibung,
      alternates: { canonical: `/${slug}` },
      openGraph: {
        title: `${t.name}${ort}`,
        description: beschreibung,
        url: `/${slug}`,
        locale: "de_DE",
        type: "website",
        ...(t.logo_url ? { images: [{ url: t.logo_url, alt: t.name }] } : {}),
      },
    };
  } catch {
    return {
      title: "Speisekarte",
      robots: { index: false },
    };
  }
}

function strParam(
  v: string | string[] | undefined
): string | null {
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}

export default async function TenantMenuPage({ params, searchParams }: Props) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();
  const sp = await searchParams;

  // Öffentliche Basis-URL hinter Reverse-Proxy. Priorität:
  // PUBLIC_BASE_URL (env) → X-Forwarded-*-Header → Host-Header.
  // (Ohne dies baut redirect() die URL aus dem internen Host → 0.0.0.0:3000.)
  const _h = await headers();
  const envBase = (process.env.PUBLIC_BASE_URL ?? "").trim();
  const pubHost = _h.get("x-forwarded-host") ?? _h.get("host") ?? "";
  const pubProto = _h.get("x-forwarded-proto") ?? (pubHost.includes("localhost") ? "http" : "https");
  const pubBase = envBase || (pubHost ? `${pubProto}://${pubHost}` : "");

  const qTable = strParam(sp.table ?? sp.tisch ?? sp.t);
  const qToken = strParam(sp.token ?? sp.tk);
  const qZone = strParam(sp.z);
  const roleParam = strParam(sp.role) ?? "";
  const previewParam = strParam(sp.preview) === "true";

  // ── QR-scan flow: delegate to the cookie-setting handler ──
  if (qTable && qToken) {
    const qs = new URLSearchParams();
    qs.set("table", qTable);
    qs.set("token", qToken);
    if (qZone) qs.set("z", qZone);
    if (roleParam) qs.set("role", roleParam);
    redirect(`${pubBase}/${slug}/start-session?${qs.toString()}`);
  }

  const store = await cookies();
  const guestCookie = store.get(guestCookieName(slug))?.value ?? null;
  const session = await getTenantSession(store);

  // ── Admin preview bypass (legacy main.py ~5355-5372) ──
  const isChef = Boolean(session && session.slug === slug && session.role === "chef");
  let isPreview = false;
  if (previewParam && isChef) {
    isPreview = true;
  } else if (!previewParam && isChef && !qTable && !guestCookie) {
    isPreview = true;
  }

  // ── Session resolution (legacy main.py ~5373-5534) ──
  let table: string | null = null;
  let token: string | null = null;
  let isReadonly = true;

  if (isPreview) {
    isReadonly = false;
    table = "Vorschau";
    token = "preview";
  } else if (guestCookie) {
    const parsed = parseGuestCookieValue(guestCookie);
    if (parsed) {
      const { num, zone } = parseActiveTableNum(parsed.table);
      let resolved = await resolveTable(slug, num, zone || null);
      if (!resolved && zone) resolved = await resolveTable(slug, num, null);
      if (resolved && (await isCookieSessionValid(slug, resolved, parsed.token))) {
        table = resolved.displayName;
        token = parsed.token;
        isReadonly = false;
      } else {
        redirect(`${pubBase}/${slug}/sitz-expired`);
      }
    }
  }

  // Staff role mapping for the in-menu admin drawer / dashboard button
  // (query-param role wins — legacy passes ?role= through).
  let role = roleParam;
  if (!role && session && session.slug === slug) {
    if (session.role === "chef") role = "admin";
    else if (session.role === "kellner") role = "waiter";
  }

  // ── operating_mode "stempelkarte_only": Gäste → Standalone-Stempelkarten-Seite
  // (legacy main.py ~5336). Admin/Kellner dürfen weiterhin die Speisekarte sehen.
  const tenantMeta = await prisma.tenant.findUnique({
    where: { slug },
    select: { operating_mode: true, chat_enabled: true, orders_enabled: true, enabled_features: true },
  });
  if (
    tenantMeta?.operating_mode === "stempelkarte_only" &&
    role !== "admin" &&
    role !== "waiter" &&
    role !== "kellner" &&
    !isPreview
  ) {
    redirect(`${pubBase}/${slug}/newsletter`);
  }

  // ── Load menu data ──
  let menu;
  try {
    menu = await getTenantMenu(slug);
  } catch (e) {
    if (e instanceof TenantNotFoundError) notFound();
    if (e instanceof TenantSuspendedError) {
      return (
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-lg font-bold sm:text-xl lg:text-2xl">Vorübergehend nicht verfügbar</h1>
            <p className="mt-2 text-zinc-400">
              Dieses Restaurant ist derzeit pausiert.
            </p>
          </div>
        </main>
      );
    }
    throw e;
  }

  const t = menu.tenant;
  const ordersEnabled =
    t.orders_enabled && t.operating_mode === "full" && !isReadonly && !!table;

  // Play World: nur mit aktivem Bestellsystem und ohne "play_off"-Marker.
  const features: string[] = (() => {
    try {
      const v = JSON.parse(tenantMeta?.enabled_features ?? "[]");
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  })();
  const ordersFeatureEnabled = t.orders_enabled && t.operating_mode === "full";
  const playWorldEnabled = ordersFeatureEnabled && !features.includes("play_off");

  const tischName = table
    ? table === "Vorschau"
      ? "Vorschau"
      : table
    : "";

const jsonLdData = {
    name: t.name,
    slug,
    address: t.address && t.ort
      ? { street: t.address, city: t.ort, postalCode: t.plz ?? undefined, country: "DE" }
      : undefined,
    telephone: undefined,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://digi-gastro.de"}/${slug}`,
    logo: t.logo_url || undefined,
    image: t.logo_url || undefined,
    priceRange: "€€",
    servesCuisine: ["International"],
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://digi-gastro.de",
  };

  return (
    <>
      <RestaurantJsonLd {...jsonLdData} />
      <MenuClient
        slug={slug}
        menu={menu}
        table={table}
        token={token}
        isReadonly={isReadonly}
        role={role}
        tischName={tischName}
        ordersEnabled={ordersEnabled}
        chatEnabled={tenantMeta?.chat_enabled ?? false}
        playWorldEnabled={playWorldEnabled}
        ordersFeatureEnabled={ordersFeatureEnabled}
      />
    </>
  );
}
