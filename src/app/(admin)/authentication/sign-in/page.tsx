import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const query = params.callbackUrl
    ? `?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
    : "";
  redirect(`/auth/signin${query}`);
}
