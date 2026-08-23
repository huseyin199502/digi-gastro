import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy GET /admin/products/export-csv (main.py 8654)
// Semikolon-CSV mit UTF-8-BOM; im Netto-Modus wird der Nettopreis exportiert.
export async function GET() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { price_mode: true },
    });
    const priceMode = tenant?.price_mode ?? "brutto";

    const products = await prisma.product.findMany({
      where: { tenant_slug: slug },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });

    const csvField = (v: unknown): string => {
      const s = String(v ?? "");
      if (/[;"\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines: string[] = [];
    lines.push(
      [
        "id", "name", "price", "category", "category_type",
        "description", "image", "is_vegan", "is_glutenfree",
        "is_available", "allergens",
      ].join(";")
    );

    for (const p of products) {
      let allergensStr = "";
      try {
        const parsed = p.allergens ? JSON.parse(p.allergens) : [];
        if (Array.isArray(parsed)) allergensStr = parsed.join(", ");
      } catch {
        allergensStr = "";
      }

      // Convert price to netto if tenant price_mode == netto
      let exportPrice = p.price;
      if (priceMode === "netto") {
        const catType = (p.category_type ?? "küche").toLowerCase();
        const mwstDivisor = catType === "bar" ? 1.19 : 1.07;
        exportPrice = Math.round((exportPrice / mwstDivisor) * 100) / 100;
      }

      lines.push(
        [
          csvField(p.id),
          csvField(p.name),
          csvField(exportPrice.toFixed(2).replace(".", ",")),
          csvField(p.category),
          csvField(p.category_type ?? "küche"),
          csvField(p.description ?? ""),
          csvField(p.image ?? ""),
          csvField(p.is_vegan || p.vegan ? "true" : "false"),
          csvField(p.is_glutenfree ? "true" : "false"),
          csvField(p.is_available ?? true ? "true" : "false"),
          csvField(allergensStr),
        ].join(";")
      );
    }

    // utf-8-sig wie im Legacy (BOM für Excel-Kompatibilität)
    const body = Buffer.concat([
      Buffer.from([0xef, 0xbb, 0xbf]),
      Buffer.from(lines.join("\r\n") + "\r\n", "utf-8"),
    ]);
    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=speisekarte_${slug}.csv`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
