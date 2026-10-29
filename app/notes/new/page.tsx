import type { Metadata } from "next";
import { heading } from "@/app/ui";
import { requireSession } from "@/lib/session";
import { NotesShell } from "../notes-shell";
import { NoteForm } from "./note-form";

export const metadata: Metadata = { title: "New note" };

export default async function NewNotePage() {
  const session = await requireSession("/notes/new");

  return (
    <NotesShell userId={session.user.id}>
      <h1 className={`mb-8 text-4xl sm:text-5xl ${heading}`}>New note</h1>
      <NoteForm />
    </NotesShell>
  );
}
