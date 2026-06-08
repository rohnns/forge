"use client";
import { useState, useRef } from "react";
import { Upload, Check, ArrowLeft, Loader, X, Camera } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";

const STACKS = [
  "React", "Next.js", "Vue", "Angular", "Svelte", "TypeScript", "TailwindCSS",
  "Node.js", "Express", "FastAPI", "Django", "Flask", "Go", "Rust", "Java", "Spring",
  "Flutter", "React Native", "Swift", "Kotlin",
  "Python", "PyTorch", "TensorFlow", "Scikit-learn", "OpenCV", "CUDA",
  "Arduino", "Raspberry Pi", "ESP32", "FPGA", "VHDL", "Verilog", "ARM", "RTOS", "PCB Design", "KiCad",
  "PostgreSQL", "MongoDB", "Redis", "MySQL", "Firebase",
  "Docker", "Kubernetes", "AWS", "GCP", "Linux",
  "Figma", "SolidWorks", "AutoCAD", "MATLAB", "ROS",
];

const ROLES = [
  "Frontend", "Backend", "Fullstack", "ML / AI", "Data Science",
  "Mobile", "Systems / Low-level", "DevOps / Infra",
  "Embedded Systems", "Hardware / PCB", "Robotics", "IoT",
  "Mechanical Eng.", "ECE", "Civil / Structural", "Biomedical", "Design / UX",
  "Product", "Security",
];

const AVAILABILITY = [
  "Open to hackathons", "Open to side projects",
  "Open to long-term projects", "Open to hardware builds",
  "Open to research collabs", "Just browsing",
];

interface ScrapedData {
  projects: any[];
  hackathons: any[];
  certifications: any[];
  suggested_stack: string[];
  suggested_role: string;
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mono" style={{
      padding: "6px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer",
      border: `0.5px solid ${selected ? "var(--teal)" : "var(--border2)"}`,
      background: selected ? "var(--teal-dim)" : "var(--surface2)",
      color: selected ? "var(--teal)" : "var(--muted2)",
      transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5,
    }}>
      {selected && <Check size={10} />}{label}
    </button>
  );
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

