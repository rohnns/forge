"use client";
import { LayoutGrid, Trophy, BarChart2, User, MessageSquare, LogOut } from "lucide-react";
import { useUser } from "../context/UserContext";

const navItems = [
  { id: "match", label: "match", icon: LayoutGrid, section: "discover" },
  { id: "hackathons", label: "hackathons", icon: Trophy, section: "discover" },
  { id: "messages", label: "messages", icon: MessageSquare, section: "you" },
  { id: "score", label: "score", icon: BarChart2, section: "you" },
  { id: "profile", label: "profile", icon: User, section: "you" },
];

export default function Sidebar({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  const { profile, signOut } = useUser();
  const sections = ["discover", "you"];

  const initials = profile?.avatar_initials ?? profile?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <aside style={{
      width: 220, minWidth: 220, background: "var(--surface)",
      borderRight: "0.5px solid var(--border)", display: "flex",
      flexDirection: "column", padding: "24px 0", height: "100vh",
    }}>
      <div style={{ padding: "0 20px 28px", borderBottom: "0.5px solid var(--border)", marginBottom: 20 }}>
        <div style={{ fontFamily: "'Questrial', sans-serif", fontSize: 15, fontWeight: 400, color: "var(--text)" }}>.merge</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>find teammates.</div>
      </div>

      {sections.map(section => (
        <div key={section}>
          <div className="mono" style={{ fontSize: 10, color: "var(--muted)", padding: "16px 20px 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {section}
          </div>
          {navItems.filter(i => i.section === section).map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => onNav(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 20px",
                width: "100%", border: "none",
                background: isActive ? "var(--teal-dim2)" : "transparent",
                borderLeft: `2px solid ${isActive ? "var(--teal)" : "transparent"}`,
                color: isActive ? "var(--teal)" : "var(--muted2)",
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: "var(--font-mono, monospace)", fontSize: 13,
              }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "var(--text)"; (e.currentTarget as HTMLElement).style.background = "var(--teal-dim2)"; }}}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "var(--muted2)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}}
              >
                <Icon size={15} />{item.label}
              </button>
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "0.5px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "var(--teal)", fontFamily: "monospace", fontWeight: 500,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 12, color: "var(--text)" }}>
              {profile?.name?.toLowerCase().replace(" ", ".") ?? "you"}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
              lvl {profile?.level ?? 1} · {profile?.points ?? 0} pts
            </div>
          </div>
          <button onClick={signOut} title="Sign out" style={{
            background: "none", border: "none", cursor: "pointer", color: "var(--muted)",
            display: "flex", alignItems: "center", padding: 4, borderRadius: 6, transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ef4444"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--muted)"}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
