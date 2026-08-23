/**
 * Client-Modul für Live-Updates: EventSource (SSE) mit automatischem
 * Polling-Fallback. Legacy-Clients, die den WebSocket /ws/{slug} nutzten,
 * werden hiermit gezielt umgestellt (einzige bewusste Abweichung vom 1:1,
 * da WebSockets durch SSE+Polling ersetzt werden).
 *
 * Nutzung (nur Client-Komponenten):
 *   const live = createLiveClient(slug, {
 *     onEvent: (event) => { ... },
 *     channels: ["new_order", "service_call", "update", "refresh_tables"],
 *   });
 *   // ... live.close() bei Unmount
 */

export type LiveEvent = { type: string; [key: string]: unknown };

export interface LiveClientOptions {
  onEvent: (event: LiveEvent) => void;
  /** Nur diese Event-Typen durchreichen (leer = alle). */
  channels?: string[];
  /** Basis-URL für den Stream; Default: gleicher Origin. */
  baseUrl?: string;
  /** EventSource wiederverbinden nach Fehler (Default true). */
  autoReconnect?: boolean;
  /** Reconnect-Verzögerung in ms (Default 3000). */
  reconnectDelayMs?: number;
  /** Polling-Intervall in ms, falls EventSource nicht verfügbar (Default 8000). */
  pollIntervalMs?: number;
}

export function createLiveClient(slug: string, options: LiveClientOptions) {
  const {
    onEvent,
    channels = [],
    baseUrl = "",
    autoReconnect = true,
    reconnectDelayMs = 3000,
    pollIntervalMs = 8000,
  } = options;

  const normalizedSlug = slug.toLowerCase().trim();
  let source: EventSource | null = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function deliver(event: LiveEvent) {
    if (closed) return;
    if (channels.length > 0 && !channels.includes(event.type)) return;
    onEvent(event);
  }

  function startPolling() {
    if (pollTimer) return;
    // Polling-Fallback: fragt einen schlanken Snapshot-Endpunkt ab und liefert
    // einen generischen "update"-Refresh, falls sich Daten geändert haben.
    pollTimer = setInterval(async () => {
      if (closed) return;
      try {
        const res = await fetch(`${baseUrl}/api/${normalizedSlug}/events/poll`, {
          headers: { "X-Live-Poll": "1" },
        });
        if (res.ok) {
          const data = (await res.json()) as { changed: boolean };
          if (data.changed) deliver({ type: "update" });
        }
      } catch {
        // Netzwerkfehler ignorieren
      }
    }, pollIntervalMs);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function connect() {
    if (closed) return;
    if (typeof EventSource === "undefined") {
      // Kein EventSource (z.B. alter Browser) → reines Polling
      startPolling();
      return;
    }
    stopPolling();
    try {
      source = new EventSource(`${baseUrl}/api/${normalizedSlug}/events/stream`);
    } catch {
      startPolling();
      return;
    }

    source.onmessage = (msg: MessageEvent<string>) => {
      try {
        deliver(JSON.parse(msg.data) as LiveEvent);
      } catch {
        // Kein JSON → ignorieren
      }
    };
    source.onerror = () => {
      source?.close();
      source = null;
      if (autoReconnect && !closed) {
        reconnectTimer = setTimeout(connect, reconnectDelayMs);
      }
    };
  }

  connect();

  return {
    close() {
      closed = true;
      if (source) {
        source.close();
        source = null;
      }
      stopPolling();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    },
    /** Bei Bedarf manuell neu verbinden (z.B. nach Tab-Sichtbarkeit). */
    reconnect() {
      if (closed) return;
      if (source) {
        source.close();
        source = null;
      }
      connect();
    },
  };
}