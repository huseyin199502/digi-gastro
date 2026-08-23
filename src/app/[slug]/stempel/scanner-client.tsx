"use client";

import { useCallback, useRef, useState } from "react";

interface Lookup {
  customer_id: number;
  nickname: string;
  tier: string;
  current_stamps: number;
  stamps_required: number;
  reward_name: string;
  card_name: string;
}

export default function ScannerClient({
  slug,
  tenantName,
  logo,
}: {
  slug: string;
  tenantName: string;
  logo: string | null;
}) {
  const [code, setCode] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: string } | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((msg: string, kind: "success" | "reward" | "error" = "success") => {
    setToast({ msg, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  const normalize = (v: string): string =>
    v
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .replace(/O/g, "Q")
      .replace(/I/g, "J")
      .replace(/0/g, "Q")
      .replace(/1/g, "J");

  const lookupCustomer = useCallback(async (raw: string) => {
    const value = normalize(raw);
    setCode(value);
    if (value.length < 3) {
      setLookup(null);
      setNotFound(null);
      return;
    }
    try {
      const res = await fetch(
        `/admin/loyalty/lookup-customer?code=${encodeURIComponent(value)}`
      );
      if (!res.ok) {
        setLookup(null);
        setNotFound(`Kein Kunde mit Code "${value}"`);
        return;
      }
      const data = (await res.json()) as Lookup & { exists?: boolean };
      if (data.exists) {
        setLookup(data);
        setNotFound(null);
      } else {
        setLookup(null);
        setNotFound(`Kein Kunde mit Code "${value}"`);
      }
    } catch {
      showToast("Verbindungsfehler", "error");
    }
  }, [showToast]);

  const awardStamp = async () => {
    if (!lookup || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/admin/loyalty/stamp-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short_code: code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        reward_redeemed?: boolean;
        current_stamps?: number;
        stamps_required?: number;
        reward_name?: string | null;
        customer_nickname?: string;
        detail?: string;
      };
      if (res.ok && data.success) {
        if (data.reward_redeemed) {
          showToast(
            `🎉 ${data.customer_nickname ?? ""}: "${data.reward_name ?? ""}" eingelöst!`,
            "reward"
          );
        } else {
          showToast(`✅ Stempel! ${data.current_stamps}/${data.stamps_required}`);
        }
        await lookupCustomer(code);
      } else {
        showToast(data.detail || "Fehler", "error");
      }
    } catch {
      showToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const redeemReward = async () => {
    if (!lookup || busy) return;
    if (!window.confirm(`Prämie für ${lookup.nickname} einlösen?\nStempel werden auf 0 zurückgesetzt.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/admin/loyalty/redeem/${lookup.customer_id}`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        reward_name?: string;
        detail?: string;
      };
      if (res.ok && data.success) {
        showToast(`🎁 Prämie eingelöst: ${data.reward_name ?? ""}`);
        await lookupCustomer(code);
      } else {
        showToast(data.detail || "Fehler", "error");
      }
    } catch {
      showToast("Verbindungsfehler", "error");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setCode("");
    setLookup(null);
    setNotFound(null);
  };

  const ready = lookup && lookup.current_stamps >= lookup.stamps_required;
  const progress = lookup
    ? Math.min(100, (lookup.current_stamps / lookup.stamps_required) * 100)
    : 0;

  const tierLabel: Record<string, string> = {
    neu: "Neu",
    stamm: "Stammgast",
    vip: "VIP ⭐",
  };

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <header className="mb-6 text-center">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={tenantName} className="mx-auto mb-2 h-16 w-16 rounded-lg object-contain" />
        ) : (
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-800 text-2xl font-bold text-amber-400">
            {tenantName.charAt(0)}
          </div>
        )}
        <h1 className="text-xl font-bold">{tenantName}</h1>
        <p className="text-sm text-zinc-400">Stempel-Konsole</p>
      </header>

      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <label className="mb-1 block text-sm font-medium text-zinc-300">
          Code vom Kunden-Pass
        </label>
        <input
          value={code}
          onChange={(e) => void lookupCustomer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && lookup && !ready) void awardStamp();
          }}
          placeholder="ABCD"
          maxLength={5}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          autoFocus
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-center font-mono text-2xl tracking-widest"
        />
        <p className="mt-1 text-xs text-zinc-500">4-stelliger Code auf der Pass-Rückseite</p>

        {notFound ? (
          <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-center text-red-300">
            ❌ {notFound}
          </div>
        ) : null}

        {lookup ? (
          <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950/60 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-indigo-500"
                style={{
                  background: `conic-gradient(#6366f1 ${progress}%, transparent ${progress}%)`,
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold">
                  {lookup.current_stamps}/{lookup.stamps_required}
                </div>
              </div>
              <div>
                <div className="font-bold">{lookup.nickname}</div>
                <div className="text-xs text-zinc-400">{lookup.card_name}</div>
                <span className="mt-1 inline-block rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">
                  {tierLabel[lookup.tier] ?? lookup.tier}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {ready ? (
                <button
                  onClick={() => void redeemReward()}
                  disabled={busy}
                  className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
                >
                  🎁 Prämie einlösen ({lookup.reward_name})
                </button>
              ) : (
                <button
                  onClick={() => void awardStamp()}
                  disabled={busy}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-40"
                >
                  ⭐ Stempel vergeben
                </button>
              )}
              {lookup ? (
                <button
                  onClick={reset}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Nächster Kunde
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <a href={`/${slug}`} className="mt-4 text-sm text-zinc-500 hover:text-zinc-300">
        ← Zur Speisekarte
      </a>

      {toast ? (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.kind === "error"
              ? "bg-red-600 text-white"
              : toast.kind === "reward"
                ? "bg-amber-500 text-zinc-950"
                : "bg-emerald-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      ) : null}
    </main>
  );
}
