// Legacy dual path: POST /{slug}/tablet/item-status/{order_id} behaves
// exactly like POST /{slug}/orders/item-status/{order_id} (main.py ~7730).
export const dynamic = "force-dynamic";
export { POST } from "@/app/[slug]/orders/item-status/[order_id]/route";
