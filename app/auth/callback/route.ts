import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// FIX #4: Validate redirect target against an origin allowlist to prevent
// open redirects if the `next` param is ever taken from query params.
// Error messages from Supabase are not forwarded to the client.

const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean));

function isSafeRedirectUrl(url: string, requestOrigin: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.origin === requestOrigin ||
      ALLOWED_ORIGINS.has(parsed.origin)
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  const redirectBase = requestUrl.origin;
  const redirectTarget = isSafeRedirectUrl(`${redirectBase}${next}`, redirectBase)
    ? `${redirectBase}${next}`
    : redirectBase;

  if (!code) {
    return NextResponse.redirect(redirectBase);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth code exchange failed:", error.message);
    return NextResponse.redirect(`${redirectBase}?auth_error=1`);
  }

  return NextResponse.redirect(redirectTarget);
}
