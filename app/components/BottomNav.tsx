"use client";
import { LayoutGrid, Trophy, BarChart2, User, MessageSquare } from "lucide-react";

const navItems = [
  { id: "match", label: "match", icon: LayoutGrid },
  { id: "hackathons", label: "hacks", icon: Trophy },
  { id: "messages", label: "messages", icon: MessageSquare },
  { id: "score", label: "score", icon: BarChart2 },
  { id: "profile", label: "profile", icon: User },
];

export default function BottomNav({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  return (
    <nav className="bottom-nav" style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "var(--surface)", borderTop: "0.5px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "10px 0 14px", zIndex: 50,
    }}>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer",
            color: isActive ? "var(--teal)" : "var(--muted)", transition: "color 0.15s",
            padding: "4px 12px",
          }}>
            <Icon size={20} />
            <span className="mono" style={{ fontSize: 9 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
