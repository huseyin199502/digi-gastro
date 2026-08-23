import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /admin/products/generate-images (main.py ~12337)
// Weist Produkten ohne passendes Bild automatisch ein Bild zu:
//   1. Kuratierte Unsplash-Map (Exakt/Substring/Wort-Match)
//   2. Lorem Flickr (per Kategorie-Tag)
//   3. Open Food Facts (nur Bar/Getränke)
//   4. Standard-Platzhalter je Kategorie
const CURATED: Record<string, string> = {
  cola: "photo-1622483767028-3f66f32aef97",
  coke: "photo-1622483767028-3f66f32aef97",
  "coca cola": "photo-1622483767028-3f66f32aef97",
  "coca-cola": "photo-1622483767028-3f66f32aef97",
  "coca cola zero": "photo-1629203851122-3726ecdf080e",
  "cola zero": "photo-1629203851122-3726ecdf080e",
  fanta: "photo-1624517452488-04869289c4ca",
  sprite: "photo-1625937329935-287441889bcf",
  spezi: "photo-1551024709-8f23befc6f87",
  "mezzo mix": "photo-1551024709-8f23befc6f87",
  "red bull": "photo-1607623814075-e51df1bdc82f",
  "energy drink": "photo-1543257580-7269da773bf5",
  wasser: "photo-1608885898957-a599fb1b1a44",
  water: "photo-1608885898957-a599fb1b1a44",
  mineralwasser: "photo-1608885898957-a599fb1b1a44",
  "sparkling water": "photo-1608885898957-a599fb1b1a44",
  "still water": "photo-1548839140-29a880855b6c",
  apfelschorle: "photo-1613478223719-2ab802602423",
  "apple juice": "photo-1613478223719-2ab802602423",
  orangensaft: "photo-1621506289937-a8e4df240d0b",
  "orange juice": "photo-1621506289937-a8e4df240d0b",
  limonade: "photo-1513558161293-cdaf765ed2fd",
  lemonade: "photo-1513558161293-cdaf765ed2fd",
  eistee: "photo-1556679343-c7306c1976bc",
  "ice tea": "photo-1556679343-c7306c1976bc",
  "iced tea": "photo-1556679343-c7306c1976bc",
  bier: "photo-1608270586620-248524c67de9",
  beer: "photo-1608270586620-248524c67de9",
  pils: "photo-1608270586620-248524c67de9",
  weizen: "photo-1608270586620-248524c67de9",
  radler: "photo-1608270586620-248524c67de9",
  wein: "photo-1510812431401-41d2bd2722f3",
  wine: "photo-1510812431401-41d2bd2722f3",
  rotwein: "photo-1510812431401-41d2bd2722f3",
  weißwein: "photo-1506377247377-2a5b3b417ebb",
  rosewein: "photo-1506377247377-2a5b3b417ebb",
  prosecco: "photo-1594487767535-09689b78809e",
  champagner: "photo-1594487767535-09689b78809e",
  champagne: "photo-1594487767535-09689b78809e",
  aperol: "photo-1560512823-829485b8bf24",
  "aperol spritz": "photo-1560512823-829485b8bf24",
  hugo: "photo-1513558161293-cdaf765ed2fd",
  cocktail: "photo-1514362545857-3bc16c4c7d1b",
  mojito: "photo-1513558161293-cdaf765ed2fd",
  caipirinha: "photo-1513558161293-cdaf765ed2fd",
  "pina colada": "photo-1514362545857-3bc16c4c7d1b",
  gin: "photo-1524156868115-e696b44983db",
  "gin tonic": "photo-1524156868115-e696b44983db",
  whiskey: "photo-1527061011665-3652c757a4d4",
  whisky: "photo-1527061011665-3652c757a4d4",
  vodka: "photo-1569158062925-dd276a9c15d4",
  rum: "photo-1614313511387-1436a4480edd",
  kaffee: "photo-1509042239860-f550ce710b93",
  coffee: "photo-1509042239860-f550ce710b93",
  espresso: "photo-1514432324607-a09d9b4aefdd",
  cappuccino: "photo-1517701604599-bb29b565090c",
  "latte macchiato": "photo-1509042239860-f550ce710b93",
  tee: "photo-1597481499750-3e6b22637e12",
  tea: "photo-1597481499750-3e6b22637e12",
  "heisse schokolade": "photo-1544787219-7f47ccb76574",
  "hot chocolate": "photo-1544787219-7f47ccb76574",
  burger: "photo-1568901346375-23c9450c58cd",
  hamburger: "photo-1568901346375-23c9450c58cd",
  cheeseburger: "photo-1568901346375-23c9450c58cd",
  pizza: "photo-1513104890138-7c749659a591",
  margherita: "photo-1513104890138-7c749659a591",
  salami: "photo-1513104890138-7c749659a591",
  funghi: "photo-1513104890138-7c749659a591",
  pommes: "photo-1573080496219-bb080dd4f877",
  fries: "photo-1573080496219-bb080dd4f877",
  "süßkartoffelpommes": "photo-1585109649139-366815a0d713",
  "sweet potato fries": "photo-1585109649139-366815a0d713",
  salat: "photo-1512621776951-a57141f2eefd",
  salad: "photo-1512621776951-a57141f2eefd",
  "caesar salad": "photo-1512621776951-a57141f2eefd",
  pasta: "photo-1563379091339-03b21ab4a4f8",
  spaghetti: "photo-1563379091339-03b21ab4a4f8",
  lasagne: "photo-1534422298391-e4f8c172dddb",
  sushi: "photo-1579871494447-9811cf80d66c",
  maki: "photo-1579871494447-9811cf80d66c",
  schnitzel: "photo-1599940824399-b87987ceb72a",
  "wiener schnitzel": "photo-1599940824399-b87987ceb72a",
  steak: "photo-1544025162-d76694265947",
  rumpsteak: "photo-1544025162-d76694265947",
  kebab: "photo-1626700051175-6518c4793fdf",
  döner: "photo-1626700051175-6518c4793fdf",
  dürüm: "photo-1626700051175-6518c4793fdf",
  nuggets: "photo-1562967914-608f82629710",
  "chicken wings": "photo-1562967914-608f82629710",
  nachos: "photo-1565299585323-38d6b0865b47",
  tacos: "photo-1565299585323-38d6b0865b47",
  currywurst: "photo-1628191137573-feb6c3e5cf2c",
  waffel: "photo-1562376502-6f769499c886",
  waffle: "photo-1562376502-6f769499c886",
  crepe: "photo-1567620905732-2d1ec7ab7445",
  pancake: "photo-1567620905732-2d1ec7ab7445",
  pancakes: "photo-1567620905732-2d1ec7ab7445",
  eis: "photo-1501443762994-82bd5dace89a",
  "ice cream": "photo-1501443762994-82bd5dace89a",
  tiramisu: "photo-1571877227200-a0d98ea607e9",
  käsekuchen: "photo-1533134242443-d4fd215305ad",
  cheesecake: "photo-1533134242443-d4fd215305ad",
  shisha: "photo-1603006905003-be475563bc59",
  hookah: "photo-1603006905003-be475563bc59",
  wasserpfeife: "photo-1603006905003-be475563bc59",
  kohle: "photo-1533240332313-0db49b459ad6",
};

