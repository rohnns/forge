import Link from "next/link";
import { Profile, Project, UserHackathon } from "../lib/supabase";
import { ProfileHackathons, ProfileHero, ProfileProjects, ProfileStats } from "./ProfileSections";

export default function PublicProfilePage({
  profile,
  projects,
  hackathons,
}: {
  profile: Profile;
  projects: Project[];
  hackathons: UserHackathon[];
}) {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <div className="dot-bg" />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 72px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <Link href="/" style={{ color: "var(--text)", textDecoration: "none", fontFamily: "'Questrial', sans-serif", fontSize: 22 }}>
            .merge
          </Link>
          <div className="mono" style={{ color: "var(--muted)", fontSize: 12 }}>
            /u/{profile.username}
          </div>
        </header>

        <ProfileHero profile={profile} />
        <ProfileStats profile={profile} projects={projects} hackathons={hackathons} />
        <ProfileProjects projects={projects} loading={false} />
        <ProfileHackathons hackathons={hackathons} loading={false} />
      </div>
    </main>
  );
}
