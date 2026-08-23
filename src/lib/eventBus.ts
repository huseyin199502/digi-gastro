/**
 * In-Memory-Event-Bus für Live-Updates (Ersatz für den legacy WebSocket-Manager,
 * main.py ConnectionManager). Pro Tenant (slug) eine Menge an Subscribern.
 * Broadcast-Kanäle wie im Legacy: "new_order", "service_call", "update",
 * "refresh_tables", ...
 *
 * Hinweis: Prozess-lokal (wie Legacy-Single-Worker-Dev). In Multi-Worker-
 * Deployments müsste man auf Redis Pub/Sub ausweichen (vgl. Legacy
 * broadcast_global) — der Fallback verhält sich identisch zum Single-Worker-Betrieb.
 */

export type LiveEvent = { type: string; [key: string]: unknown };

type Subscriber = (event: LiveEvent) => void;

const subscribers = new Map<string, Set<Subscriber>>();
const versions = new Map<string, number>();

/** Subscriber registrieren; liefert Dispose-Funktion zurück. */
export function subscribeEvents(
  slug: string,
  cb: Subscriber
): () => void {
  const key = slug.toLowerCase().trim();
  let set = subscribers.get(key);
  if (!set) {
    set = new Set();
    subscribers.set(key, set);
  }
  set.add(cb);
  return () => {
    set.delete(cb);
    if (set.size === 0) subscribers.delete(key);
  };
}

/** Broadcast eines Events an alle Subscriber des Tenants (Legacy manager.broadcast). */
export function publishEvent(slug: string, event: LiveEvent): void {
  const key = slug.toLowerCase().trim();
  versions.set(key, (versions.get(key) ?? 0) + 1);
  const set = subscribers.get(key);
  if (!set || set.size === 0) return;
  for (const cb of [...set]) {
    try {
      cb(event);
    } catch (e) {
      console.log(`[EventBus] Subscriber error: ${e}`);
    }
  }
}

/** Aktuelle Versionsnummer des Tenants (für Polling-Fallback). */
export function eventVersion(slug: string): number {
  return versions.get(slug.toLowerCase().trim()) ?? 0;
}

/** Anzahl aktiver Subscriber pro Tenant (Diagnose). */
export function subscriberCount(slug: string): number {
  return subscribers.get(slug.toLowerCase().trim())?.size ?? 0;
}

/** Alle registrierten Slugs (Diagnose). */
export function activeSlugs(): string[] {
  return [...subscribers.keys()];
}