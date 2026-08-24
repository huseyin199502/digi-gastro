import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const slug = "test-gastro";
  const password = "test1234";

  await prisma.tenant.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name: "Test Restaurant",
      email: "test@test-gastro.de",
      password,
      active: true,
      is_onboarded: true,
      is_setup_completed: true,
      has_kitchen: true,
      is_shishabar: false,
      ort: "Neuwied",
      accepts_card_payment: true,
    },
  });

  const groups = [
    { name: "Speisen", color: "#f59e0b", icon: "restaurant", position: 1 },
    { name: "Getränke", color: "#3b82f6", icon: "local_bar", position: 2 },
  ];
  const groupIds: Record<string, number> = {};
  for (const g of groups) {
    const existing = await prisma.superGroup.findFirst({ where: { tenant_slug: slug, name: g.name } });
    if (existing) {
      groupIds[g.name] = existing.id;
    } else {
      const created = await prisma.superGroup.create({ data: { tenant_slug: slug, ...g } });
      groupIds[g.name] = created.id;
    }
  }

  const categories = [
    { name: "Hauptgerichte", super_group_id: groupIds["Speisen"], position: 1 },
    { name: "Desserts", super_group_id: groupIds["Speisen"], position: 2 },
    { name: "Alkoholfrei", super_group_id: groupIds["Getränke"], position: 3 },
  ];
  const catIds: Record<string, number> = {};
  for (const c of categories) {
    const existing = await prisma.category.findFirst({ where: { tenant_slug: slug, name: c.name } });
    if (existing) {
      catIds[c.name] = existing.id;
    } else {
      const created = await prisma.category.create({ data: { tenant_slug: slug, ...c } });
      catIds[c.name] = created.id;
    }
  }

  const products = [
    { name: "Döner Teller", price: 12.5, description: "Mit Hähnchen, Salat und Soße", category_type: "cat", category: "Hauptgerichte" },
    { name: "Pizza Margherita", price: 9.9, description: "Klassisch mit Mozzarella", category_type: "cat", category: "Hauptgerichte" },
    { name: "Lahmacun", price: 7.5, description: "Türkische Pizza", category_type: "cat", category: "Hauptgerichte" },
    { name: "Baklava", price: 5.5, description: "Süßes Blätterteig-Dessert", category_type: "cat", category: "Desserts" },
    { name: "Cola 0,33l", price: 2.8, description: "Gekühlt", category_type: "cat", category: "Alkoholfrei" },
    { name: "Ayran 0,3l", price: 2.5, description: "Joghurt-Getränk", category_type: "cat", category: "Alkoholfrei" },
  ];
  for (const [i, p] of products.entries()) {
    const existing = await prisma.product.findFirst({ where: { tenant_slug: slug, name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: { tenant_slug: slug, ...p, is_available: true, position: i + 1 },
      });
    }
  }

  const tables = [
    { number: "1", zone: "Innen" },
    { number: "2", zone: "Innen" },
    { number: "3", zone: "Terrasse" },
    { number: "4", zone: "Terrasse" },
  ];
  for (const [i, t] of tables.entries()) {
    const existing = await prisma.table.findFirst({
      where: { tenant_slug: slug, number: t.number, zone: t.zone },
    });
    if (!existing) {
      await prisma.table.create({
        data: {
          tenant_slug: slug,
          ...t,
          security_token: `tok_test_${t.number.toLowerCase()}_${Date.now()}_${i}`,
          pos_x: 100 + i * 200,
          pos_y: 150,
        },
      });
    }
  }

  console.log("✅ Test-Tenant angelegt:");
  console.log("   Login: test@test-gastro.de / " + password);
  console.log("   Dashboard: http://localhost:3000/test-gastro/admin");
  console.log("   Speisekarte: http://localhost:3000/test-gastro");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
