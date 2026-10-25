import type { ReactNode } from "react";
import { SignOutButton } from "./sign-out-button";

export function NotesShell({ email, children }: { email: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <span className="text-sm">Signed in as {email}</span>
        <SignOutButton />
      </header>
      {children}
    </div>
  );
}
