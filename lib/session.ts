import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

// Deduplicated per request: layouts and pages can call it without extra DB reads.
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

// Authoritative per-route check. Pass the page's own path so sign-in returns there.
export async function requireSession(callbackUrl: string) {
  const session = await getSession();
  if (!session) redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session;
}
