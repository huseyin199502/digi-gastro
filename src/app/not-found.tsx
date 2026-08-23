import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Restaurant nicht gefunden</h1>
        <p className="mt-3 text-zinc-400">
          Diese Speisekarte existiert nicht oder wurde entfernt.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-zinc-950 hover:bg-amber-400"
        >
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}
