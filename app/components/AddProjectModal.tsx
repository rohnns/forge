"use client";
import { useState, useRef } from "react";
import { X, Plus, Link, Github } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";

interface AddProjectModalProps {
  type: "project" | "hackathon";
  onClose: () => void;
  onSuccess: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--surface2)", border: "0.5px solid var(--border2)",
  borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13,
  fontFamily: "inherit", outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-mono, monospace)",
  fontSize: 10, color: "var(--muted)", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.08em",
};

const TECH_STACK = [
  "React", "Next.js", "Vue", "TypeScript", "Node.js", "Python", "FastAPI",
  "Go", "Rust", "Flutter", "Swift", "Kotlin", "PyTorch", "TensorFlow",
  "PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "Figma", "Arduino",
];

function ProofBadge({ verified }: { verified: boolean }) {
  return (
    <span className="mono" style={{
      fontSize: 9, padding: "2px 7px", borderRadius: 4,
      color: verified ? "var(--teal)" : "var(--muted)",
      background: verified ? "var(--teal-dim)" : "var(--surface2)",
      border: `0.5px solid ${verified ? "rgba(45,212,191,0.3)" : "var(--border)"}`,
    }}>
      {verified ? "proof linked" : "no proof yet"}
    </span>
  );
}

export default function AddProjectModal({ type, onClose, onSuccess }: AddProjectModalProps) {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [stack, setStack] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    url: "",
    github_url: "",
    photo_url: "",
    // project specific
    status: "completed",
    // hackathon specific
    event_name: "",
    placement: "",
    team_size: "",
    date: "",
    devpost_url: "",
  });

  const hasProof = type === "project"
    ? !!(form.github_url.trim() || form.photo_url.trim() || form.url.trim())
    : !!(form.devpost_url.trim() || form.url.trim());

  const toggleStack = (s: string) => {
    setStack(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (type === "project") {
        await supabase.from("projects").insert({
          user_id: user!.id,
          name: form.name,
          description: form.description,
          url: form.url || null,
          github_url: form.github_url || null,
          photo_url: form.photo_url || null,
          stack,
          status: form.status,
        });
      } else {
        await supabase.from("user_hackathons").insert({
          user_id: user!.id,
          name: form.name || form.event_name,
          event_name: form.event_name || form.name,
          description: form.description,
          url: form.devpost_url || form.url || null,
          stack,
          placement: form.placement ? Number(form.placement) : null,
          team_size: form.team_size ? Number(form.team_size) : null,
          date: form.date || null,
        });
      }
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
      zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.15s ease both",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "var(--surface)", border: "0.5px solid var(--border2)",
        borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 520,
        maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column",
        animation: "slideUp 0.22s cubic-bezier(.25,.8,.25,1) both",
      }}>
        {/* Scrollable content */}
        <div style={{ padding: 28, flex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
                add {type === "project" ? "project" : "hackathon"}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
                // {type === "project" ? "showcase your builds" : "log your hackathon history"}
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border2)",
              background: "var(--surface2)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X size={14} color="var(--muted2)" />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>
                {type === "project" ? "project name *" : "project name"}
              </label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={type === "project" ? "e.g. forge — engineer matchmaking" : "e.g. devhacks submission"}
                style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
              />
            </div>

            {/* Hackathon specific */}
            {type === "hackathon" && (
              <>
                <div>
                  <label style={labelStyle}>event name *</label>
                  <input
                    value={form.event_name}
                    onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))}
                    placeholder="e.g. HackMIT 2025"
                    style={inputStyle}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>placement</label>
                    <input
                      type="number" value={form.placement}
                      onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
                      placeholder="1"
                      style={inputStyle}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>team size</label>
                    <input
                      type="number" value={form.team_size}
                      onChange={e => setForm(f => ({ ...f, team_size: e.target.value }))}
                      placeholder="4"
                      style={inputStyle}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>date</label>
                  <input
                    type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: "dark" }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                  />
                </div>

                {/* Hackathon proof */}
                <div style={{
                  background: "var(--surface2)", border: "0.5px solid var(--border2)",
                  borderRadius: 12, padding: "16px 16px 14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      // proof of participation
                    </div>
                    <ProofBadge verified={hasProof} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ ...labelStyle, marginBottom: 4 }}>devpost url</label>
                      <div style={{ position: "relative" }}>
                        <input
                          value={form.devpost_url}
                          onChange={e => setForm(f => ({ ...f, devpost_url: e.target.value }))}
                          placeholder="https://devpost.com/software/..."
                          style={{ ...inputStyle, paddingLeft: 36 }}
                          onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                          onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                        />
                        <Link size={13} color="var(--muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ ...labelStyle, marginBottom: 4 }}>github repo (if open source)</label>
                      <div style={{ position: "relative" }}>
                        <input
                          value={form.github_url}
                          onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
                          placeholder="https://github.com/..."
                          style={{ ...inputStyle, paddingLeft: 36 }}
                          onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                          onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                        />
                        <Github size={13} color="var(--muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                      </div>
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
                    proof is used for tier scoring. unverified hackathons are marked as self-reported.
                  </div>
                </div>
              </>
            )}

            {/* Project status */}
            {type === "project" && (
              <div>
                <label style={labelStyle}>status</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["in progress", "completed", "archived"].map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))} className="mono" style={{
                      fontSize: 11, padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                      border: `0.5px solid ${form.status === s ? "var(--teal)" : "var(--border)"}`,
                      background: form.status === s ? "var(--teal-dim)" : "var(--surface2)",
                      color: form.status === s ? "var(--teal)" : "var(--muted2)",
                      transition: "all 0.12s",
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label style={labelStyle}>description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="what did you build? what problem does it solve?"
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--teal)"}
                onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--border2)"}
              />
            </div>

            {/* Project proof */}
            {type === "project" && (
              <div style={{
                background: "var(--surface2)", border: "0.5px solid var(--border2)",
                borderRadius: 12, padding: "16px 16px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    // proof of work
                  </div>
                  <ProofBadge verified={hasProof} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>github repo</label>
                    <div style={{ position: "relative" }}>
                      <input
                        value={form.github_url}
                        onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
                        placeholder="https://github.com/..."
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                      />
                      <Github size={13} color="var(--muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>live url or demo</label>
                    <div style={{ position: "relative" }}>
                      <input
                        value={form.url}
                        onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                        placeholder="https://yourproject.com"
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                      />
                      <Link size={13} color="var(--muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>photo / image url (hardware builds, demos)</label>
                    <div style={{ position: "relative" }}>
                      <input
                        value={form.photo_url}
                        onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))}
                        placeholder="https://i.imgur.com/... or any image link"
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                      />
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                    </div>
                    {form.photo_url && (
                      <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden", border: "0.5px solid var(--border)", maxHeight: 120 }}>
                        <img src={form.photo_url} alt="preview" style={{ width: "100%", objectFit: "cover", maxHeight: 120 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
                  at least one proof link is recommended for scoring and credibility.
                </div>
              </div>
            )}

            {/* Stack */}
            <div>
              <label style={labelStyle}>tech stack</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {TECH_STACK.map(s => (
                  <button key={s} onClick={() => toggleStack(s)} className="mono" style={{
                    fontSize: 10, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                    border: `0.5px solid ${stack.includes(s) ? "var(--teal)" : "var(--border)"}`,
                    background: stack.includes(s) ? "var(--teal-dim)" : "var(--surface2)",
                    color: stack.includes(s) ? "var(--teal)" : "var(--muted2)",
                    transition: "all 0.1s",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save — sticky at bottom */}
        <div style={{
          padding: "14px 28px 24px",
          borderTop: "0.5px solid var(--border)",
          background: "var(--surface)",
          flexShrink: 0,
        }}>
          <button
            onClick={save}
            disabled={saving || !form.name.trim()}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 12,
              background: !form.name.trim() ? "var(--surface2)" : "var(--teal-dim)",
              border: `0.5px solid ${!form.name.trim() ? "var(--border)" : "var(--teal)"}`,
              color: !form.name.trim() ? "var(--muted)" : "var(--teal)",
              fontFamily: "var(--font-mono)", fontSize: 13,
              cursor: !form.name.trim() ? "not-allowed" : "pointer",
              transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {saving ? "saving..." : (
              <><Plus size={14} /> add {type}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
