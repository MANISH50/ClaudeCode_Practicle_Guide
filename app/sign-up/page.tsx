"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const { error } = await authClient.signUp.email({
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) {
      setError(error.message ?? "Could not sign up");
      return;
    }
    router.push("/notes");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sign up</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input name="name" placeholder="Name" required className="rounded border p-2" />
        <input name="email" type="email" placeholder="Email" required className="rounded border p-2" />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 characters)"
          minLength={8}
          required
          className="rounded border p-2"
        />
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button disabled={pending} className="rounded bg-black p-2 text-white disabled:opacity-50">
          {pending ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Have an account? <Link href="/sign-in" className="underline">Sign in</Link>
      </p>
    </main>
  );
}
