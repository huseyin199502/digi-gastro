interface Tenant {
  slug: string;
  name: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://digi-gastro.de";

export default function SchemaMarkup({ tenants }: { tenants: Tenant[] }) {
  void tenants; // Kunden werden auf der Landingpage nicht mehr genannt

  const organizationSchema = {
    "@type": "Organization",
    name: "digi-gastro",
    url: BASE_URL,
    logo: `${BASE_URL}/icons/icon-512.svg`,
    description:
      "Digitales Bestellsystem für Restaurants & Shisha-Bars. QR-Speisekarte, Küchen-Display, Rechnungs-Splitting. Keine App nötig – Gäste bestellen per Browser.",
    areaServed: ["Neuwied", "Koblenz", "Rheinland-Pfalz", "Deutschland"],
  };

  const websiteSchema = {
    "@type": "WebSite",
    name: "digi-gastro",
    url: BASE_URL,
    inLanguage: "de-DE",
  };

  const softwareSchema = {
    "@type": "SoftwareApplication",
    name: "digi-gastro",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description:
      "Digitales Bestellsystem und Gastro-Betriebssystem: QR-Code & NFC Tischbestellung, Küchen-Display (KDS), Sitzplan, Stempelkarten für Apple & Google Wallet, GoBD-konformes Audit-Log.",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
    },
  };

  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Brauchen meine Gäste eine App?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nein. Gäste scannen den QR-Code am Tisch oder tippen auf den NFC-Chip und die Speisekarte öffnet sich direkt im Browser — auf iOS und Android.",
        },
      },
      {
        "@type": "Question",
        name: "Ist das Finanzamtsicher?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Jede Stornierung, Änderung und Bezahlung wird manipulationssicher kryptografisch im Audit-Log aufgezeichnet. Stornos erfordern eine Mitarbeiter-PIN. GoBD-konformer Export als PDF/Excel mit einem Klick.",
        },
      },
      {
        "@type": "Question",
        name: "Brauche ich spezielle Hardware?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nein. digi-gastro läuft im Browser auf jedem Tablet, Smartphone oder Computer. Für NFC-Bestellung genügen NFC-Aufkleber auf den Tischen.",
        },
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      websiteSchema,
      softwareSchema,
      faqSchema,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
