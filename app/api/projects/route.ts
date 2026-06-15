import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../lib/auth";
import { sanitizeText, sanitizeUrl, isValidGithubUrl, isValidDevpostUrl } from "../../lib/sanitize";
import { createClient } from "@supabase/supabase-js";

// FIX #7: Tier calculation moved server-side.
// The original AddProjectPage.tsx calculated `tier` on the client and sent it
// directly to Supabase. The DB trigger only blocked tier changes on UPDATE —
// a crafted INSERT with tier:3 bypassed it entirely.
// Now the client sends raw data; this route calculates tier authoritatively.

function calculateProjectTier(github_url: string | null, demo_url: string | null): number {
  if (github_url && demo_url) return 1;
  if (github_url) return 1;
  return 0;
}

function calculateHackathonTier(placement: string): number {
  const p = placement.toLowerCase();
  if (p.includes("1st") || p.includes("first") || p.includes("winner")) return 3;
  if (p.includes("2nd") || p.includes("3rd") || p.includes("finalist")) return 2;
  if (p) return 1;
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { type } = body;
    if (type !== "side_project" && type !== "hackathon") {
      return NextResponse.json({ error: "Invalid project type" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (type === "side_project") {
      const { name, description, github_url, demo_url, photo_url } = body;
      if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Project name required" }, { status: 400 });
      }
      const safeGithub = github_url && isValidGithubUrl(github_url) ? sanitizeUrl(github_url) : null;
      const safeDemo = demo_url ? sanitizeUrl(demo_url) : null;
      const safePhoto = photo_url ? sanitizeUrl(photo_url) : null;
      const tier = calculateProjectTier(safeGithub, safeDemo);
      const { error } = await supabase.from("projects").insert({
        user_id: user.id,
        name: sanitizeText(name, 200),
        description: sanitizeText(description ?? "", 1000),
        type: "side_project",
        github_url: safeGithub,
        demo_url: safeDemo,
        photo_url: safePhoto,
        tier,
        points_awarded: tier,
        verified: false,
      });
      if (error) throw error;
      return NextResponse.json({ success: true, tier });
    }

    if (type === "hackathon") {
      const { hackathon_name, project_name, placement, description, devpost_url, github_url, photo_url, year } = body;
      if (!hackathon_name || typeof hackathon_name !== "string") {
        return NextResponse.json({ error: "Hackathon name required" }, { status: 400 });
      }
      const safeDevpost = devpost_url && isValidDevpostUrl(devpost_url) ? sanitizeUrl(devpost_url) : null;
      const safeGithub = github_url && isValidGithubUrl(github_url) ? sanitizeUrl(github_url) : null;
      const safePhoto = photo_url ? sanitizeUrl(photo_url) : null;
      const tier = calculateHackathonTier(placement ?? "");
      const { error } = await supabase.from("projects").insert({
        user_id: user.id,
        name: sanitizeText(project_name || hackathon_name, 200),
        hackathon_name: sanitizeText(hackathon_name, 200),
        description: sanitizeText(description ?? "", 1000),
        type: "hackathon",
        placement: sanitizeText(placement ?? "", 50) || null,
        github_url: safeGithub,
        devpost_url: safeDevpost,
        photo_url: safePhoto,
        year: year ? String(year).slice(0, 4) : null,
        tier,
        points_awarded: tier,
        verified: false,
      });
      if (error) throw error;
      return NextResponse.json({ success: true, tier });
    }
  } catch (err) {
    console.error("Project submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
