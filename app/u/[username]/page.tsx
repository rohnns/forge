import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PublicProfilePage from "../../components/PublicProfilePage";
import { Profile, Project, UserHackathon } from "../../lib/supabase";
import { normalizeUsername } from "../../lib/username";

function serverSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getPublicProfile(usernameParam: string) {
  const username = normalizeUsername(decodeURIComponent(usernameParam));
  if (!username) return null;

  const supabase = serverSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .eq("public_profile_enabled", true)
    .single();

  return (profile ?? null) as Profile | null;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "profile not found · .merge" };

  return {
    title: `${profile.name} · .merge`,
    description: profile.bio || `${profile.name} on .merge`,
  };
}

export default async function PublicUserRoute({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) notFound();

  const supabase = serverSupabase();
  const [{ data: projects }, { data: hackathons }] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("user_hackathons").select("*").eq("user_id", profile.id).order("date", { ascending: false }),
  ]);

  return (
    <PublicProfilePage
      profile={profile}
      projects={(projects ?? []) as Project[]}
      hackathons={(hackathons ?? []) as UserHackathon[]}
    />
  );
}