export default function EditProfilePage({ onBack }: { onBack: () => void }) {
  const { profile, setProfile } = useUser();
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    role: profile?.role ?? "",
    location: profile?.location ?? "",
    bio: profile?.bio ?? "",
    github: profile?.github ?? "",
    devpost: profile?.devpost ?? "",
    stack: profile?.stack ?? [],
    availability: profile?.availability ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scraped, setScraped] = useState<ScrapedData | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "resume">("profile");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState((profile as any)?.photo_url ?? "");

  const toggle = (field: "stack" | "availability", val: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter((x: string) => x !== val) : [...f[field], val],
    }));
  };

  const save = async () => {
    setSaving(true);
    const updates = { ...form };
    await supabase.from("profiles").update(updates).eq("id", profile!.id);
    setProfile({ ...profile!, ...updates });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    setScraping(true);
    setScrapeError("");
    setScraped(null);

    try {
      // Read file as text (works for .txt resumes)
      // For PDF we extract text client-side using a simple approach
      let text = "";
      if (file.type === "application/pdf") {
        // Convert PDF to base64 and send to API
        const buffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        // Use a simpler approach: read as text and clean up
        text = `[PDF Resume - ${file.name}]\n` + await file.text().catch(() => "Unable to read PDF text directly");
      } else {
        text = await file.text();
      }

      const res = await fetch("/api/scrape-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScraped(data);

      // Auto-apply suggested stack and role
      if (data.suggested_stack?.length > 0) {
        setForm(f => ({ ...f, stack: [...new Set([...f.stack, ...data.suggested_stack])] }));
      }
      if (data.suggested_role) {
        setForm(f => ({ ...f, role: data.suggested_role }));
      }
    } catch (err: any) {
      setScrapeError(err.message ?? "Failed to parse resume");
    }
    setScraping(false);
  };

  const applyProject = async (project: any) => {
    // Save project to Supabase
    await supabase.from("projects").insert({
      user_id: profile!.id,
      name: project.name,
      description: project.description,
      type: "side_project",
      github_url: project.github_url,
      demo_url: project.demo_url,
      tier: 1,
      points_awarded: 1,
    });
    alert(`"${project.name}" added to your score!`);
  };

  const applyHackathon = async (hack: any) => {
    const tier = hack.placement?.includes("1st") ? 3 : hack.placement?.includes("2nd") || hack.placement?.includes("3rd") ? 2 : hack.placement ? 1 : 0;
    await supabase.from("projects").insert({
      user_id: profile!.id,
      name: hack.project ?? hack.name,
      hackathon_name: hack.name,
      type: "hackathon",
      placement: hack.placement,
      tier,
      points_awarded: tier,
    });
    alert(`Hackathon "${hack.name}" added — pending verification!`);
  };

  const tabs = ["profile", "resume"] as const;

  return (
    <div className="page-pad" style={{ padding: 32, maxWidth: 700 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer", color: "var(--muted)",
          display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12,
          padding: 0,
        }}>
          <ArrowLeft size={14} /> back
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>edit profile</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className="mono" style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer",
            border: `0.5px solid ${activeTab === t ? "var(--teal)" : "var(--border)"}`,
            background: activeTab === t ? "var(--teal-dim)" : "var(--surface2)",
            color: activeTab === t ? "var(--teal)" : "var(--muted2)",
          }}>
            {t === "profile" ? "// profile info" : "// resume upload"}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Photo upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 14,
                background: photoPreview ? "transparent" : "var(--teal-dim)",
                border: "0.5px solid var(--teal)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", cursor: "pointer",
              }} onClick={() => photoRef.current?.click()}>
                {photoPreview
                  ? <img src={photoPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontFamily: "monospace", fontSize: 22, color: "var(--teal)", fontWeight: 600 }}>{form.name?.slice(0,2).toUpperCase() || "?"}</span>
                }
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0"}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={async e => {
                  const f = e.target.files?.[0]; if (!f) return;
                  setUploadingPhoto(true);
                  const ext = f.name.split(".").pop();
                  const path = `avatars/${profile!.id}.${ext}`;
                  const { error } = await supabase.storage.from("avatars").upload(path, f, { upsert: true });
                  if (!error) {
                    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
                    const url = data.publicUrl;
                    setPhotoPreview(url);
                    setForm(f2 => ({ ...f2, photo_url: url }));
                  }
                  setUploadingPhoto(false);
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>profile photo</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>click your avatar to upload a photo. jpg, png under 2mb.</div>
              {uploadingPhoto && <div className="mono" style={{ fontSize: 11, color: "var(--teal)", marginTop: 6 }}>uploading...</div>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>name</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
              />
            </div>
            <div>
              <label style={labelStyle}>location</label>
              <input style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>bio</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties}
              value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--teal)"}
              onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--border2)"}
            />
          </div>

          <div>
            <label style={labelStyle}>primary role</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ROLES.map(r => (
                <Chip key={r} label={r} selected={form.role === r} onClick={() => setForm(f => ({ ...f, role: r }))} />
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>stack</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STACKS.map(s => (
                <Chip key={s} label={s} selected={form.stack.includes(s)} onClick={() => toggle("stack", s)} />
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>availability</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {AVAILABILITY.map(a => (
                <Chip key={a} label={a} selected={form.availability.includes(a)} onClick={() => toggle("availability", a)} />
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>github</label>
              <input style={inputStyle} value={form.github} placeholder="github.com/username"
                onChange={e => setForm(f => ({ ...f, github: e.target.value }))}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
              />
            </div>
            <div>
              <label style={labelStyle}>devpost</label>
              <input style={inputStyle} value={form.devpost} placeholder="devpost.com/username"
                onChange={e => setForm(f => ({ ...f, devpost: e.target.value }))}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
              />
            </div>
          </div>

          <button onClick={save} disabled={saving} style={{
            padding: "12px 24px", borderRadius: 10, width: "fit-content",
            background: saved ? "rgba(34,197,94,0.1)" : "var(--teal-dim)",
            border: `0.5px solid ${saved ? "#22c55e" : "var(--teal)"}`,
            color: saved ? "#22c55e" : "var(--teal)",
            fontFamily: "monospace", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
          }}>
            {saving ? <Loader size={14} /> : saved ? <Check size={14} /> : null}
            {saving ? "saving..." : saved ? "saved!" : "save changes"}
          </button>
        </div>
      )}

      {/* RESUME TAB */}
      {activeTab === "resume" && (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            style={{
              border: "0.5px dashed var(--border2)", borderRadius: 12, padding: 40,
              textAlign: "center", cursor: "pointer", transition: "all 0.15s", marginBottom: 24,
              background: scraping ? "var(--teal-dim2)" : "var(--surface2)",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--teal)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"}
          >
            <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" style={{ display: "none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {scraping ? (
              <>
                <Loader size={28} color="var(--teal)" style={{ margin: "0 auto 12px", display: "block" }} />
                <div className="mono" style={{ fontSize: 13, color: "var(--teal)" }}>reading your resume...</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>extracting projects, hackathons, certifications</div>
              </>
            ) : (
              <>
                <Upload size={28} color="var(--muted)" style={{ margin: "0 auto 12px", display: "block" }} />
                <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 4 }}>drop your resume here</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>pdf, txt, doc — we'll extract everything automatically</div>
              </>
            )}
          </div>

          {scrapeError && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <div className="mono" style={{ fontSize: 12, color: "#ef4444" }}>{scrapeError}</div>
            </div>
          )}

          {scraped && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Suggested role/stack applied notice */}
              <div style={{ background: "var(--teal-dim2)", border: "0.5px solid rgba(45,212,191,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--teal)", marginBottom: 4 }}>// auto-applied to your profile</div>
                <div style={{ fontSize: 12, color: "var(--muted2)" }}>
                  Role set to <strong style={{ color: "var(--text)" }}>{scraped.suggested_role}</strong> · {scraped.suggested_stack.length} stack items added
                </div>
                <button onClick={save} className="mono" style={{
                  marginTop: 10, padding: "6px 14px", borderRadius: 8, fontSize: 11,
                  background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
                  color: "var(--teal)", cursor: "pointer",
                }}>
                  save these to profile →
                </button>
              </div>

              {/* Projects */}
              {scraped.projects.length > 0 && (
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    // projects found ({scraped.projects.length})
                  </div>
                  {scraped.projects.map((p, i) => (
                    <div key={i} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4, lineHeight: 1.5 }}>{p.description}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                            {p.tech?.map((t: string) => (
                              <span key={t} className="mono" style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "var(--surface2)", border: "0.5px solid var(--border)", color: "var(--muted2)" }}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => applyProject(p)} className="mono" style={{
                          padding: "6px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer", flexShrink: 0, marginLeft: 12,
                          background: "var(--teal-dim)", border: "0.5px solid var(--teal)", color: "var(--teal)",
                        }}>
                          + add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hackathons */}
              {scraped.hackathons.length > 0 && (
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    // hackathons found ({scraped.hackathons.length})
                  </div>
                  {scraped.hackathons.map((h, i) => (
                    <div key={i} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{h.name}</div>
                          <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                            {h.placement ?? "participant"} {h.year ? `· ${h.year}` : ""}
                          </div>
                        </div>
                        <button onClick={() => applyHackathon(h)} className="mono" style={{
                          padding: "6px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                          background: "var(--teal-dim)", border: "0.5px solid var(--teal)", color: "var(--teal)",
                        }}>
                          + add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {scraped.certifications.length > 0 && (
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    // certifications found ({scraped.certifications.length})
                  </div>
                  {scraped.certifications.map((c, i) => (
                    <div key={i} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{c.name}</div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{c.issuer} {c.year ? `· ${c.year}` : ""}</div>
                      </div>
                      <span className="mono" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, height: "fit-content", background: "rgba(167,139,250,0.08)", border: "0.5px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                        certified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
