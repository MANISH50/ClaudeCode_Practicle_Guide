import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { Backdrop } from "@/app/backdrop";
import { AuthForm, type AuthMode } from "./auth-form";

type SearchParams = Promise<{ mode?: string; callbackUrl?: string; created?: string }>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const { mode, callbackUrl, created } = await searchParams;
  const redirectTo = safeRedirectPath(callbackUrl);

  if (await getSession()) redirect(redirectTo);

  const currentMode: AuthMode = mode === "sign-up" ? "sign-up" : "sign-in";

  return (
    <main id="main" className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-lg flex-col justify-center px-4 py-12">
      <Backdrop />
      <div key={currentMode} className="flex animate-fade-in-up flex-col gap-7 rounded-3xl border border-border bg-surface/85 p-7 shadow-[0_24px_60px_-24px_rgb(67_20_7/0.35)] backdrop-blur-md sm:p-10">
        {created === "1" && (
          <p role="status" className="animate-fade-in rounded-xl bg-emerald-500/10 px-4 py-3 text-[0.95rem] text-emerald-700 dark:text-emerald-300">
            Account created. Sign in to continue.
          </p>
        )}
        <AuthForm mode={currentMode} redirectTo={redirectTo} />
      </div>
    </main>
  );
}
