"use client";

import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "../spinner";
import { TrashIcon } from "../trash-icon";
import { buttonSecondary, errorText, focusRing } from "../ui";
import { deleteNoteAction } from "./actions";

type DeleteNoteButtonProps = { id: string; title: string | null; className?: string };

export function DeleteNoteButton({ id, title, className = "" }: DeleteNoteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [failed, setFailed] = useState(false);
  const name = title ?? "Untitled note";
  const headingId = useId();

  async function onConfirm(formData: FormData) {
    try {
      const deleted = await deleteNoteAction(formData);
      if (deleted) dialogRef.current?.close();
      else setFailed(true);
    } catch {
      // The action threw instead of returning false; show the same error.
      setFailed(true);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Delete “${name}”`}
        title="Delete note"
        onClick={() => {
          setFailed(false);
          dialogRef.current?.showModal();
        }}
        className={`grid size-8 place-items-center rounded-lg text-muted transition duration-200 hover:bg-red-500/10 hover:text-red-600 active:scale-90 dark:hover:text-red-400 ${focusRing} ${className}`}
      >
        <TrashIcon />
      </button>

      <dialog
        ref={dialogRef}
        closedby="any"
        aria-labelledby={headingId}
        className="modal m-auto w-[min(28rem,calc(100vw-2rem))] rounded-3xl border border-border bg-surface p-7 text-foreground shadow-2xl"
      >
        <div className="flex gap-4">
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <TrashIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id={headingId} className="font-display text-xl font-semibold">
              Delete this note?
            </h2>
            <p className="mt-1.5 break-words text-muted">
              “{name}” will be permanently deleted. This can’t be undone.
            </p>
          </div>
        </div>

        {failed && (
          <p role="alert" className={`mt-4 ${errorText}`}>
            Could not delete this note. It may already be gone. Please refresh and try again.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <form method="dialog">
            <button type="submit" className={buttonSecondary} autoFocus>
              Cancel
            </button>
          </form>
          <form action={onConfirm}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="currentPath" value={pathname} />
            <ConfirmButton />
          </form>
        </div>
      </dialog>
    </>
  );
}

// useFormStatus only reports a pending state from inside the <form>.
function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[0.95rem] font-medium text-white shadow-sm shadow-red-600/25 transition duration-200 hover:bg-red-700 active:scale-[0.98] disabled:opacity-60 ${focusRing}`}
    >
      {pending && <Spinner />}
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
