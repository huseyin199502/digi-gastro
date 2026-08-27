"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({
  initialError,
}: {
  initialError?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError || null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (data.success && data.redirect) {
        router.push(data.redirect);
        router.refresh();
        return;
      }
      setError(data.error ?? "Login fehlgeschlagen.");
    } catch {
      setError("Netzwerkfehler — bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      action="/api/auth/login"
      method="POST"
      className="space-y-4"
    >
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-amber-500"
          placeholder="restaurant@example.de"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-amber-500"
          placeholder="••••••••"
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-60"
      >
        {loading ? "Anmelden…" : "Anmelden"}
      </button>
    </form>
  );
}