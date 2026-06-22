"use client";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useUser } from "../context/UserContext";
import { Project, supabase, UserHackathon } from "../lib/supabase";
import EditProfilePage from "./EditProfilePage";
import AddProjectModal from "./AddProjectModal";
import { ProfileHackathons, ProfileHero, ProfileProjects, ProfileStats } from "./ProfileSections";

export default function ProfilePage() {
  const { profile } = useUser();
  const [editing, setEditing] = useState(false);
  const [addModal, setAddModal] = useState<"project" | "hackathon" | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hackathons, setHackathons] = useState<UserHackathon[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  async function fetchUserData() {
    if (!profile?.id) return;
    setLoadingData(true);
    const [{ data: proj }, { data: hacks }] = await Promise.all([
      supabase.from("projects").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("user_hackathons").select("*").eq("user_id", profile.id).order("date", { ascending: false }),
    ]);
    setProjects((proj ?? []) as Project[]);
    setHackathons((hacks ?? []) as UserHackathon[]);
    setLoadingData(false);
  }

  useEffect(() => {
    // Existing client-side Supabase pattern in this codebase fetches page data after profile load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  if (editing) return <EditProfilePage onBack={() => setEditing(false)} />;

  if (!profile) return (
    <div className="page-pad" style={{ padding: 32 }}>
      <div className="mono" style={{ color: "var(--muted)", fontSize: 12 }}>loading profile...</div>
    </div>
  );

  return (
    <div className="page-pad" style={{ padding: 32, paddingBottom: 64, animation: "fadeUp 0.22s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>your profile</h1>
          <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            {"// what others see when they match with you"}
          </p>
        </div>
        <button onClick={() => setEditing(true)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
          background: "var(--surface2)", border: "0.5px solid var(--border2)",
          borderRadius: 10, cursor: "pointer", fontFamily: "monospace", fontSize: 12,
          color: "var(--muted2)", transition: "all 0.15s",
        }}>
          <Pencil size={13} /> edit profile
        </button>
      </div>

      <ProfileHero profile={profile} />
      <ProfileStats profile={profile} projects={projects} hackathons={hackathons} />
      <ProfileProjects projects={projects} loading={loadingData} onAddProject={() => setAddModal("project")} />
      <ProfileHackathons hackathons={hackathons} loading={loadingData} onAddHackathon={() => setAddModal("hackathon")} />

      {addModal && (
        <AddProjectModal
          type={addModal}
          onClose={() => setAddModal(null)}
          onSuccess={fetchUserData}
        />
      )}
    </div>
  );
}
