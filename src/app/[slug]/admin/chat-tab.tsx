"use client";

// ──────────────────────────────────────────────────────────────────
// Chat-Tab im Admin-Dashboard: letzte Nachrichten löschen, Teilnehmer
// der letzten 24 h anhand der Geräte-ID sperren/entsperren.
// Datenquelle: /api/{slug}/chat/moderation (requireChef).
// Auto-Refresh alle 5 s + Live-Push über SSE ("chat_message" Event,
// das AdminClient als window-Event weiterreicht).
// ──────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";

interface ModMessage {
  id: number;
  device_id: string;
  nickname: string;
  body: string;
  is_admin: boolean;
  is_deleted: boolean;
  created_at: string;
}

interface Participant {
  device_id: string;
  nickname: string;
  messages: number;
  last_at: string;
  banned: boolean;
}

interface Ban {
  device_id: string;
  nickname: string | null;
  reason: string | null;
  banned_by: string | null;
  created_at: string;
}

interface ModerationData {
  messages: ModMessage[];
  participants: Participant[];
  bans: Ban[];
}

interface Toast {
  id: number;
  msg: string;
  kind: "success" | "error";
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function shortDevice(deviceId: string): string {
  return deviceId.length > 10 ? `${deviceId.slice(0, 10)}…` : deviceId;
}

export default function ChatTab({
  slug,
  pushToast,
}: {
  slug: string;
  pushToast: (msg: string, kind?: Toast["kind"]) => void;
}) {
  const [data, setData] = useState<ModerationData | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/${slug}/chat/moderation`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const json = (await res.json()) as ModerationData;
      setData(json);
      setLoaded(true);
    } catch {
      // ignore — nächster Refresh
    }
  }, [slug]);

  // Auto-Refresh + Live-Update über SSE (siehe admin-client.tsx).
  // Initial-Load deferred (setTimeout 0) — gleiche Konvention wie
  // refreshLive im admin-client.
  useEffect(() => {
    const to = window.setTimeout(() => void load(), 0);
    const iv = window.setInterval(() => void load(), 5000);
    const onLive = () => void load();
    window.addEventListener("dg:chat-update", onLive);
    return () => {
      window.clearTimeout(to);
      window.clearInterval(iv);
      window.removeEventListener("dg:chat-update", onLive);
    };
  }, [load]);

  const deleteMessage = useCallback(
    async (m: ModMessage) => {
      if (
        !window.confirm(
          `Nachricht von "${m.nickname}" löschen?\n\n"${m.body}"`
        )
      ) {
        return;
      }
      setBusy(true);
      try {
        const res = await fetch(`/api/${slug}/chat/messages/${m.id}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          pushToast("Nachricht gelöscht");
          void load();
        } else {
          const err = (await res.json().catch(() => ({}))) as { detail?: string };
          pushToast(err.detail || "Fehler beim Löschen", "error");
        }
      } catch {
        pushToast("Verbindungsfehler", "error");
      } finally {
        setBusy(false);
      }
    },
    [slug, pushToast, load]
  );

  const banDevice = useCallback(
    async (deviceId: string, nickname: string) => {
      const reason = window.prompt(
        `Gerät von "${nickname}" sperren?\n\nGrund (optional):`,
        ""
      );
      if (reason === null) return;
      setBusy(true);
      try {
        const res = await fetch(`/api/${slug}/chat/moderation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ device_id: deviceId, nickname, reason }),
        });
        if (res.ok) {
          pushToast(`"${nickname}" ist jetzt gesperrt (kann nur noch lesen)`);
          void load();
        } else {
          const err = (await res.json().catch(() => ({}))) as { detail?: string };
          pushToast(err.detail || "Fehler beim Sperren", "error");
        }
      } catch {
        pushToast("Verbindungsfehler", "error");
      } finally {
        setBusy(false);
      }
    },
    [slug, pushToast, load]
  );

  const unbanDevice = useCallback(
    async (deviceId: string, nickname: string) => {
      if (!window.confirm(`Sperre für "${nickname}" aufheben?`)) return;
      setBusy(true);
      try {
        const res = await fetch(
          `/api/${slug}/chat/moderation?device_id=${encodeURIComponent(deviceId)}`,
          { method: "DELETE", headers: { Accept: "application/json" } }
        );
        if (res.ok) {
          pushToast(`"${nickname}" kann wieder schreiben`);
          void load();
        } else {
          const err = (await res.json().catch(() => ({}))) as { detail?: string };
          pushToast(err.detail || "Fehler beim Entsperren", "error");
        }
      } catch {
        pushToast("Verbindungsfehler", "error");
      } finally {
        setBusy(false);
      }
    },
    [slug, pushToast, load]
  );

  if (!loaded) {
    return <p className="text-sm text-zinc-500">Lade Chat-Daten…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Teilnehmer */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-emerald-400">
          Aktive Teilnehmer (letzte 24 h)
        </h3>
        <p className="mb-3 text-xs text-zinc-500">
          Identifizierung per Geräte-ID (Cookie). Gesperrte Geräte können den
          Chat weiterhin lesen, aber nicht mehr schreiben.
        </p>
        {data && data.participants.length === 0 ? (
          <p className="text-sm text-zinc-500">Noch keine Chat-Aktivität.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Gerät</th>
                  <th className="py-2 pr-3 text-right">Nachrichten</th>
                  <th className="py-2 pr-3">Zuletzt</th>
                  <th className="py-2 pr-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data?.participants.map((p) => (
                  <tr key={p.device_id}>
                    <td className="py-2 pr-3 font-semibold text-zinc-200">
                      {p.nickname}
                      {p.banned ? (
                        <span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                          gesperrt
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-zinc-500">
                      {shortDevice(p.device_id)}
                    </td>
                    <td className="py-2 pr-3 text-right text-zinc-400">{p.messages}</td>
                    <td className="py-2 pr-3 text-xs text-zinc-500">{fmtTime(p.last_at)}</td>
                    <td className="py-2 pr-3 text-right">
                      {p.banned ? (
                        <button
                          className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:border-emerald-500 disabled:opacity-50"
                          disabled={busy}
                          onClick={() => void unbanDevice(p.device_id, p.nickname)}
                        >
                          Entsperren
                        </button>
                      ) : (
                        <button
                          className="rounded-lg border border-red-800 bg-red-950 px-2.5 py-1 text-xs font-medium text-red-300 hover:border-red-500 disabled:opacity-50"
                          disabled={busy}
                          onClick={() => void banDevice(p.device_id, p.nickname)}
                        >
                          Sperren
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Sperrliste */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-red-400">
          Sperrliste ({data?.bans.length ?? 0})
        </h3>
        {data && data.bans.length === 0 ? (
          <p className="text-sm text-zinc-500">Keine Geräte gesperrt.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data?.bans.map((b) => (
              <div
                key={b.device_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold text-zinc-200">
                    {b.nickname ?? "Unbekannt"}
                    <span className="ml-2 font-mono text-xs text-zinc-500">
                      {shortDevice(b.device_id)}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {b.banned_by ? `Gesperrt von ${b.banned_by}` : "Gesperrt"}
                    {b.reason ? ` — ${b.reason}` : ""} · {fmtTime(b.created_at)}
                  </div>
                </div>
                <button
                  className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:border-emerald-500 disabled:opacity-50"
                  disabled={busy}
                  onClick={() => void unbanDevice(b.device_id, b.nickname ?? b.device_id)}
                >
                  Entsperren
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Nachrichten */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-400">
          Letzte Nachrichten
        </h3>
        {data && data.messages.length === 0 ? (
          <p className="text-sm text-zinc-500">Noch keine Nachrichten.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data?.messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 ${
                  m.is_deleted
                    ? "border-zinc-800/60 bg-zinc-950/40 opacity-60"
                    : "border-zinc-800 bg-zinc-950/60"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500">
                    <b className="text-zinc-300">{m.nickname}</b>
                    {m.is_admin ? (
                      <span className="ml-2 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                        Restaurant
                      </span>
                    ) : null}
                    {" · "}
                    {fmtTime(m.created_at)}
                    {" · "}
                    <span className="font-mono">{shortDevice(m.device_id)}</span>
                  </div>
                  <div
                    className={`mt-0.5 break-words text-sm ${
                      m.is_deleted ? "italic text-zinc-600" : "text-zinc-200"
                    }`}
                  >
                    {m.is_deleted ? "Nachricht wurde entfernt." : m.body}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {!m.is_admin && !m.is_deleted ? (
                    <button
                      className="rounded-lg border border-red-800 bg-red-950 px-2 py-1 text-xs font-medium text-red-300 hover:border-red-500 disabled:opacity-50"
                      disabled={busy}
                      onClick={() => void banDevice(m.device_id, m.nickname)}
                    >
                      Gerät sperren
                    </button>
                  ) : null}
                  {!m.is_deleted ? (
                    <button
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-500 disabled:opacity-50"
                      disabled={busy}
                      onClick={() => void deleteMessage(m)}
                    >
                      Löschen
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
