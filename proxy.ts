import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

// Optimistic check: only looks for the session cookie. The authoritative
// check is `requireSession` in each protected page (lib/session.ts).
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set(
    "callbackUrl",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*"],
};
