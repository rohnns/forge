"use client";
import { useState } from "react";
import { ArrowLeft, GitBranch, Globe, Trophy, Loader, Check, Link } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";

type Mode = "choose" | "project" | "hackathon";

const tierInfo = [
  { tier: 3, label: "Top 3 placement · real users", pts: "+3 pts", color: "var(--teal)", border: "rgba(45,212,191,0.4)", bg: "var(--teal-dim)" },
  { tier: 2, label: "Any placement · notable complexity", pts: "+2 pts", color: "#a78bfa", border: "rgba(167,139,250,0.3)", bg: "rgba(167,139,250,0.08)" },
  { tier: 1, label: "Shipped · live repo · demo", pts: "+1 pt", color: "#60a5fa", border: "rgba(96,165,250,0.3)", bg: "rgba(96,165,250,0.08)" },
  { tier: 0, label: "Incomplete · no repo", pts: "+0 pts", color: "var(--muted)", border: "var(--border)", bg: "var(--surface2)" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--surface2)", border: "0.5px solid var(--border2)",
  borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13,
  fontFamily: "inherit", outline: "none", transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-mono, monospace)",
  fontSize: 10, color: "var(--muted)", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.08em",
};

const focus = (e: React.FocusEvent<any>) => (e.target as HTMLElement).style.borderColor = "var(--teal)";
const blur = (e: React.FocusEvent<any>) => (e.target as HTMLElement).style.borderColor = "var(--border2)";

