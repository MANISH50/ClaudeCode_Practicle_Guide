import { NotesShell } from "@/app/notes/notes-shell";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireSession("/dashboard");

  return (
    <NotesShell email={session.user.email}>
      <p>Dashboard (placeholder)</p>
    </NotesShell>
  );
}
