"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function onClick() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <button onClick={onClick} className="rounded border px-3 py-1 text-sm">
      Sign out
    </button>
  );
}
