import type { CSSProperties } from "react";
import type { NoteSummary } from "@/lib/notes";
import { formatRelative } from "@/lib/relative-time";
import { buttonPrimary, focusRing } from "../ui";
import { DeleteNoteButton } from "./delete-note-button";
import { NavLink } from "./nav-link";

// Right padding leaves room for the delete button.
const linkClass = `relative flex flex-col gap-0.5 rounded-xl py-2.5 pr-11 pl-4 transition duration-200 hover:bg-violet-500/8 aria-[current=page]:bg-linear-to-r aria-[current=page]:from-violet-500/15 aria-[current=page]:to-purple-500/5 aria-[current=page]:shadow-[inset_0_0_0_1px_rgb(139_92_246/0.2)] before:absolute before:inset-y-2.5 before:left-1 before:w-1 before:scale-y-0 before:rounded-full before:bg-linear-to-b before:from-indigo-500 before:to-purple-500 before:transition-transform before:duration-300 aria-[current=page]:before:scale-y-100 ${focusRing}`;

type NotesNavProps = { notes: NoteSummary[]; total: number };

export function NotesNav({ notes, total }: NotesNavProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[0.8rem] font-semibold tracking-[0.14em] text-muted uppercase">Your notes</h2>
        <span className="rounded-full bg-violet-500/12 px-2.5 py-0.5 text-[0.8rem] font-semibold text-accent tabular-nums">
          {total}
        </span>
      </div>

      <NavLink href="/notes/new" className={`w-full ${buttonPrimary}`}>
        <span aria-hidden="true" className="text-lg leading-none">+</span> New note
      </NavLink>

      {notes.length === 0 ? (
        <p className="animate-fade-in rounded-2xl border border-dashed border-border px-4 py-8 text-center text-[0.95rem] text-muted">
          No notes yet. Your saved notes will appear here.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {notes.map((note, index) => (
            <li
              key={note.id}
              style={{ "--i": index } as CSSProperties}
              className="group/item stagger relative animate-fade-in-up"
            >
              <NavLink href={`/notes/${note.id}`} className={linkClass}>
                <span className="flex items-center gap-2">
                  <span className="truncate text-[0.95rem] font-medium">{note.title ?? "Untitled note"}</span>
                  {note.isPublic && (
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" title="Shared publicly">
                      <span className="sr-only">(shared publicly)</span>
                    </span>
                  )}
                </span>
                <time dateTime={note.updatedAt} className="text-[0.8rem] text-muted tabular-nums">
                  {formatRelative(note.updatedAt)}
                </time>
              </NavLink>
              {/* Revealed on hover/focus with a mouse; always visible on touch screens. */}
              <DeleteNoteButton
                id={note.id}
                title={note.title}
                className="absolute top-1/2 right-1.5 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
