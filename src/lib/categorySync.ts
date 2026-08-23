import { prisma } from "./prisma";

// ──────────────────────────────────────────────────────────────────
// Kategorie-Sync (legacy restaurant["categories"] → categories-Tabelle).
// Basis-Logik aus main.py (profile-update ~8479, setup-complete ~13626,
// onboarding ~7843, shishabar-toggle ~11289).
// ──────────────────────────────────────────────────────────────────

const STANDARD_KITCHEN_CATS = ["Burger", "Salads"];
const STANDARD_SHISHA_CATS = ["Shisha"];

/**
 * Baut die Ziel-Kategorieliste nach Legacy-Semantik:
 * Basis ["Drinks","Desserts"], optional Burger/Salads (Küche) vorne/hinten,
 * optional Shisha. Mit preserve=true bleiben Custom-Kategorien erhalten
 * (Standard-Kategorien werden bei deaktiviertem Flag entfernt).
 */
export function buildCategoryList(
  existing: string[],
  hasKitchen: boolean,
  isShishabar: boolean,
  preserve: boolean
): string[] {
  const categories: string[] = ["Drinks", "Desserts"];
  if (hasKitchen) {
    categories.unshift("Burger");
    categories.push("Salads");
  }
  if (isShishabar) categories.push("Shisha");

  if (preserve) {
    for (const cat of existing) {
      if (STANDARD_KITCHEN_CATS.includes(cat) && !hasKitchen) continue;
      if (STANDARD_SHISHA_CATS.includes(cat) && !isShishabar) continue;
      if (!categories.includes(cat)) categories.push(cat);
    }
  }
  return categories;
}

/**
 * Schreibt die Ziel-Kategorieliste in die DB: löscht entfernte,
 * legt fehlende an und setzt position = Index in der Liste.
 * Bestehende Zeilen (inkl. extras/super_group_id) bleiben erhalten.
 */
export async function applyCategoryList(
  slug: string,
  target: string[]
): Promise<void> {
  const existing = await prisma.category.findMany({
    where: { tenant_slug: slug },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  await prisma.category.deleteMany({
    where: { tenant_slug: slug, name: { notIn: target } },
  });
  for (let i = 0; i < target.length; i++) {
    const row = existing.find((c) => c.name === target[i]);
    if (row) {
      if (row.position !== i) {
        await prisma.category.update({
          where: { id: row.id },
          data: { position: i },
        });
      }
    } else {
      await prisma.category.create({
        data: { tenant_slug: slug, name: target[i], position: i },
      });
    }
  }
}
