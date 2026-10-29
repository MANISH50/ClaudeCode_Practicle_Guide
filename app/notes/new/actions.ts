"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createNoteSchema } from "@/lib/note-schema";
import { createNote } from "@/lib/notes";
import { requireSession } from "@/lib/session";

export type CreateNoteState = {
  values: { title: string; content: string };
  errors?: { title?: string[]; content?: string[]; form?: string };
} | null;

export async function createNoteAction(
  _prev: CreateNoteState,
  formData: FormData,
): Promise<CreateNoteState> {
  // Server Actions are reachable by direct POST, so re-check the session here.
  const session = await requireSession("/notes/new");
  // A crafted request can send any serialisable value instead of FormData.
  if (!(formData instanceof FormData)) {
    return { values: { title: "", content: "" }, errors: { form: "Could not save your note. Please try again." } };
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

  let id: string;
  try {
    id = createNote(session.user.id, {
      title: parsed.data.title || null,
      content: parsed.data.content,
    });
  } catch {
    return { values, errors: { form: "Could not save your note. Please try again." } };
  }

  redirect(`/notes/${id}`); // throws; must stay outside the try/catch
}
