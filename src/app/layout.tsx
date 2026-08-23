import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://digi-gastro.de";
const SITE_DESCRIPTION =
  "Digitales Bestellsystem für Restaurants & Shisha-Bars in Neuwied, Koblenz und ganz Rheinland-Pfalz. QR-Speisekarte, NFC-Bestellung, Küchen-Display und Wallet-Stempelkarte — ohne App-Download, ohne Provisionen.";

export const metadata: Metadata = {
  title: {
    default: "digi-gastro — Digitales Bestellsystem für Restaurants & Gastronomie",
    template: "%s | digi-gastro",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "digitales bestellsystem gastronomie",
    "restaurant bestellsystem",
    "qr code bestellsystem",
    "qr bestellung restaurant",
    "digitale speisekarte",
    "digitales menü restaurant",
    "gastronomie software",
    "restaurant software",
    "tischbestellsystem",
    "bestellsystem neuwied",
    "gastronomie software neuwied",
    "restaurant software rheinland-pfalz",
    "shisha bar bestellsystem",
    "kassensystem gastronomie",
  ],
  authors: [{ name: "digi-gastro" }],
  creator: "digi-gastro",
  publisher: "digi-gastro",
  formatDetection: { telephone: false },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "/",
    siteName: "digi-gastro",
    title: "digi-gastro — Digitales Bestellsystem für die Gastronomie",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "digi-gastro — Das Gastro-OS, das in 5 Minuten live ist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "digi-gastro — Digitales Bestellsystem für die Gastronomie",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "digi-gastro",
  },
};

export const viewport: Viewport = {
  themeColor: "#c9a84c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${outfit.variable} ${inter.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Material Symbols Icon-Font (Admin- & Menü-UI).
            Muss als <link> geladen werden — Tailwind v4 entfernt
            Remote-@imports beim CSS-Bundling. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip bg-zinc-950 text-zinc-100 font-sans">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered:', reg.scope))
                    .catch(err => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
