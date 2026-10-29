"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { deleteNoteSchema } from "@/lib/note-schema";
import { deleteNote } from "@/lib/notes";
import { requireSession } from "@/lib/session";

// Returns false when nothing was deleted (bad id, not the owner, or a DB error).
export async function deleteNoteAction(formData: FormData): Promise<boolean> {
  // Server Actions are reachable by direct POST, so re-check the session here.
  const session = await requireSession("/dashboard");
  // A crafted request can send any serialisable value instead of FormData.
  if (!(formData instanceof FormData)) return false;

  const parsed = deleteNoteSchema.safeParse({
    id: formData.get("id"),
    currentPath: formData.get("currentPath") ?? undefined,
  });
  if (!parsed.success) return false;
  const { id, currentPath } = parsed.data;

  let deleted: boolean;
  try {
    deleted = deleteNote(session.user.id, id);
  } catch {
    return false;
  }

  // The open note is gone; redirect() throws, so it stays outside the try/catch.
  if (deleted && currentPath === `/notes/${id}`) redirect("/dashboard");

  refresh(); // re-render the current page so the sidebar and grid drop the note
  return deleted;
}
