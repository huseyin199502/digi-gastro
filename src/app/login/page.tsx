import Link from "next/link";
import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold">
            digi<span className="text-amber-400">-gastro</span>
          </Link>
          <p className="mt-2 text-zinc-400">Restaurant-Administration</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
          <LoginForm initialError={sp.error} />
        </div>
      </div>
    </main>
  );
}
