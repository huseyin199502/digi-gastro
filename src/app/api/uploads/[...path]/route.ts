import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// GET /api/uploads/[...path] — serviert Dateien aus public/uploads.
// Robust gegen Standalone-Static-Serving-Eigenheiten (auch neu angelegte
// Unterordner/Dateien), setzt den korrekten Content-Type.
const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }
    // Verhindere Pfad-Traversal (..)
    const safe = segments.filter((s) => s && s !== ".." && !s.includes("/"));
    const relPath = safe.join(path.sep);
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      ...safe
    );
    // Sicherstellen, dass der aufgelöste Pfad innerhalb von public/uploads liegt
    const base = path.resolve(process.cwd(), "public", "uploads");
    const resolved = path.resolve(filePath);
    if (resolved !== base && !resolved.startsWith(base + path.sep)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const ext = path.extname(relPath).toLowerCase();
    const stat = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);
    const headers: Record<string, string> = {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": String(stat.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    };
    // SVG kann Skripte enthalten — nie im App-Origin inline ausführen lassen
    if (ext === ".svg") {
      headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
      headers["X-Content-Type-Options"] = "nosniff";
    }
    return new NextResponse(stream as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}