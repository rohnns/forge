"use client";
import { useState, useEffect } from "react";
import { GitBranch, Trophy, Check, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";
import AddProjectPage from "./AddProjectPage";
import { scoreBreakdown, tierGuide } from "../data/mock";

const tierStyles: Record<number, { color: string; bg: string; border: string }> = {
  3: { color: "var(--teal)", bg: "var(--teal-dim)", border: "rgba(45,212,191,0.4)" },
  2: { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.3)" },
  1: { color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.3)" },
  0: { color: "var(--muted)", bg: "var(--surface2)", border: "var(--border)" },
};

function TierBadge({ tier }: { tier: number }) {
  const s = tierStyles[tier];
  return (
    <span className="mono" style={{
      fontSize: 11, padding: "4px 10px", borderRadius: 6,
      color: s.color, background: s.bg, border: `0.5px solid ${s.border}`,
    }}>
      tier {tier}
    </span>
  );
}

export default function ScorePage() {
  const { user, profile } = useUser();
  const [addingProject, setAddingProject] = useState(false);
  const [userProjects, setUserProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setUserProjects(data ?? []));
  }, [user, addingProject]);

  if (addingProject) return <AddProjectPage onBack={() => setAddingProject(false)} />;

  const total = scoreBreakdown.reduce((a, b) => a + b.pts, 0);

  return (
    <div className="page-pad score-grid-wrapper" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>your score</h1>
        <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          // verified credentials · tier system v0.1
        </p>
      </div>

      <div className="score-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ marginBottom: 28 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>// score breakdown</div>
            <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
              {scoreBreakdown.map(row => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--muted2)", width: 150, flexShrink: 0 }}>{row.label}</span>
                  <div style={{ flex: 1, height: 4, background: "var(--surface2)", borderRadius: 2 }}>
                    <div style={{ height: 4, borderRadius: 2, background: "var(--teal)", width: `${(row.pts / row.max) * 100}%`, transition: "width 0.6s ease" }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--teal)", width: 40, textAlign: "right" }}>{row.pts} pts</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "0.5px solid var(--border)", marginTop: 4 }}>
                <div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--muted2)" }}>total score</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>level {profile?.level ?? 1} engineer</div>
                </div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 500, color: "var(--teal)" }}>{profile?.points ?? total} pts</div>
              </div>
            </div>
          </div>

          <div>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>// tier guide</div>
            <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
              {tierGuide.map(t => (
                <div key={t.tier} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: t.tier > 0 ? 10 : 0 }}>
                  <TierBadge tier={t.tier} />
                  <span className="mono" style={{ fontSize: 11, color: "var(--muted2)", flex: 1 }}>{t.label}</span>
                  <span className="mono" style={{ fontSize: 11, color: tierStyles[t.tier].color }}>{t.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>// your projects</div>

          {userProjects.length === 0 && (
            <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "24px 20px", marginBottom: 12, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
                no projects yet — submit one to start building your score
              </div>
            </div>
          )}

          {userProjects.map((p: any) => (
            <div key={p.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)" }}>{p.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
                    {p.type === "hackathon" ? `hackathon · ${p.hackathon_name ?? ""}` : "side project"} · {new Date(p.created_at).getFullYear()}
                  </div>
                </div>
                <TierBadge tier={p.tier ?? 0} />
              </div>
              {p.description && (
                <p style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6, marginBottom: 12 }}>{p.description}</p>
              )}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                    <GitBranch size={12} /> github
                  </a>
                )}
                {p.placement && (
                  <span className="mono" style={{ fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Trophy size={12} /> {p.placement}
                  </span>
                )}
                {p.verified && (
                  <span className="mono" style={{ fontSize: 10, color: "var(--teal)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Check size={12} /> verified
                  </span>
                )}
                {!p.verified && (
                  <span className="mono" style={{ fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    pending verification
                  </span>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={() => setAddingProject(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              background: "var(--surface2)", border: "0.5px dashed var(--border2)",
              borderRadius: 12, padding: "14px 20px", cursor: "pointer", transition: "all 0.15s",
              fontFamily: "monospace", fontSize: 12, color: "var(--muted)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--teal)"; (e.currentTarget as HTMLElement).style.color = "var(--teal)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
          >
            <Plus size={16} /> add project / hackathon
          </button>
        </div>
      </div>
    </div>
  );
}
