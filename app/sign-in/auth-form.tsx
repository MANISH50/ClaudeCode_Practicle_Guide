"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/app/spinner";
import { buttonPrimaryLarge, errorText, fieldClass, focusRing, heading } from "@/app/ui";
import { authClient } from "@/lib/auth-client";

export type AuthMode = "sign-in" | "sign-up";

const copy = {
  "sign-in": {
    heading: "Welcome back",
    tagline: "Sign in to pick up where you left off.",
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "No account?",
    switchLabel: "Create one",
    switchMode: "sign-up",
  },
  "sign-up": {
    heading: "Create your account",
    tagline: "Start writing beautiful notes in seconds.",
    submit: "Sign up",
    pending: "Creating account…",
    switchText: "Already registered?",
    switchLabel: "Sign in",
    switchMode: "sign-in",
  },
} as const satisfies Record<AuthMode, unknown>;

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

    if (mode === "sign-up") {
      // No session is created at sign-up (autoSignIn is off), so send the user to sign in.
      router.replace(`/sign-in?created=1&callbackUrl=${encodeURIComponent(redirectTo)}`);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  const switchHref = `/sign-in?mode=${text.switchMode}&callbackUrl=${encodeURIComponent(redirectTo)}`;

  return (
    <>
      <header className="flex flex-col gap-2 text-center">
        <h1 className={`text-4xl ${heading}`}>{text.heading}</h1>
        <p className="text-muted">{text.tagline}</p>
      </header>

      <form onSubmit={onSubmit} aria-busy={pending} className="flex flex-col gap-5">
        {mode === "sign-up" && (
          <label className="flex flex-col gap-2 font-medium">
            Name
            <input
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              className={fieldClass}
              aria-describedby={error ? "auth-error" : undefined}
            />
          </label>
        )}

        <label className="flex flex-col gap-2 font-medium">
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

        <label className="flex flex-col gap-2 font-medium">
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
            <span id="password-hint" className="text-[0.9rem] font-normal text-muted">
              At least 8 characters.
            </span>
          )}
        </label>

        {error && (
          <p id="auth-error" role="alert" className={`animate-fade-in ${errorText}`}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`mt-2 w-full ${buttonPrimaryLarge}`}
        >
          {pending && <Spinner />}
          {pending ? text.pending : text.submit}
        </button>
      </form>

      <p className="text-center text-muted">
        {text.switchText}{" "}
        <Link href={switchHref} className={`rounded-sm font-medium text-accent underline-offset-4 hover:underline ${focusRing}`}>
          {text.switchLabel}
        </Link>
      </p>
    </>
  );
}
