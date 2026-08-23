import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://digi-gastro.de";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Interne Bereiche
          "/admin/",
          "/digi-gastro-admin/",
          "/login",
          "/api/",
          // Tenant-interne App-Routen (wildcards statt "[slug]"-Literalen)
          "/*/admin/",
          "/*/tablet/",
          "/*/orders/",
          "/*/service-ruf/",
          "/*/service-erledigt/",
          "/*/start-session/",
          "/*/sitz-expired/",
          "/*/stempel/",
          "/*/bestellen/",
          "/*/loyalty/",
          "/*/newsletter/",
          "/*/device-decoupled/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
