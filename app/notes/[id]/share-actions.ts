"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { disableSharing, enableSharing } from "@/lib/notes";
import { requireSession } from "@/lib/session";

export type ShareState = { error?: string } | null;

// Owner-only: enables or disables public sharing for one note (SPEC 3.4).
export async function setSharingAction(_prev: ShareState, formData: FormData): Promise<ShareState> {
  // Server Actions are reachable by direct POST, so re-check the session here.
  const session = await requireSession("/dashboard");
  // A crafted request can send any serialisable value instead of FormData.
  if (!(formData instanceof FormData)) return { error: "Could not update sharing. Please try again." };

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "This note could not be found." };

  const intent = formData.get("intent");
  if (intent !== "enable" && intent !== "disable") return { error: "Could not update sharing. Please try again." };

  let found: boolean;
  try {
    found =
      intent === "enable" ? enableSharing(session.user.id, id.data) !== null : disableSharing(session.user.id, id.data);
  } catch {
    return { error: "Could not update sharing. Please try again." };
  }

  if (!found) return { error: "This note no longer exists." };

  refresh(); // the page re-renders with the new share state
  return null;
}
