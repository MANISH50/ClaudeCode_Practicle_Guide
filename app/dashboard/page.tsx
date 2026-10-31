import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { DeleteNoteButton } from "@/app/notes/delete-note-button";
import { NotesShell } from "@/app/notes/notes-shell";
import { buttonPrimary, card, focusRing, heading } from "@/app/ui";
import { countNotes, listNotes } from "@/lib/notes";
import { formatRelative } from "@/lib/relative-time";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession("/dashboard");
  const notes = listNotes(session.user.id);
  const total = countNotes(session.user.id);
  const firstName = session.user.name.split(" ")[0];

  return (
    <NotesShell userId={session.user.id}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.95rem] font-medium text-accent">Welcome back{firstName && `, ${firstName}`}</p>
          <h1 className={`mt-1 text-4xl sm:text-5xl ${heading}`}>Your notes</h1>
          <p className="mt-2 text-muted">
            {total === 0
              ? "A quiet place for your ideas."
              : `${total} ${total === 1 ? "note" : "notes"}, newest first.${total > notes.length ? ` Showing the ${notes.length} most recent.` : ""}`}
          </p>
        </div>
        <Link href="/notes/new" className={buttonPrimary}>
          <span aria-hidden="true">+</span> New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className={`mt-10 flex flex-col items-center gap-5 px-6 py-20 text-center ${card}`}>
          <span
            aria-hidden="true"
            className="grid size-20 animate-[float_6s_ease-in-out_infinite] place-items-center rounded-3xl bg-linear-to-br from-orange-500/15 via-amber-500/20 to-rose-500/20 text-4xl shadow-[inset_0_1px_0_rgb(255_255_255/0.4)]"
          >
            ✍️
          </span>
          <h2 className={`text-2xl ${heading}`}>No notes yet</h2>
          <p className="max-w-md text-muted">
            Capture your first idea. Headings, lists and code blocks are all one click away.
          </p>
          <Link href="/notes/new" className={buttonPrimary}>
            Write your first note
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note, index) => (
            <li key={note.id} style={{ "--i": index } as CSSProperties} className="stagger relative animate-fade-in-up">
              <Link
                href={`/notes/${note.id}`}
                className={`glow-border group flex h-full min-h-44 flex-col gap-4 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgb(154_52_18/0.35)] ${card} ${focusRing}`}
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-10 rounded-full bg-linear-to-r from-orange-600 via-amber-500 to-orange-400 transition-all duration-500 group-hover:w-20"
                />
                <h2 className={`line-clamp-2 pr-8 text-xl leading-snug ${heading}`}>{note.title ?? "Untitled note"}</h2>
                <div className="mt-auto flex items-center justify-between gap-2 text-sm text-muted">
                  <time dateTime={note.updatedAt} className="tabular-nums">Edited {formatRelative(note.updatedAt)}</time>
                  {note.isPublic && (
                    <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                      Public
                    </span>
                  )}
                </div>
              </Link>
              <DeleteNoteButton id={note.id} title={note.title} className="absolute top-4 right-4" />
            </li>
          ))}
        </ul>
      )}
    </NotesShell>
  );
}
