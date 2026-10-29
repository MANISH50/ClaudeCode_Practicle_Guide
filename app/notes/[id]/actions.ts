"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { createNoteSchema } from "@/lib/note-schema";
import { updateNote } from "@/lib/notes";
import { requireSession } from "@/lib/session";

export type UpdateNoteState = {
  values: { title: string; content: string };
  errors?: { title?: string[]; content?: string[]; form?: string };
  saved?: boolean;
} | null;

export async function updateNoteAction(_prev: UpdateNoteState, formData: FormData): Promise<UpdateNoteState> {
  // Server Actions are reachable by direct POST, so re-check the session here.
  const session = await requireSession("/dashboard");
  // A crafted request can send any serialisable value instead of FormData.
  if (!(formData instanceof FormData)) {
    return { values: { title: "", content: "" }, errors: { form: "Could not save your note. Please try again." } };
  }

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { values: { title: "", content: "" }, errors: { form: "This note could not be found." } };
  }

  const values = {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
  };

  const parsed = createNoteSchema.safeParse(values);
  if (!parsed.success) {
    const { title, content } = z.flattenError(parsed.error).fieldErrors;
    // Schema messages expose the allowed node types; show users a generic message instead.
    return {
      values,
      errors: { title, content: content && ["Note content is invalid"] },
    };
  }

  let updated: boolean;
  try {
    updated = updateNote(session.user.id, id.data, {
      title: parsed.data.title || null,
      content: parsed.data.content,
    });
  } catch {
    return { values, errors: { form: "Could not save your note. Please try again." } };
  }

  if (!updated) {
    return { values, errors: { form: "This note no longer exists." } };
  }

  refresh(); // re-render the page and sidebar with the saved note
  return { values, saved: true };
}
