import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../lib/auth";

// FIX #10: app/api/auth-check/ existed as an empty directory — no route.ts.
// Any code calling this endpoint was silently getting a 404.
//
// Returns 200 + { authenticated: true, userId } for valid sessions.
// Returns 401 + { authenticated: false } for unauthenticated requests.

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, userId: user.id }, { status: 200 });
  } catch (err) {
    console.error("auth-check error:", err);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

// HEAD variant — lightweight session check with no response body
export async function HEAD(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    return new NextResponse(null, { status: user ? 200 : 401 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
