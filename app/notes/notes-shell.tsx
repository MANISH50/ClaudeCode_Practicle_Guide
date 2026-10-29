import type { ReactNode } from "react";
import { countNotes, listNotes } from "@/lib/notes";
import { buttonSecondary } from "../ui";
import { NotesNav } from "./notes-nav";

const DRAWER_ID = "notes-drawer";

// Layout for signed-in pages: notes sidebar (a popover drawer on mobile) + main.
export function NotesShell({ userId, children }: { userId: string; children: ReactNode }) {
  const notes = listNotes(userId);
  const total = countNotes(userId);

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 sm:px-6">
      {/* Soft violet glow behind the top of the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(60%_50%_at_50%_0%,rgb(139_92_246/0.14),transparent)]"
      />

      <nav
        aria-label="Your notes"
        className="sticky top-18 hidden h-[calc(100dvh-4.5rem)] w-68 shrink-0 overflow-y-auto border-r border-border/70 py-8 pr-5 md:block"
      >
        <NotesNav notes={notes} total={total} />
      </nav>

      <nav
        id={DRAWER_ID}
        popover="auto"
        aria-label="Your notes"
        className="drawer fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-80 max-w-[85vw] overflow-y-auto border-0 border-r border-border bg-surface p-5 text-foreground shadow-2xl md:hidden"
      >
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            popoverTarget={DRAWER_ID}
            popoverTargetAction="hide"
            className={buttonSecondary}
          >
            Close<span className="sr-only"> notes menu</span>
          </button>
        </div>
        <NotesNav notes={notes} total={total} />
      </nav>

      <main id="main" className="min-w-0 flex-1 py-10">
        <button
          type="button"
          popoverTarget={DRAWER_ID}
          className={`mb-6 md:hidden ${buttonSecondary}`}
        >
          <span aria-hidden="true">☰</span> Your notes
          <span className="text-muted tabular-nums">({total})</span>
        </button>
        <div className="animate-fade-in-up">{children}</div>
      </main>
    </div>
  );
}
