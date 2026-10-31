"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { DeleteNoteButton } from "@/app/notes/delete-note-button";
import { RichTextEditor } from "@/app/notes/new/rich-text-editor";
import { Spinner } from "@/app/spinner";
import { buttonPrimary, buttonSecondary, card, errorText, fieldBase } from "@/app/ui";
import type { NoteDetail } from "@/lib/notes";
import { updateNoteAction } from "./actions";
import { ShareControl } from "./share-control";

type NoteEditorProps = { note: NoteDetail; editedLabel: string };

export function NoteEditor({ note, editedLabel }: NoteEditorProps) {
  const [state, formAction, pending] = useActionState(updateNoteAction, null);
  // The page remounts this component after each save (via key), so these start from the saved note.
  const initialContent = JSON.stringify(note.content);
  const [title, setTitle] = useState(note.title ?? "");
  const [content, setContent] = useState(initialContent);
  const errors = state?.errors;
  const dirty = title !== (note.title ?? "") || content !== initialContent;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex flex-wrap items-center gap-2 text-[0.95rem] text-muted">
          <span className="tabular-nums">Edited {editedLabel}</span>
        </p>
        <DeleteNoteButton id={note.id} title={note.title} className="border border-border" />
      </header>

      <ShareControl noteId={note.id} shareToken={note.shareToken} />

      <form action={formAction} aria-busy={pending} className={`flex flex-col gap-7 p-6 sm:p-8 ${card}`}>
        <input type="hidden" name="id" value={note.id} />

        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-medium">
            Title <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Untitled note"
            aria-invalid={errors?.title ? true : undefined}
            aria-describedby={errors?.title ? "title-error" : undefined}
            className={`font-display text-2xl font-semibold ${fieldBase}`}
          />
          {errors?.title && (
            <p id="title-error" role="alert" className={`animate-fade-in ${errorText}`}>
              {errors.title[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span id="content-label" className="font-medium">
            Content
          </span>
          <RichTextEditor
            labelId="content-label"
            describedById={errors?.content ? "content-error" : undefined}
            invalid={Boolean(errors?.content)}
            initialDoc={note.content}
            onChange={setContent}
          />
          <input type="hidden" name="content" value={content} />
          {errors?.content && (
            <p id="content-error" role="alert" className={`animate-fade-in ${errorText}`}>
              {errors.content[0]}
            </p>
          )}
        </div>

        {errors?.form && (
          <p role="alert" className={`animate-fade-in ${errorText}`}>
            {errors.form}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          <Link href="/dashboard" className={buttonSecondary}>
            Back to notes
          </Link>
          <button type="submit" disabled={pending || !dirty} className={buttonPrimary}>
            {pending && <Spinner />}
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
