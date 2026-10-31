import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { card } from "@/app/ui";
import { getSharedNote } from "@/lib/notes";
import { formatRelative } from "@/lib/relative-time";
import { SharedNoteContent } from "./shared-note-content";

type SharePageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Shared note",
  robots: { index: false, follow: false },
};

// Read on every request, so a revoked link stops working at once (SPEC 3.4).
export const dynamic = "force-dynamic";

export default async function SharedNotePage({ params }: SharePageProps) {
  const { token } = await params;
  // Unknown, malformed or revoked tokens all return null and get the same 404.
  const note = getSharedNote(token);
  if (!note) notFound();

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-16">
      <article className={`flex flex-col gap-8 p-6 sm:p-10 ${card}`}>
        <header className="flex flex-col gap-2">
          <p className="text-[0.95rem] text-muted">
            Shared note · read only · updated {formatRelative(note.updatedAt)}
          </p>
          <h1 className="heading text-4xl">{note.title ?? "Untitled note"}</h1>
        </header>
        <SharedNoteContent nodes={note.content.content ?? []} />
      </article>
    </main>
  );
}
