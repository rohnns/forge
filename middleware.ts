import { NextRequest, NextResponse } from "next/server";

// FIX #3: Removed User-Agent blocklist (security theater — trivially bypassed
// by setting any other UA string). Real protections kept below.
// FIX #5: Generate a per-request CSP nonce here in middleware so that
//         'unsafe-inline' can be removed from script-src in production.
//
// Nonce wiring:
//   1. Middleware generates a random nonce and sets it in:
//      a. x-nonce response header — readable by layout.tsx via headers()
//      b. Content-Security-Policy header — nonce-<value> in script-src
//   2. layout.tsx reads headers().get('x-nonce') and applies it to inline
//      <script> tags via the `nonce` prop.
//
// Dev keeps unsafe-eval for HMR/source-maps. Never true in production.

const isDev = process.env.NODE_ENV === "development";

function buildCSP(nonce: string): string {
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
    "font-src 'self' https://fonts.gstatic.com https://api.fontshare.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function middleware(req: NextRequest) {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  const nonce = btoa(
    String.fromCharCode(...bytes)
  );
  const res = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  });

  // Expose nonce to layout.tsx via response header
  res.headers.set("x-nonce", nonce);
  // Set per-request CSP with the nonce
  res.headers.set("Content-Security-Policy", buildCSP(nonce));

  // Protect API routes — require content-type on POST requests
  if (req.method === "POST" && req.nextUrl.pathname.startsWith("/api/")) {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
      return new NextResponse("Invalid content type", { status: 415 });
    }
  }

  // Block path traversal attempts
  if (req.nextUrl.pathname.includes("..") || req.nextUrl.pathname.includes("//")) {
    return new NextResponse("Bad request", { status: 400 });
  }

  return res;
}

export const config = {
  matcher: [
    "/api/(.*)",
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
