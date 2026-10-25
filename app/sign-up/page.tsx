import { redirect } from "next/navigation";

type SearchParams = Promise<{ callbackUrl?: string }>;

// Registration lives on /sign-in in sign-up mode; keep this route for old links.
export default async function SignUpPage({ searchParams }: { searchParams: SearchParams }) {
  const { callbackUrl } = await searchParams;
  const query = new URLSearchParams({ mode: "sign-up" });
  if (callbackUrl) query.set("callbackUrl", callbackUrl);
  redirect(`/sign-in?${query}`);
}
