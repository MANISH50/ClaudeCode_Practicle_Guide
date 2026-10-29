"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "./spinner";
import { buttonSecondary } from "./ui";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await authClient.signOut();
      router.replace("/sign-in");
      router.refresh();
    });
  }

  return (
    <button type="button" onClick={onClick} disabled={pending} className={`shrink-0 ${buttonSecondary}`}>
      {pending && <Spinner />}
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
