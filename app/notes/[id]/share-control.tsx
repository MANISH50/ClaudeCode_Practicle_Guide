"use client";

import { useActionState, useState } from "react";
import { Spinner } from "@/app/spinner";
import { buttonPrimary, buttonSecondary, card, errorText, fieldBase } from "@/app/ui";
import { setSharingAction } from "./share-actions";

type ShareControlProps = { noteId: string; shareToken: string | null };

export function ShareControl({ noteId, shareToken }: ShareControlProps) {
  const [state, formAction, pending] = useActionState(setSharingAction, null);
  const [copied, setCopied] = useState(false);
  const path = shareToken ? `/share/${shareToken}` : null;

  async function copyLink() {
    if (!path) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-labelledby="share-heading" className={`flex flex-col gap-4 p-5 ${card}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="share-heading" className="font-medium">
          Public link <span className="font-normal text-muted">{path ? "is on" : "is off"}</span>
        </h2>

        <form action={formAction}>
          <input type="hidden" name="id" value={noteId} />
          <input type="hidden" name="intent" value={shareToken ? "disable" : "enable"} />
          <button type="submit" disabled={pending} className={shareToken ? buttonSecondary : buttonPrimary}>
            {pending && <Spinner />}
            {pending ? "Updating…" : shareToken ? "Stop sharing" : "Share publicly"}
          </button>
        </form>
      </div>

      {path && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            readOnly
            aria-label="Public link"
            value={path}
            onFocus={(event) => event.currentTarget.select()}
            className={`min-w-0 flex-1 font-mono text-sm ${fieldBase}`}
          />
          <button type="button" onClick={copyLink} className={buttonSecondary}>
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      )}

      {state?.error && (
        <p role="alert" className={`animate-fade-in ${errorText}`}>
          {state.error}
        </p>
      )}
    </section>
  );
}
