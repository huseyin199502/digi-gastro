import { guestCookieName, guestCookieOptions, isHttps } from "@/lib/guestSession";
import { prisma } from "@/lib/prisma";

// Port of templates/session_expired.html. Implemented as a route
// handler so we can clear the stale guest_session cookie on the way out.

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
  <title>Sitzung abgelaufen</title>
  <style>
    body{font-family:-apple-system,'Segoe UI',sans-serif;background:#050507;color:#f3f4f6;display:grid;place-items:center;min-height:100vh;margin:0;padding:1rem}
    .card{background:#0b0c10;padding:2rem;border-radius:16px;border:1px solid rgba(255,255,255,0.12);box-shadow:0 12px 40px rgba(0,0,0,0.5);text-align:center;max-width:400px;width:100%}
    h1{color:#f59e0b;margin-top:0;font-size:1.5rem}
    p{color:#9ca3af;font-size:0.95rem;line-height:1.5}
    a{display:inline-block;margin-top:1rem;padding:.6rem 1.2rem;background:#c9a84c;color:#000;font-weight:700;text-decoration:none;border-radius:12px}
  </style>
</head>
<body><main class="card">
  <h1>Sitzung abgelaufen</h1>
  <p>Ihre Sitzung für <strong>${restaurantName}</strong> ist abgelaufen.</p>
  <p>Bitte scannen Sie den QR-Code erneut, um eine neue Sitzung zu starten.</p>
  <a href="/${slug}">Zur Startseite</a>
</main></body>
</html>`;

  const res = new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
  const secure = isHttps(_req.url);
  const opts = guestCookieOptions(secure);
  res.headers.append(
    "set-cookie",
    `${guestCookieName(slug)}=; Max-Age=0; Path=${opts.path}; HttpOnly; SameSite=${opts.sameSite}${
      opts.secure ? "; Secure" : ""
    }`
  );
  return res;
}
