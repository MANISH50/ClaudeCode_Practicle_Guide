import type { Metadata } from "next";
import { card } from "@/app/ui";

type SharePageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = { title: "Shared note" };

export default async function SharedNotePage({ params }: SharePageProps) {
  const { token } = await params;

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-16">
      <p className={`animate-fade-in-up p-8 text-muted ${card}`}>Shared note page (placeholder) for token: {token}</p>
    </main>
  );
}
