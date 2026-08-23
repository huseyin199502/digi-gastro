"use client";

interface RestaurantJsonLdProps {
  name: string;
  slug: string;
  address?: { street?: string; city?: string; postalCode?: string; country?: string };
  telephone?: string;
  url?: string;
  logo?: string;
  image?: string;
  priceRange?: string;
  servesCuisine?: string[];
  openingHours?: { day: string; opens: string; closes: string }[];
  geo?: { latitude: number; longitude: number };
  hasMenu?: string;
  baseUrl?: string;
}

export default function RestaurantJsonLd({
  name,
  slug,
  address,
  telephone,
  url,
  logo,
  image,
  priceRange = "€€",
  servesCuisine = ["International"],
  openingHours = [],
  geo,
  hasMenu,
  baseUrl = "",
}: RestaurantJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
    url: url || `${baseUrl}/${slug}`,
    logo: logo || `${baseUrl}/icons/icon-512.svg`,
    image: image || `${baseUrl}/og-image.png`,
    description: "Digitale Speisekarte, Tisch-Bestellungen und Stempelkarte.",
    priceRange,
    servesCuisine,
    address: address
      ? {
          "@type": "PostalAddress",
          streetAddress: address.street,
          addressLocality: address.city,
          postalCode: address.postalCode,
          addressCountry: address.country || "DE",
        }
      : undefined,
    telephone,
    geo: geo
      ? {
          "@type": "GeoCoordinates",
          latitude: geo.latitude,
          longitude: geo.longitude,
        }
      : undefined,
    openingHoursSpecification: openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day,
      opens: h.opens,
      closes: h.closes,
    })),
    hasMenu: hasMenu
      ? {
          "@type": "Menu",
          url: `${baseUrl}/${slug}`,
          hasMenuSection: [],
        }
      : undefined,
    potentialAction: {
      "@type": "ViewAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/${slug}`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      name: "Speisekarte ansehen",
    },
  };

  const cleanSchema = JSON.parse(JSON.stringify(schema, (_, v) => (v === undefined ? null : v)));

  return (
    <script
      id="restaurant-json-ld"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  );
}