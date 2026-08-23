import { createHash } from "crypto";
import { prisma } from "./prisma";
import { berlinTimestamp } from "./time";

// ──────────────────────────────────────────────────────────────────
// Idempotenz-Schutz gegen doppelte Bestellungen bei schlechter
// Internetverbindung (Browser/Proxy wiederholt denselben POST oder
// der Nutzer tippt mehrfach, während die erste Anfrage noch läuft).
//
// Der Client erzeugt pro Bestell-Aktion eine idempotency_key (UUID)
// und WIEDERVERWENDET sie bei Retry. Der Server kombiniert den Key
// mit einem Fingerprint des Bestell-Inhalts (Tisch, Artikel, Menge,
// Notizen, Extras, Trinkgeld):
//
//   gleicher Key + gleicher Fingerprint  → Retry → existierende Order
//   gleicher Key + geänderter Warenkorb  → bewusste Änderung → NEUE Order
//
// Zwei Ebenen (ohne Schema-Migration):
//  1) In-Memory-Cache  — schnell, deckt Retries im selben Prozess ab
//  2) AuditLog-Eintrag — persistent, deckt Prozess-Neustarts ab
//     (action = "order_idem:<key>", details = "<orderId>|<fingerprint>")
// ──────────────────────────────────────────────────────────────────

const MEM_TTL_MS = 30 * 60 * 1000; // 30 Minuten
const MEM_MAX_ENTRIES = 5000;

interface FingerprintedInput {
  table?: unknown;
  items?: unknown;
  tip_amount?: unknown;
}

const memCache = new Map<string, { order_id: number; expires_at: number }>();

// Serialisiert gleichzeitige Requests mit demselben Key+Fingerprint,
// damit die zweite Anfrage den Marker der ersten findet
// (Race-Condition-Schutz).
const locks = new Map<string, Promise<unknown>>();

function memKey(slug: string, key: string, fp: string) {
  return `${slug}:${key}:${fp}`;
}

export function isValidIdempotencyKey(key: unknown): key is string {
  return typeof key === "string" && key.length >= 8 && key.length <= 64;
}

/**
 * Stabiler Fingerprint über den Bestell-Inhalt. Reihenfolge der Items
 * und Extras ist irrelevant; Preise werden auf Cent gerundet.
 */
export function fingerprintOrderInput(input: FingerprintedInput): string {
  const rawItems = Array.isArray(input.items) ? input.items : [];
  const normItems = rawItems
    .map((raw) => {
      const it = (raw ?? {}) as Record<string, unknown>;
      const extrasRaw = Array.isArray(it.extras) ? it.extras : [];
      const extras = extrasRaw
        .map((e) => {
          const ex = (e ?? {}) as Record<string, unknown>;
          return [
            String(ex.name ?? "").trim(),
            Math.round((Number(ex.price) || 0) * 100),
          ] as [string, number];
        })
        .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
      return {
        p: Number(it.product_id) || 0,
        q: Number(it.quantity) || 0,
        n: String(it.note ?? "").trim(),
        e: extras,
      };
    })
    .sort(
      (a, b) => a.p - b.p || a.q - b.q || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0)
    );

  const canonical = JSON.stringify({
    t: String(input.table ?? "").trim().toLowerCase(),
    tip: Math.round((Number(input.tip_amount) || 0) * 100),
    i: normItems,
  });
  return createHash("sha256").update(canonical).digest("hex").slice(0, 32);
}

/** Liefert die bereits existierende Order-ID für Key+Fingerprint — oder null. */
export async function findOrderIdByIdempotencyKey(
  slug: string,
  key: string,
  fingerprint: string
): Promise<number | null> {
  // 1) In-Memory
  const mk = memKey(slug, key, fingerprint);
  const hit = memCache.get(mk);
  if (hit && hit.expires_at > Date.now()) {
    return hit.order_id;
  }
  if (hit) {
    memCache.delete(mk);
  }

  // 2) Persistent (AuditLog) — alle Marker zum Key prüfen, denn derselbe
  // Key kann bei geändertem Warenkorb zu mehreren Orders geführt haben.
  try {
    const rows = await prisma.auditLog.findMany({
      where: { tenant_slug: slug, action: `order_idem:${key}` },
      orderBy: { id: "desc" },
      take: 20,
      select: { details: true },
    });
    for (const row of rows) {
      const sep = row.details ? row.details.indexOf("|") : -1;
      if (sep <= 0 || !row.details) continue;
      const rowFp = row.details.slice(sep + 1);
      if (rowFp !== fingerprint) continue;
      const orderId = parseInt(row.details.slice(0, sep), 10);
      if (Number.isFinite(orderId)) {
        rememberOrderId(slug, key, fingerprint, orderId);
        return orderId;
      }
    }
  } catch {
    // AuditLog-Lookup ist best-effort — Memory-Cache greift trotzdem.
  }
  return null;
}

/** Merkt die Order-ID für Key+Fingerprint (Memory + persistent). */
export async function rememberOrderId(
  slug: string,
  key: string,
  fingerprint: string,
  orderId: number
): Promise<void> {
  // Memory (mit Größenbegrenzung)
  if (memCache.size >= MEM_MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of memCache) {
      if (v.expires_at <= now) memCache.delete(k);
    }
    if (memCache.size >= MEM_MAX_ENTRIES) {
      const oldest = memCache.keys().next().value;
      if (oldest !== undefined) memCache.delete(oldest);
    }
  }
  memCache.set(memKey(slug, key, fingerprint), {
    order_id: orderId,
    expires_at: Date.now() + MEM_TTL_MS,
  });

  // Persistent (best-effort — darf die Bestellung nie blockieren)
  try {
    await prisma.auditLog.create({
      data: {
        tenant_slug: slug,
        action: `order_idem:${key}`,
        timestamp: berlinTimestamp(),
        user: "system",
        details: `${orderId}|${fingerprint}`,
      },
    });
  } catch {
    // ignore
  }
}

/**
 * Serialisiert gleichzeitige Requests mit demselben Key+Fingerprint:
 * Der zweite Request wartet auf den ersten und findet dann dessen
 * Marker, statt parallel eine zweite Bestellung anzulegen.
 */
export function serializeIdempotent<R>(
  slug: string,
  key: string | null,
  fingerprint: string,
  fn: () => Promise<R>
): Promise<R> {
  if (!key) return fn();
  const k = memKey(slug, key, fingerprint);
  const prev = locks.get(k) ?? Promise.resolve();
  const run = prev.then(fn, fn); // auch bei Fehler des Vorgängers ausführen
  const tracked = run.catch(() => {});
  locks.set(k, tracked);
  void tracked.then(() => {
    if (locks.get(k) === tracked) locks.delete(k);
  });
  return run;
}
