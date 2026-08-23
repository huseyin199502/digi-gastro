import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireChef } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Legacy POST /api/pos/test-connection (main.py ~10247)
// Sendet einen Test-Ping an die konfigurierte POS-Webhook-URL.
export async function POST() {
  try {
    const session = await requireChef();
    const slug = session.slug;

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    const posSystem = tenant?.pos_system || "none";
    const posApiUrl = tenant?.pos_api_url || "";
    const posApiKey = tenant?.pos_api_key || "";

    if (posSystem === "none") {
      return NextResponse.json({
        success: false,
        message: "Kein Kassensystem ausgewählt.",
      });
    }
    if (!posApiUrl) {
      return NextResponse.json({
        success: false,
        message: "Keine API-URL konfiguriert.",
      });
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (posApiKey) headers["Authorization"] = `Bearer ${posApiKey}`;
      const testPayload = {
        event: "test_connection",
        tenant: slug,
        timestamp: new Date().toISOString(),
        message: "digi-gastro POS Connection Test",
      };
      const resp = await fetch(posApiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(10_000),
      });
      if (resp.status < 400) {
        return NextResponse.json({
          success: true,
          message: `Verbindung erfolgreich! (HTTP ${resp.status}) — Test-Ping gesendet an ${posSystem}.`,
          status_code: resp.status,
        });
      }
      return NextResponse.json({
        success: false,
        message: `POS antwortet mit Fehler ${resp.status}. URL/API-Key prüfen.`,
        status_code: resp.status,
      });
    } catch (e) {
      if (e instanceof Error && e.name === "TimeoutError") {
        return NextResponse.json({
          success: false,
          message: "Timeout: POS antwortet nicht innerhalb 10s.",
        });
      }
      if (e instanceof TypeError) {
        return NextResponse.json({
          success: false,
          message: "Verbindung fehlgeschlagen: URL nicht erreichbar.",
        });
      }
      return NextResponse.json({
        success: false,
        message: `Fehler: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  } catch (err) {
    return errorResponse(err);
  }
}
