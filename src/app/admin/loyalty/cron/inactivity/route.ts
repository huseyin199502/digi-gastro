import { NextResponse } from "next/server";
import { errorResponse, requireChef } from "@/lib/adminApi";
import { runInactivityCron } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Legacy POST /admin/loyalty/cron/inactivity (main.py ~17411)
// Triggert den Inaktivitäts-Cron manuell — aber NUR für den aktuellen Tenant
// (Multi-Tenant-Isolation: niemals kundendaten anderer Tenants verarbeiten).
export async function POST() {
  try {
    const session = await requireChef();
    const slug = session.slug.toLowerCase().trim();

    const stats = await runInactivityCron(slug);
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    return errorResponse(err);
  }
}