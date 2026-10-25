import { requireSession } from "@/lib/session";
import { NotesShell } from "../notes-shell";

export default async function NewNotePage() {
  const session = await requireSession("/notes/new");

  return (
    <NotesShell email={session.user.email}>
      <p>New note page (placeholder)</p>
    </NotesShell>
  );
}
