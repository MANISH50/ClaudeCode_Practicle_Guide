import { requireSession } from "@/lib/session";
import { NotesShell } from "../notes-shell";

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const session = await requireSession(`/notes/${encodeURIComponent(id)}`);

  return (
    <NotesShell email={session.user.email}>
      <p>Note editor page (placeholder) for note: {id}</p>
      <p>Share publicly: auto-generated URL /share/{"{token}"} (not implemented yet)</p>
    </NotesShell>
  );
}
