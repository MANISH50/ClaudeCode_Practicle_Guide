"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export type AuthMode = "sign-in" | "sign-up";

const copy = {
  "sign-in": {
    heading: "Sign in",
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "No account?",
    switchLabel: "Create one",
    switchMode: "sign-up",
  },
  "sign-up": {
    heading: "Create account",
    submit: "Sign up",
    pending: "Creating account…",
    switchText: "Already registered?",
    switchLabel: "Sign in",
    switchMode: "sign-in",
  },
} as const satisfies Record<AuthMode, unknown>;

const fieldClass =
  "rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-500 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900";

export function AuthForm({ mode, redirectTo }: { mode: AuthMode; redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const text = copy[mode];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({ name: String(form.get("name")), email, password })
        : await authClient.signIn.email({ email, password });

    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Something went wrong. Please try again.");
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  const switchHref = `/sign-in?mode=${text.switchMode}&callbackUrl=${encodeURIComponent(redirectTo)}`;

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-balance">{text.heading}</h1>
      </header>

      <form onSubmit={onSubmit} aria-busy={pending} className="flex flex-col gap-4">
        {mode === "sign-up" && (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Name
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              className={fieldClass}
              aria-describedby={error ? "auth-error" : undefined}
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={fieldClass}
            aria-describedby={error ? "auth-error" : undefined}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            minLength={mode === "sign-up" ? 8 : undefined}
            required
            className={fieldClass}
            aria-describedby={
              mode === "sign-up" ? "password-hint" : error ? "auth-error" : undefined
            }
          />
          {mode === "sign-up" && (
            <span id="password-hint" className="font-normal text-neutral-600">
              At least 8 characters.
            </span>
          )}
        </label>

        {error && (
          <p id="auth-error" role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-2 font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {pending ? text.pending : text.submit}
        </button>
      </form>

      <p className="text-sm text-neutral-700">
        {text.switchText}{" "}
        <Link href={switchHref} className="font-medium underline underline-offset-4">
          {text.switchLabel}
        </Link>
      </p>
    </>
  );
}
