import { prisma } from "@/lib/prisma";

// Legacy ensure_default_super_groups (main.py 2889)
// Legt beim ersten Aufruf 3 Standard-Hauptgruppen an, falls der Tenant
// noch keine hat. "Sonstiges" wird NICHT angelegt — impliziter NULL-Bucket.
export async function ensureDefaultSuperGroups(slug: string): Promise<void> {
  const existing = await prisma.superGroup.count({
    where: { tenant_slug: slug },
  });
  if (existing > 0) return;
  const defaults = [
    { name: "Shisha", color: "#7c3aed", icon: "whatshot" }, // lila
    { name: "Getränke", color: "#0ea5e9", icon: "local_bar" }, // blau
    { name: "Snacks", color: "#f59e0b", icon: "restaurant" }, // orange
  ];
  for (let idx = 0; idx < defaults.length; idx++) {
    const d = defaults[idx];
    await prisma.superGroup.create({
      data: {
        tenant_slug: slug,
        name: d.name,
        color: d.color,
        icon: d.icon,
        position: idx,
      },
    });
  }
  console.log(
    `[SuperGroups] Default-Hauptgruppen für '${slug}' angelegt: Shisha, Getränke, Snacks`
  );
}

// Legacy build_category_to_super_group_map (main.py 2909)
// {category_name: {id, name, color, icon, position}} — Kategorien ohne
// super_group_id fehlen in der Map → "Sonstiges".
export async function buildCategoryToSuperGroupMap(
  slug: string
): Promise<
  Record<
    string,
    { id: number; name: string; color: string; icon: string; position: number }
  >
> {
  const sgs = await prisma.superGroup.findMany({
    where: { tenant_slug: slug },
  });
  const sgById = new Map(sgs.map((sg) => [sg.id, sg]));
  const cats = await prisma.category.findMany({
    where: { tenant_slug: slug },
  });
  const out: Record<
    string,
    { id: number; name: string; color: string; icon: string; position: number }
  > = {};
  for (const c of cats) {
    const sg = c.super_group_id != null ? sgById.get(c.super_group_id) : undefined;
    if (sg) {
      out[c.name] = {
        id: sg.id,
        name: sg.name,
        color: sg.color || "#374151",
        icon: sg.icon || "",
        position: sg.position ?? 0,
      };
    }
  }
  return out;
}
