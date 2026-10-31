import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";
import { buttonPrimary, focusRing } from "./ui";

export async function AppHeader() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl backdrop-saturate-150">
      <a
        href="#main"
        className={`sr-only rounded-md bg-surface px-3 py-2 text-sm focus:not-sr-only focus:absolute focus:top-2 focus:left-2 ${focusRing}`}
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className={`group flex items-center gap-2.5 rounded-lg ${focusRing}`}>
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-orange-600 via-orange-700 to-red-800 font-display text-lg font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_6px_16px_-4px_rgb(154_52_18/0.55)] transition duration-300 group-hover:rotate-6 group-hover:scale-110"
          >
            N
          </span>
          <span className="font-display text-2xl font-semibold">
            Next
            <span className="bg-linear-to-r from-orange-700 to-red-800 bg-clip-text text-transparent dark:from-orange-300 dark:to-amber-200">
              Notes
            </span>
          </span>
        </Link>

        {user ? (
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden min-w-0 items-center gap-2 rounded-full border border-border bg-surface/70 py-1 pr-3.5 pl-1 shadow-sm sm:flex">
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-linear-to-br from-orange-600 to-red-800 text-sm font-semibold text-white"
              >
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
              <span className="truncate text-[0.95rem] text-muted" title={user.email}>
                {user.email}
              </span>
            </span>
            <SignOutButton />
          </div>
        ) : (
          <nav aria-label="Account" className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className={`rounded-xl px-4 py-2 text-[0.95rem] font-medium transition hover:bg-orange-600/10 ${focusRing}`}
            >
              Sign in
            </Link>
            <Link href="/sign-in?mode=sign-up" className={buttonPrimary}>
              Get started
            </Link>
          </nav>
        )}
      </div>
      {/* Hairline gradient divider */}
      <div aria-hidden="true" className="h-px bg-linear-to-r from-transparent via-orange-700/30 to-transparent" />
    </header>
  );
}
