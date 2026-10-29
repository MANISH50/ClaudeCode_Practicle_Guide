"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Spinner } from "@/app/spinner";
import { buttonPrimary, buttonSecondary, card, errorText, fieldBase } from "@/app/ui";
import { createNoteAction } from "./actions";
import { RichTextEditor } from "./rich-text-editor";

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

export function NoteForm() {
  const [state, formAction, pending] = useActionState(createNoteAction, null);
  // Kept in React state (not the form) so the editor content survives a failed save.
  const [content, setContent] = useState(EMPTY_DOC);
  const errors = state?.errors;

  return (
    <form action={formAction} aria-busy={pending} className={`flex flex-col gap-7 p-6 sm:p-8 ${card}`}>
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="font-medium">
          Title <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          placeholder="Give your note a name"
          defaultValue={state?.values.title}
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
          Cancel
        </Link>
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending && <Spinner />}
          {pending ? "Saving…" : "Save note"}
        </button>
      </div>
    </form>
  );
}
