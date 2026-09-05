let activeTransferIdempotencyKey: string | null = null;

/**
 * Beginnt genau eine Umbuchungs-Aktion pro Browser-Tab.
 *
 * Die Prüfung und das Setzen erfolgen synchron im Klick-Handler. Damit kann
 * ein zweiter Klick vor dem nächsten Render keinen zweiten Request auslösen.
 * Parallel laufende Netzwerkwiederholungen erhalten denselben Key, damit der
 * Server sie als Wiederholung erkennen kann.
 */
export function beginTransferAction(): string | null {
  if (activeTransferIdempotencyKey) return null;
  const idempotencyKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `transfer_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  activeTransferIdempotencyKey = idempotencyKey;
  return idempotencyKey;
}

export function endTransferAction(idempotencyKey: string): void {
  if (activeTransferIdempotencyKey === idempotencyKey) {
    activeTransferIdempotencyKey = null;
  }
}
