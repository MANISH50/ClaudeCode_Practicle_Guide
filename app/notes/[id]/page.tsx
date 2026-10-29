import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNote } from "@/lib/notes";
import { formatRelative } from "@/lib/relative-time";
import { requireSession } from "@/lib/session";
import { NotesShell } from "../notes-shell";
import { NoteEditor } from "./note-editor";

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = { title: "Note" };

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const session = await requireSession(`/notes/${encodeURIComponent(id)}`);
  // Owner-scoped: another user's id, or a missing one, is a 404.
  const note = getNote(session.user.id, id);
  if (!note) notFound();

  return (
    <NotesShell userId={session.user.id}>
      {/* Remount on each save so the editor starts from the saved note. */}
      <NoteEditor key={note.updatedAt} note={note} editedLabel={formatRelative(note.updatedAt)} />
    </NotesShell>
  );
}