const STOPWORDS = new Set([
  "premium", "classic", "klassisch", "klassische", "klassischer", "klassisches",
  "hausgemacht", "hausgemachte", "hausgemachter", "hausgemachtes",
  "frisch", "frische", "frischer", "frisches", "spezial", "speziale",
  "special", "original", "traditionell", "traditionelle", "hausmacher",
  "unsere", "unser", "unseres", "nur", "dieses", "gericht",
]);

function cleanProductName(name: string): string {
  const words = name.toLowerCase().trim().split(/\s+/);
  const filtered = words.filter((w) => !STOPWORDS.has(w));
  return filtered.length ? filtered.join(" ") : name;
}

function findCuratedImage(name: string): string | null {
  const nameLower = name.toLowerCase().trim();
  if (CURATED[nameLower]) {
    return `https://images.unsplash.com/${CURATED[nameLower]}?w=600&auto=format&fit=crop&q=80`;
  }
  for (const key of Object.keys(CURATED).sort((a, b) => b.length - a.length)) {
    if (nameLower.includes(key)) {
      return `https://images.unsplash.com/${CURATED[key]}?w=600&auto=format&fit=crop&q=80`;
    }
  }
  for (const w of nameLower.split(/\s+/)) {
    const wClean = w.replace(/[^a-z0-9äöüß]/gi, "");
    if (CURATED[wClean]) {
      return `https://images.unsplash.com/${CURATED[wClean]}?w=600&auto=format&fit=crop&q=80`;
    }
  }
  return null;
}

async function fetchRedirectImage(baseUrl: string, query: string): Promise<string | null> {
  const url = baseUrl + encodeURIComponent(query.trim());
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const finalUrl = res.url || url;
    if (
      finalUrl.includes("loremflickr.com") ||
      /\.(jpg|jpeg|png|webp)(\?|$)/i.test(finalUrl)
    ) {
      return finalUrl;
    }
    return null;
  } catch {
    return null;
  }
}

async function getOpenFoodFactsImage(query: string): Promise<string | null> {
  const url =
    "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" +
    encodeURIComponent(query) +
    "&search_simple=1&action=process&json=1";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DigiGastroProductImageCrawler/1.0 (support@digi-gastro.de)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { products?: { image_url?: string; image_front_url?: string }[] };
    for (const p of data.products ?? []) {
      const img = p.image_url || p.image_front_url;
      if (img) return img;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { is_setup_completed: true },
    });
    if (!tenant?.is_setup_completed) {
      return NextResponse.json(
        { success: false, error: "Setup not completed" },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: { tenant_slug: slug },
      select: { id: true, name: true, category_type: true, image: true },
    });

    let updatedCount = 0;
    for (const prod of products) {
      if (!prod.name) continue;
      if (prod.image) continue; // nur Produkte OHNE Bild

      const cleaned = cleanProductName(prod.name);
      const catType = (prod.category_type ?? "").toLowerCase();
      let imgUrl: string | null = null;

      imgUrl = findCuratedImage(cleaned);
      if (!imgUrl) {
        let tag = cleaned;
        if (catType === "bar") tag = `${cleaned},drink`;
        else if (catType === "küche") tag = `${cleaned},food`;
        imgUrl = (await fetchRedirectImage("https://loremflickr.com/600/600/", tag)) ||
          (await fetchRedirectImage("https://loremflickr.com/600/600/", cleaned));
      }
      if (!imgUrl && catType === "bar") {
        imgUrl = await getOpenFoodFactsImage(cleaned);
      }
      if (!imgUrl) {
        imgUrl =
          catType === "bar"
            ? "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80";
      }

      if (imgUrl) {
        await prisma.product.update({ where: { id: prod.id }, data: { image: imgUrl } });
        updatedCount += 1;
      }
    }

    return NextResponse.json({ success: true, updated_count: updatedCount });
  } catch (err) {
    return errorResponse(err);
  }
}