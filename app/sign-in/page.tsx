import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { AuthForm, type AuthMode } from "./auth-form";

type SearchParams = Promise<{ mode?: string; callbackUrl?: string }>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const { mode, callbackUrl } = await searchParams;
  const redirectTo = safeRedirectPath(callbackUrl);

  if (await getSession()) redirect(redirectTo);

  const currentMode: AuthMode = mode === "sign-up" ? "sign-up" : "sign-in";

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <AuthForm key={currentMode} mode={currentMode} redirectTo={redirectTo} />
    </main>
  );
}
