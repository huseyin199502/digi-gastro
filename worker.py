"""
Arq Background Worker für digi-gastro.de
Verarbeitet asynchrone Tasks: POS-Webhook, Bestell-Bestätigung, Email-Versand.

Start: arq worker.WorkerSettings
"""
import os
import asyncio
from arq import create_pool
from arq.connections import RedisSettings

# Redis settings
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

async def send_order_to_pos_async(ctx, slug: str, order_id: int, order_data: dict):
    """Asynchronous POS webhook — non-blocking order transmission.
    Wird aus der bestellen-Endpoint enqueued statt synchron zu warten."""
    import httpx
    pos_url = order_data.get("pos_api_url", "")
    pos_key = order_data.get("pos_api_key", "")
    
    if not pos_url or not pos_key:
        return {"status": "skipped", "reason": "no POS config"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                pos_url,
                json={
                    "order_id": order_id,
                    "tenant": slug,
                    "items": order_data.get("items", []),
                    "total": order_data.get("total", 0.0),
                    "table": order_data.get("table", ""),
                },
                headers={"Authorization": f"Bearer {pos_key}"},
            )
            return {"status": "sent", "response_code": response.status_code}
    except Exception as e:
        return {"status": "error", "error": str(e)}


async def send_service_notification(ctx, slug: str, table: str, service_type: str):
    """Send service call notification asynchronously."""
    # Future: Push notification, WhatsApp, etc.
    print(f"[Worker] Service notification: {slug} / {table} / {service_type}")
    return {"status": "sent"}


class WorkerSettings:
    """Arq worker configuration."""
    functions = [send_order_to_pos_async, send_service_notification]
    redis_settings = RedisSettings(host=REDIS_HOST, port=REDIS_PORT, database=2)
    max_jobs = 10
    job_timeout = 30
