import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  getTenantMenu,
  TenantNotFoundError,
  TenantSuspendedError,
} from "@/lib/menu";
import {
  guestCookieName,
  isCookieSessionValid,
  parseActiveTableNum,
  parseGuestCookieValue,
  resolveTable,
} from "@/lib/guestSession";
import PlayClient from "./play-client";
import "../../digigastro/menu-0.css";
import "../../digigastro/menu-premium.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PlayPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  // ── Tisch-Session aus dem Guest-Cookie auflösen (identisch zur Speisekarte) ──
  const store = await cookies();
  const guestCookie = store.get(guestCookieName(slug))?.value ?? null;
  let table: string | null = null;
  let token: string | null = null;
  let isReadonly = true;
  if (guestCookie) {
    const parsed = parseGuestCookieValue(guestCookie);
    if (parsed) {
      const { num, zone } = parseActiveTableNum(parsed.table);
      let resolved = await resolveTable(slug, num, zone || null);
      if (!resolved && zone) resolved = await resolveTable(slug, num, null);
      if (resolved && (await isCookieSessionValid(slug, resolved, parsed.token))) {
        table = resolved.displayName;
        token = parsed.token;
        isReadonly = false;
      }
    }
  }

  let menu;
  try {
    menu = await getTenantMenu(slug);
  } catch (e) {
    if (e instanceof TenantNotFoundError) notFound();
    if (e instanceof TenantSuspendedError) {
      return (
        <main className="flex min-h-dvh items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Vorübergehend nicht verfügbar</h1>
            <p className="mt-2 text-zinc-400">Dieses Restaurant ist derzeit pausiert.</p>
          </div>
        </main>
      );
    }
    throw e;
  }

  const t = menu.tenant;
  const ordersEnabled =
    t.orders_enabled && t.operating_mode === "full" && !isReadonly && !!table;

  return (
    <PlayClient
      slug={slug}
      tenantName={t.name}
      logoUrl={t.logo_url ?? t.logo_url_2 ?? null}
      table={table}
      token={token}
      isShisha={t.is_shishabar}
      ordersEnabled={ordersEnabled}
      products={menu.products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.display_price,
        category: p.category,
        image: p.image,
        is_available: p.is_available,
      }))}
    />
  );
}
