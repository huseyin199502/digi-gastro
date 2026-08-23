import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse, parseFormBool, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

const MAX_CSV_UPLOAD_BYTES = 10 * 1024 * 1024;

// Legacy POST /admin/products/import-csv (main.py 8704)
export async function POST(request: NextRequest) {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const form = await request.formData();
    const overwrite = parseFormBool(form.get("overwrite"));
    const file = form.get("csv_file");
    if (!(file instanceof File)) {
      throw new ApiError("Validation error", 422);
    }
    if (file.size > MAX_CSV_UPLOAD_BYTES) {
      throw new ApiError("Datei ist zu groß (max. 10 MB).", 400);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    let csvText: string;
    try {
      csvText = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      try {
        csvText = new TextDecoder("latin1").decode(bytes);
      } catch {
        throw new ApiError(
          "Ungültiges Dateiformat. Bitte nutzen Sie UTF-8.",
          400
        );
      }
    }
    // BOM entfernen (utf-8-sig)
    if (csvText.charCodeAt(0) === 0xfeff) csvText = csvText.slice(1);

    const lines = csvText.split(/\r?\n/);
    const firstLine = lines[0] ?? "";
    let delimiter = ";";
    if (firstLine.includes(",") && !firstLine.includes(";")) {
      delimiter = ",";
    } else if (firstLine.includes(",") && firstLine.includes(";")) {
      if (firstLine.split(",").length > firstLine.split(";").length) {
        delimiter = ",";
      }
    }

    const parseLine = (line: string): string[] => {
      const out: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
          if (ch === '"') {
            if (line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            cur += ch;
          }
        } else if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          out.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out;
    };

    const header = parseLine(firstLine).map((h) => h.trim());
    const rows: Record<string, string>[] = [];
    for (const line of lines.slice(1)) {
      if (!line.trim()) continue;
      const cells = parseLine(line);
      const row: Record<string, string> = {};
      header.forEach((h, idx) => {
        row[h] = cells[idx] ?? "";
      });
      rows.push(row);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { price_mode: true },
    });
    const priceMode = tenant?.price_mode ?? "brutto";

    if (overwrite) {
      // Legacy: restaurant["products"] = [], restaurant["categories"] = set()
      await prisma.product.deleteMany({ where: { tenant_slug: slug } });
      await prisma.category.deleteMany({ where: { tenant_slug: slug } });
    }

    const seenCategories = new Set<string>(
      (
        await prisma.category.findMany({
          where: { tenant_slug: slug },
          select: { name: true },
        })
      ).map((c) => c.name)
    );
    const newCategoryNames: string[] = [];

    const parseBoolTrue = (raw: string) =>
      ["true", "1", "yes", "wahr"].includes(raw);

    for (const row of rows) {
      const name = row.name;
      if (!name) continue;

      const category = (row.category ?? "Unkategorisiert").trim();
      let categoryType = (row.category_type ?? "küche").trim().toLowerCase();
      if (categoryType !== "bar" && categoryType !== "küche") {
        categoryType = "küche";
      }

      let price = Number(String(row.price ?? "0.0").replace(",", ".").trim());
      if (!Number.isFinite(price)) price = 0;
      // Netto-Modus: importierten Nettopreis in Brutto für die DB umrechnen
      if (priceMode === "netto" && price > 0) {
        const mwstFactor = categoryType === "bar" ? 1.19 : 1.07;
        price = Math.round(price * mwstFactor * 100) / 100;
      }

      const desc = row.description ?? "";
      const img = row.image ?? "";
      const isVegan = parseBoolTrue((row.is_vegan ?? "false").trim().toLowerCase());
      const isGluten = parseBoolTrue(
        (row.is_glutenfree ?? "false").trim().toLowerCase()
      );
      const isAvail = !["false", "0", "no", "falsch"].includes(
        (row.is_available ?? "true").trim().toLowerCase()
      );
      const allergensList = (row.allergens ?? "")
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);

      if (category && !seenCategories.has(category)) {
        seenCategories.add(category);
        newCategoryNames.push(category);
      }

      const productData = {
        name,
        price,
        category,
        category_type: categoryType,
        description: desc,
        image: img,
        is_vegan: isVegan,
        vegan: isVegan,
        is_glutenfree: isGluten,
        is_available: isAvail,
        allergens: JSON.stringify(allergensList),
      };

      // Bestehendes Produkt suchen (per ID, dann per Name) — außer bei overwrite
      let existing: { id: number } | null = null;
      if (!overwrite) {
        const idStr = (row.id ?? "").trim();
        if (/^\d+$/.test(idStr)) {
          existing = await prisma.product.findFirst({
            where: { tenant_slug: slug, id: parseInt(idStr, 10) },
            select: { id: true },
          });
        }
        if (!existing) {
          existing = await prisma.product.findFirst({
            where: {
              tenant_slug: slug,
              name: { equals: name, mode: "insensitive" },
            },
            select: { id: true },
          });
        }
      }

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: productData,
        });
      } else {
        await prisma.product.create({
          data: { tenant_slug: slug, ...productData },
        });
      }
    }

    // Neue Kategorien anlegen (legacy: categories = sorted(seen))
    if (newCategoryNames.length > 0) {
      const maxPos =
        (
          await prisma.category.findFirst({
            where: { tenant_slug: slug },
            orderBy: { position: "desc" },
            select: { position: true },
          })
        )?.position ?? 0;
      const sorted = [...newCategoryNames].sort();
      for (let i = 0; i < sorted.length; i++) {
        await prisma.category.create({
          data: {
            tenant_slug: slug,
            name: sorted[i],
            position: maxPos + 1 + i,
          },
        });
      }
    }

    // Legacy: manager.broadcast_global(slug, {"type": "update"}) → Etappe 7 (SSE)
    return NextResponse.redirect(new URL("/admin/dashboard", request.url), 303);
  } catch (err) {
    return errorResponse(err);
  }
}