export default function AddProjectPage({ onBack }: { onBack: () => void }) {
  const { user } = useUser();
  const [mode, setMode] = useState<Mode>("choose");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [project, setProject] = useState({ name: "", description: "", github_url: "", demo_url: "", photo_url: "", tech: "" });
  const [hackathon, setHackathon] = useState({ hackathon_name: "", project_name: "", placement: "", description: "", devpost_url: "", github_url: "", photo_url: "", year: "" });

  const submitProject = async () => {
    if (!project.name || !user) return;
    setSaving(true);
    const tier = project.github_url && project.demo_url ? 1 : project.github_url ? 1 : 0;
    await supabase.from("projects").insert({
      user_id: user.id, name: project.name, description: project.description,
      type: "side_project", github_url: project.github_url || null,
      demo_url: project.demo_url || null, photo_url: project.photo_url || null,
      tier, points_awarded: tier, verified: false,
    });
    setSaving(false); setDone(true);
    setTimeout(() => { setDone(false); setMode("choose"); setProject({ name: "", description: "", github_url: "", demo_url: "", photo_url: "", tech: "" }); }, 1800);
  };

  const submitHackathon = async () => {
    if (!hackathon.hackathon_name || !user) return;
    setSaving(true);
    const p = hackathon.placement.toLowerCase();
    const tier = p.includes("1st") || p.includes("first") || p.includes("winner") ? 3
      : p.includes("2nd") || p.includes("3rd") || p.includes("finalist") ? 2
      : p ? 1 : 0;
    await supabase.from("projects").insert({
      user_id: user.id, name: hackathon.project_name || hackathon.hackathon_name,
      hackathon_name: hackathon.hackathon_name, description: hackathon.description,
      type: "hackathon", placement: hackathon.placement || null,
      github_url: hackathon.github_url || null, devpost_url: hackathon.devpost_url || null,
      photo_url: hackathon.photo_url || null, tier, points_awarded: tier, verified: false,
    });
    setSaving(false); setDone(true);
    setTimeout(() => { setDone(false); setMode("choose"); }, 1800);
  };

  if (done) {
    return (
      <div className="page-pad" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--teal-dim)", border: "0.5px solid var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Check size={24} color="var(--teal)" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>submitted!</div>
        <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>pending verification — points awarded soon</div>
      </div>
    );
  }

  return (
    <div className="page-pad" style={{ padding: 32, maxWidth: 600 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={mode === "choose" ? onBack : () => setMode("choose")} style={{
          background: "none", border: "none", cursor: "pointer", color: "var(--muted)",
          display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12, padding: 0,
        }}>
          <ArrowLeft size={14} /> back
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>
          {mode === "choose" ? "add to your score" : mode === "project" ? "add a project" : "add a hackathon"}
        </h1>
      </div>

      {/* CHOOSE */}
      {mode === "choose" && (
        <div>
          <p style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.7, marginBottom: 28 }}>
            Submit projects and hackathon wins to build your score. Tier is assigned automatically based on what you link.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
            {[
              { mode: "project" as Mode, icon: "⬡", title: "side project", desc: "apps, tools, open source, anything shipped" },
              { mode: "hackathon" as Mode, icon: "◈", title: "hackathon", desc: "entries, competitions, build challenges" },
            ].map(opt => (
              <div key={opt.mode} onClick={() => setMode(opt.mode)} style={{
                background: "var(--surface)", border: "0.5px solid var(--border2)", borderRadius: 14,
                padding: 24, cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--teal)"; (e.currentTarget as HTMLElement).style.background = "var(--teal-dim2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}
              >
                <div className="mono" style={{ fontSize: 24, color: "var(--teal)", marginBottom: 12 }}>{opt.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{opt.title}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>// how tiers work</div>
            {tierInfo.map(t => (
              <div key={t.tier} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: t.tier > 0 ? 10 : 0 }}>
                <span className="mono" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, color: t.color, background: t.bg, border: `0.5px solid ${t.border}`, flexShrink: 0 }}>tier {t.tier}</span>
                <span style={{ fontSize: 12, color: "var(--muted2)", flex: 1 }}>{t.label}</span>
                <span className="mono" style={{ fontSize: 11, color: t.color }}>{t.pts}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROJECT FORM */}
      {mode === "project" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>project name *</label>
            <input style={inputStyle} value={project.name} placeholder="e.g. GridSync"
              onChange={e => setProject(p => ({ ...p, name: e.target.value }))} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={labelStyle}>description</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties}
              value={project.description} placeholder="What did you build? What problem does it solve?"
              onChange={e => setProject(p => ({ ...p, description: e.target.value }))} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={labelStyle}>tech stack</label>
            <input style={inputStyle} value={project.tech} placeholder="React, FastAPI, PostgreSQL..."
              onChange={e => setProject(p => ({ ...p, tech: e.target.value }))} onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>// proof of work</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <GitBranch size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input style={{ ...inputStyle, paddingLeft: 34 }} value={project.github_url} placeholder="github.com/username/repo"
                  onChange={e => setProject(p => ({ ...p, github_url: e.target.value }))} onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ position: "relative" }}>
                <Globe size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input style={{ ...inputStyle, paddingLeft: 34 }} value={project.demo_url} placeholder="live demo url"
                  onChange={e => setProject(p => ({ ...p, demo_url: e.target.value }))} onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ position: "relative" }}>
                <Link size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input style={{ ...inputStyle, paddingLeft: 34 }} value={project.photo_url} placeholder="photo / image url (for hardware projects)"
                  onChange={e => setProject(p => ({ ...p, photo_url: e.target.value }))} onFocus={focus} onBlur={blur} />
              </div>
            </div>
            {project.photo_url && (
              <img src={project.photo_url} alt="preview" style={{ width: "100%", borderRadius: 8, marginTop: 10, maxHeight: 160, objectFit: "cover" }} onError={e => (e.currentTarget as HTMLImageElement).style.display = "none"} />
            )}
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10, lineHeight: 1.6 }}>
              {[project.github_url, project.demo_url, project.photo_url].filter(Boolean).length === 0
                ? "no proof linked — tier 0"
                : `${[project.github_url, project.demo_url, project.photo_url].filter(Boolean).length} proof item(s) linked — tier 1`}
            </div>
          </div>

          <button onClick={submitProject} disabled={!project.name || saving} style={{
            padding: "13px", borderRadius: 12, width: "100%",
            background: project.name ? "var(--teal-dim)" : "var(--surface2)",
            border: `0.5px solid ${project.name ? "var(--teal)" : "var(--border)"}`,
            color: project.name ? "var(--teal)" : "var(--muted)",
            fontFamily: "monospace", fontSize: 13, cursor: project.name ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {saving ? <Loader size={14} /> : <Check size={14} />}
            {saving ? "submitting..." : "submit project"}
          </button>
        </div>
      )}

      {/* HACKATHON FORM */}
      {mode === "hackathon" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>hackathon name *</label>
            <input style={inputStyle} value={hackathon.hackathon_name} placeholder="e.g. HackBLR 2024"
              onChange={e => setHackathon(h => ({ ...h, hackathon_name: e.target.value }))} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={labelStyle}>project name</label>
            <input style={inputStyle} value={hackathon.project_name} placeholder="what did you build?"
              onChange={e => setHackathon(h => ({ ...h, project_name: e.target.value }))} onFocus={focus} onBlur={blur} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>placement</label>
              <select style={{ ...inputStyle, cursor: "pointer" } as React.CSSProperties}
                value={hackathon.placement} onChange={e => setHackathon(h => ({ ...h, placement: e.target.value }))} onFocus={focus} onBlur={blur}>
                <option value="">select placement</option>
                <option value="1st place">1st place</option>
                <option value="2nd place">2nd place</option>
                <option value="3rd place">3rd place</option>
                <option value="finalist">finalist</option>
                <option value="top 10">top 10</option>
                <option value="participant">participant</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>year</label>
              <input style={inputStyle} value={hackathon.year} placeholder="2024"
                onChange={e => setHackathon(h => ({ ...h, year: e.target.value }))} onFocus={focus} onBlur={blur} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>description</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties}
              value={hackathon.description} placeholder="What did you build? What was your role?"
              onChange={e => setHackathon(h => ({ ...h, description: e.target.value }))} onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>// proof of participation</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <Globe size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input style={{ ...inputStyle, paddingLeft: 34 }} value={hackathon.devpost_url} placeholder="devpost.com/software/your-project"
                  onChange={e => setHackathon(h => ({ ...h, devpost_url: e.target.value }))} onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ position: "relative" }}>
                <GitBranch size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input style={{ ...inputStyle, paddingLeft: 34 }} value={hackathon.github_url} placeholder="github.com/username/repo"
                  onChange={e => setHackathon(h => ({ ...h, github_url: e.target.value }))} onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ position: "relative" }}>
                <Link size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input style={{ ...inputStyle, paddingLeft: 34 }} value={hackathon.photo_url} placeholder="certificate / photo url"
                  onChange={e => setHackathon(h => ({ ...h, photo_url: e.target.value }))} onFocus={focus} onBlur={blur} />
              </div>
            </div>
            {hackathon.photo_url && (
              <img src={hackathon.photo_url} alt="certificate" style={{ width: "100%", borderRadius: 8, marginTop: 10, maxHeight: 160, objectFit: "cover" }} onError={e => (e.currentTarget as HTMLImageElement).style.display = "none"} />
            )}
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10, lineHeight: 1.6 }}>
              placements are spot-checked against Devpost. link your project page for faster verification.
            </div>
          </div>

          <button onClick={submitHackathon} disabled={!hackathon.hackathon_name || saving} style={{
            padding: "13px", borderRadius: 12, width: "100%",
            background: hackathon.hackathon_name ? "var(--teal-dim)" : "var(--surface2)",
            border: `0.5px solid ${hackathon.hackathon_name ? "var(--teal)" : "var(--border)"}`,
            color: hackathon.hackathon_name ? "var(--teal)" : "var(--muted)",
            fontFamily: "monospace", fontSize: 13, cursor: hackathon.hackathon_name ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {saving ? <Loader size={14} /> : <Trophy size={14} />}
            {saving ? "submitting..." : "submit hackathon"}
          </button>
        </div>
      )}
    </div>
  );
}
