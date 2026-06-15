import type { NextConfig } from "next";

// FIX #5: Removed 'unsafe-inline' and 'unsafe-eval' from script-src.
// Production uses nonce + strict-dynamic (nonce generated per-request in middleware.ts).
// Dev keeps unsafe-eval for HMR only.

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Static fallback CSP — middleware sets a per-request nonce-based CSP
          // for routes it covers. This fallback applies to any routes middleware misses.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'strict-dynamic'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  poweredByHeader: false,
};

export default nextConfig;
