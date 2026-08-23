import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTenantSession, safeEqual } from "@/lib/auth";
import { errorResponse } from "@/lib/adminApi";
import { getActiveTenant, parseActiveTableNum } from "@/lib/tabletOps";

export const dynamic = "force-dynamic";

// Legacy GET /api/{slug}/check-session (main.py ~9196)
// Prüft ob die aktuelle Geräte-/Gast-Session noch gültig ist.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.toLowerCase().trim();
    const tenant = await getActiveTenant(slug);

    const store = await cookies();

    // ── Staff / POS trusted device bypass ──
    const posCookie = store.get(`pos_token_${slug}`)?.value;
    let isStaff = Boolean(
      posCookie && tenant.pos_token && safeEqual(posCookie, tenant.pos_token)
    );
    if (!isStaff) {
      const session = await getTenantSession(store);
      if (
        session &&
        session.slug === slug &&
        (session.role === "chef" || session.role === "kellner")
      ) {
        isStaff = true;
      }
    }
    if (isStaff) {
      return NextResponse.json({ active: true });
    }

    const sessionVal = store.get(`guest_session_${slug}`)?.value;
    if (!sessionVal) {
      return NextResponse.json({ active: false });
    }
    const idx = sessionVal.indexOf(":");
    if (idx === -1) {
      return NextResponse.json({ active: false });
    }
    const activeTableNum = sessionVal.slice(0, idx).trim();
    const activeToken = sessionVal.slice(idx + 1);

    const { num: cleanNum, zone: cleanZone } =
      parseActiveTableNum(activeTableNum);
    const tablesList = await prisma.table.findMany({
      where: { tenant_slug: slug },
      orderBy: { id: "asc" },
    });
    let dbTable = cleanZone
      ? tablesList.find(
          (t) => String(t.number) === cleanNum && t.zone === cleanZone
        )
      : undefined;
    if (!dbTable) {
      dbTable = tablesList.find((t) => String(t.number) === cleanNum);
    }
    const activeSessionTok = dbTable?.active_session_token ?? null;

    // Security: nur active_session_token validiert eine Gast-Session
    const isTokenValid = Boolean(
      activeToken && activeSessionTok && activeToken === activeSessionTok
    );
    return NextResponse.json({ active: isTokenValid });
  } catch (err) {
    return errorResponse(err);
  }
}
