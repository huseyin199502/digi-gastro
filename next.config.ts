import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The legacy FastAPI project has its own package-lock one level up;
  // pin the workspace root to this Next.js app.
  outputFileTracingRoot: __dirname,
  // Produktion: eigenständiger Server-Bundle für das Docker-Image
  // (Dockerfile kopiert .next/standalone + .next/static + public).
  output: "standalone",
  // pdfkit resolves its standard fonts via __dirname. Bundling it into a
  // Turbopack chunk rewrites __dirname to a virtual "/ROOT/..." path that
  // does not exist at runtime (Helvetica.afm ENOENT). Externalize it so the
  // real module directory is used.
  serverExternalPackages: ["pdfkit"],
  // Uploads (Logos, Produktbilder, Videos) robust über die API-Route
  // ausliefern — funktioniert auch für neu angelegte Dateien/Unterordner
  // im Standalone-Build (kein statisches Caching von public/).
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: "/api/uploads/:path*" },
    ];
  },
};

export default nextConfig;
