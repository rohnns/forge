"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabase";

export default function DevpostBanner() {
  const { profile, setProfile } = useUser();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already linked or dismissed
  if (dismissed || profile?.devpost) return null;

  const handleDismiss = async () => {
    setDismissed(true);
  };

  const handleLink = async (url: string) => {
    if (!profile || !url.trim()) return;
    const updated = { ...profile, devpost: url.trim() };
    await supabase.from("profiles").update({ devpost: url.trim() }).eq("id", profile.id);
    setProfile(updated);
  };

  return (
    <div style={{
      margin: "12px 20px 0", padding: "12px 16px",
      background: "rgba(167,139,250,0.08)", border: "0.5px solid rgba(167,139,250,0.3)",
      borderRadius: 10, display: "flex", alignItems: "center", gap: 12,
      position: "relative",
    }}>
      <div style={{ flex: 1 }}>
        <span className="mono" style={{ fontSize: 11, color: "#a78bfa" }}>// devpost not linked — </span>
        <span style={{ fontSize: 12, color: "var(--muted2)" }}>
          link your Devpost to unlock tier scoring and verified hackathon wins.{" "}
        </span>
        <a href="https://devpost.com" target="_blank" rel="noreferrer"
          style={{ fontSize: 12, color: "#a78bfa", textDecoration: "none" }}>
          create one free →
        </a>
      </div>
      <button onClick={handleDismiss} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--muted)", flexShrink: 0, padding: 4,
      }}>
        <X size={14} />
      </button>
    </div>
  );
}
