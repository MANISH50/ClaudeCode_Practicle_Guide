import { requireSession } from "@/lib/session";
import { NotesShell } from "./notes-shell";

export default async function NotesPage() {
  const session = await requireSession("/notes");

  return (
    <NotesShell email={session.user.email}>
      <p>Notes list page (placeholder)</p>
    </NotesShell>
  );
}
