import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { card, heading } from "../ui";
import { NotesShell } from "./notes-shell";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage() {
  const session = await requireSession("/notes");

  return (
    <NotesShell userId={session.user.id}>
      <h1 className={`text-4xl sm:text-5xl ${heading}`}>All notes</h1>
      <p className={`mt-6 p-6 text-muted ${card}`}>Notes list page (placeholder)</p>
    </NotesShell>
  );
}
