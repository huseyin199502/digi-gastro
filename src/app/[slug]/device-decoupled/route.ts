import { prisma } from "@/lib/prisma";

// Port of templates/device-decoupled (main.py ~13935). Static status page
// shown to a POS/KDS device after its pairing token was rotated.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.toLowerCase().trim();

  let restaurantName = slug;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (tenant) restaurantName = tenant.name;

  const html = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gerät entkoppelt – ${restaurantName}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0a; color: #e5e2e1; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100svh; padding: 24px; }
    .card { background: #141313; border: 1.5px solid #262626; border-radius: 20px; padding: 40px 36px; max-width: 440px; width: 100%; text-align: center; }
    .icon { font-size: 56px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 900; color: #ef4444; margin-bottom: 10px; }
    p { font-size: 14px; color: #888; line-height: 1.6; }
    .badge { display: inline-block; margin-top: 24px; background: #1c1c1c; border: 1px solid #333; border-radius: 10px; padding: 12px 20px; font-size: 12px; color: #aaa; }
    .badge strong { color: #deff9a; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔌</div>
    <h1>Gerät entkoppelt</h1>
    <p>
      Dieses Gerät wurde vom Admin-Dashboard entkoppelt.<br>
      Der Zugriff auf das POS / KDS-System ist nicht mehr aktiv.
    </p>
    <div class="badge">
      Bitte den Administrator kontaktieren, um einen neuen<br>
      <strong>Magic Link</strong> für dieses Gerät zu erhalten.
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}