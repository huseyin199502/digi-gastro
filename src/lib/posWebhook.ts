import { prisma } from "./prisma";
import { berlinTimestamp } from "./time";
import { MutableOrder } from "./orderItems";

// ──────────────────────────────────────────────────────────────────
// POS webhook helpers — ports of legacy send_order_to_pos /
// send_bon_to_printer (main.py ~10298). Fire-and-forget: errors are
// logged but never block the payment flow (legacy behaviour).
// Reads the flat tenant POS columns (legacy branding.pos_* fields).
// ──────────────────────────────────────────────────────────────────

interface PosConfig {
  pos_active: boolean;
  pos_api_url: string;
  pos_api_key: string;
  pos_location_id: string;
}

async function getPosConfig(slug: string): Promise<PosConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      pos_active: true,
      pos_api_url: true,
      pos_api_key: true,
      pos_location_id: true,
    },
  });
  if (!tenant || !tenant.pos_active || !tenant.pos_api_url) return null;
  return {
    pos_active: true,
    pos_api_url: tenant.pos_api_url,
    pos_api_key: tenant.pos_api_key ?? "",
    pos_location_id: tenant.pos_location_id ?? "",
  };
}

function webhookHeaders(cfg: PosConfig): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.pos_api_key) headers["Authorization"] = `Bearer ${cfg.pos_api_key}`;
  return headers;
}

/** Send a paid order to the configured POS system (legacy send_order_to_pos). */
export async function sendOrderToPos(
  slug: string,
  order: MutableOrder
): Promise<void> {
  const cfg = await getPosConfig(slug);
  if (!cfg) return;
  const payload = {
    event: "order_paid",
    tenant: slug,
    order_id: order.id,
    daily_bon_number: order.daily_bon_number,
    table: order.table ?? "",
    total: Number(order.total || 0),
    tip: Number(order.tip_amount || 0),
    items: order.items.map((item) => ({
      name: item.name ?? "",
      quantity: item.quantity ?? 1,
      price: Number(item.price || 0),
      category: item.category_type ?? "küche",
    })),
    timestamp: order.timestamp || berlinTimestamp(),
    waiter: order.waiter_id ?? "",
    pos_location_id: cfg.pos_location_id,
  };
  try {
    const resp = await fetch(cfg.pos_api_url, {
      method: "POST",
      headers: webhookHeaders(cfg),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    console.log(
      `[POS Webhook] Order ${order.id} sent to ${cfg.pos_api_url} → HTTP ${resp.status}`
    );
  } catch (e) {
    console.log(`[POS Webhook] Fehler beim Senden an POS: ${e}`);
  }
}

/**
 * Send a bon to the POS/printer webhook (legacy send_bon_to_printer).
 * bon_type: "kitchen" (Küchenbon) | "receipt" (Kassenbon beim Bezahlen).
 */
export async function sendBonToPrinter(
  slug: string,
  order: MutableOrder,
  bonType: "kitchen" | "receipt" = "kitchen"
): Promise<void> {
  const cfg = await getPosConfig(slug);
  if (!cfg) return;
  const items = order.items.filter(
    (item) => bonType === "receipt" || (item.category_type ?? "küche") === "küche"
  );
  const payload = {
    event: `bon_${bonType}`,
    tenant: slug,
    order_id: order.id,
    daily_bon_number: order.daily_bon_number,
    table: order.table ?? "",
    timestamp: order.timestamp || berlinTimestamp(),
    waiter: order.waiter_id ?? "",
    items: items.map((item) => ({
      name: item.name ?? "",
      quantity: item.quantity ?? 1,
      price: bonType === "receipt" ? Number(item.price || 0) : 0,
      category: item.category_type ?? "küche",
      note: item.note ?? "",
      status: item.item_status ?? "pending",
    })),
    total: bonType === "receipt" ? Number(order.total || 0) : 0,
    mwst_rate: order.mwst_rate ?? 19,
    pos_location_id: cfg.pos_location_id,
  };
  try {
    const resp = await fetch(cfg.pos_api_url, {
      method: "POST",
      headers: webhookHeaders(cfg),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    console.log(
      `[Bon Print] ${bonType} bon for order ${order.id} sent → HTTP ${resp.status}`
    );
  } catch (e) {
    console.log(`[Bon Print] Fehler beim Senden des ${bonType}-Bons: ${e}`);
  }
}
