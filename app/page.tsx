import Link from "next/link";
import type { CSSProperties } from "react";
import { getSession } from "@/lib/session";
import { Backdrop } from "./backdrop";
import { buttonPrimaryLarge, buttonSecondaryLarge, card, heading } from "./ui";

const FEATURES = [
  { icon: "✍️", title: "Rich text", body: "Headings, lists, inline code and code blocks with a clean toolbar." },
  { icon: "🔒", title: "Private by default", body: "Every note belongs to you. Nothing is public unless you say so." },
  { icon: "🔗", title: "Share with a link", body: "Publish a read-only copy of any note and revoke it at any time." },
];

export default async function Home() {
  const signedIn = Boolean(await getSession());

  return (
    <main id="main" className="mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center sm:py-32">
      <Backdrop />
      <p className="flex animate-fade-in-up items-center gap-2 rounded-full border border-border bg-surface/70 py-1.5 pr-4 pl-1.5 text-sm font-medium text-muted shadow-sm backdrop-blur">
        <span className="rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-2.5 py-0.5 text-xs font-semibold text-white">
          New
        </span>
        Notes that stay out of your way
      </p>
      <h1
        className={`stagger mt-8 max-w-4xl animate-fade-in-up text-5xl leading-[1.05] sm:text-7xl ${heading}`}
        style={{ "--i": 1 } as CSSProperties}
      >
        Think clearly.{" "}
        <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent italic dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-300">
          Write beautifully.
        </span>
      </h1>
      <p
        className="stagger mt-7 max-w-2xl animate-fade-in-up text-xl text-pretty text-muted sm:text-2xl sm:leading-relaxed"
        style={{ "--i": 2 } as CSSProperties}
      >
        NextNotes is a fast, focused place for your ideas, with rich-text editing and one-click sharing.
      </p>
      <div className="stagger mt-12 flex animate-fade-in-up flex-wrap justify-center gap-4" style={{ "--i": 3 } as CSSProperties}>
        {signedIn ? (
          <Link href="/dashboard" className={buttonPrimaryLarge}>
            Go to your notes <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <>
            <Link href="/sign-in?mode=sign-up" className={buttonPrimaryLarge}>
              Get started free <span aria-hidden="true">→</span>
            </Link>
            <Link href="/sign-in" className={buttonSecondaryLarge}>
              Sign in
            </Link>
          </>
        )}
      </div>

      <ul className="mt-24 grid w-full gap-5 text-left sm:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <li
            key={feature.title}
            style={{ "--i": index + 4 } as CSSProperties}
            className={`glow-border stagger animate-fade-in-up p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgb(124_58_237/0.35)] ${card}`}
          >
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-2xl bg-linear-to-br from-indigo-500/15 via-violet-500/20 to-purple-500/25 text-2xl shadow-[inset_0_1px_0_rgb(255_255_255/0.4)]"
            >
              {feature.icon}
            </span>
            <h2 className={`mt-5 text-xl ${heading}`}>{feature.title}</h2>
            <p className="mt-2 text-muted">{feature.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
