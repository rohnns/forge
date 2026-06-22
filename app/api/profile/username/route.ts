import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "../../../lib/auth";
import { isValidUsername, normalizeUsername } from "../../../lib/username";

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const rawUsername = req.nextUrl.searchParams.get("username") ?? "";
  const username = normalizeUsername(rawUsername);
  const valid = isValidUsername(username);

  if (!valid) {
    return NextResponse.json({ username, valid: false, available: false });
  }

  const supabase = adminSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();

  return NextResponse.json({ username, valid: true, available: !data });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { username?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = normalizeUsername(body.username ?? "");
  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  const supabase = adminSupabase();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Username unavailable" }, { status: 409 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, public_profile_enabled: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Could not update username" }, { status: 500 });
  }

  return NextResponse.json({ username });
}
