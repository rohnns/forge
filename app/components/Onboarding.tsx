"use client";
import { useState } from "react";
import { Check, ArrowRight, ArrowLeft, GitBranch, Globe } from "lucide-react";

const STACKS = [
  // Web / Frontend
  "React", "Next.js", "Vue", "Angular", "Svelte", "TypeScript", "TailwindCSS",
  // Backend
  "Node.js", "Express", "FastAPI", "Django", "Flask", "Go", "Rust", "Java", "Spring",
  // Mobile
  "Flutter", "React Native", "Swift", "Kotlin",
  // Data / AI / ML
  "Python", "PyTorch", "TensorFlow", "Scikit-learn", "OpenCV", "CUDA",
  // Hardware / Embedded
  "Arduino", "Raspberry Pi", "ESP32", "FPGA", "VHDL", "Verilog", "ARM", "RTOS", "PCB Design", "KiCad",
  // Databases
  "PostgreSQL", "MongoDB", "Redis", "MySQL", "Firebase",
  // DevOps / Infra
  "Docker", "Kubernetes", "AWS", "GCP", "Linux",
  // Design / Other
  "Figma", "SolidWorks", "AutoCAD", "MATLAB", "ROS",
];

const ROLES = [
  // Software
  "Frontend", "Backend", "Fullstack", "ML / AI", "Data Science",
  // Mobile / Systems
  "Mobile", "Systems / Low-level", "DevOps / Infra",
  // Hardware / Engineering
  "Embedded Systems", "Hardware / PCB", "Robotics", "IoT",
  // Other disciplines
  "Mechanical Eng.", "ECE", "Civil / Structural", "Biomedical", "Design / UX",
  "Product", "Security",
];

const DISCIPLINES = [
  "Software", "Hardware", "Robotics", "IoT", "AI / ML",
  "Embedded", "Mechanical", "ECE / Electronics", "Biomedical",
  "Civil / Infra", "Aerospace", "Energy / Sustainability", "Design",
];

const AVAILABILITY = [
  "Open to hackathons",
  "Open to side projects",
  "Open to long-term projects",
  "Open to hardware builds",
  "Open to research collabs",
  "Just browsing",
];

interface OnboardingData {
  name: string;
  role: string;
  location: string;
  bio: string;
  stack: string[];
  disciplines: string[];
  availability: string[];
  github: string;
  devpost: string;
}

function ProgressBar({ step }: { step: number }) {
  const total = 4;
  const current = Math.max(0, step - 1);
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 2, borderRadius: 1,
          background: i <= current ? "var(--teal)" : "var(--surface2)",
          opacity: i < current ? 0.5 : i === current ? 1 : 0.25,
          transition: "all 0.3s",
        }} />
      ))}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mono" style={{
      padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
      border: `0.5px solid ${selected ? "var(--teal)" : "var(--border2)"}`,
      background: selected ? "var(--teal-dim)" : "var(--surface2)",
      color: selected ? "var(--teal)" : "var(--muted2)",
      transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
    }}>
      {selected && <Check size={11} />}
      {label}
    </button>
  );
}

const inputStyle = {
  width: "100%", background: "var(--surface2)", border: "0.5px solid var(--border2)",
  borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 14,
  fontFamily: "inherit", outline: "none", transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-mono, monospace)",
  fontSize: 11, color: "var(--muted)", marginBottom: 8,
  textTransform: "uppercase", letterSpacing: "0.08em",
};

function NavButtons({ onBack, onNext, canNext, nextLabel = "next" }: {
  onBack?: () => void; onNext: () => void; canNext: boolean; nextLabel?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
      {onBack && (
        <button onClick={onBack} style={{
          padding: "12px 20px", borderRadius: 12, border: "0.5px solid var(--border2)",
          background: "var(--surface2)", color: "var(--muted2)", cursor: "pointer",
          fontFamily: "var(--font-mono, monospace)", fontSize: 13,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <ArrowLeft size={14} /> back
        </button>
      )}
      <button onClick={onNext} disabled={!canNext} style={{
        flex: 1, padding: "12px", borderRadius: 12,
        background: canNext ? "var(--teal-dim)" : "var(--surface2)",
        border: `0.5px solid ${canNext ? "var(--teal)" : "var(--border)"}`,
        color: canNext ? "var(--teal)" : "var(--muted)",
        fontFamily: "var(--font-mono, monospace)", fontSize: 13,
        cursor: canNext ? "pointer" : "not-allowed",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all 0.15s",
      }}>
        {nextLabel} <ArrowRight size={14} />
      </button>
    </div>
  );
}

export default function Onboarding({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "", role: "", location: "", bio: "",
    stack: [], disciplines: [], availability: [], github: "", devpost: "",
  });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const toggle = (field: "stack" | "availability" | "disciplines", val: string) => {
    setData(d => ({
      ...d,
      [field]: d[field].includes(val) ? d[field].filter((x: string) => x !== val) : [...d[field], val],
    }));
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, position: "relative",
    }}>
      <div className="dot-bg" />
      <div style={{ width: "100%", maxWidth: 540, position: "relative", zIndex: 1 }}>

        {/* STEP 0 — Intro */}
        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Questrial', sans-serif", fontSize: 30, fontWeight: 400, color: "var(--text)", marginBottom: 8 }}>.merge</div>
            <h1 style={{ fontSize: 30, fontWeight: 600, color: "var(--text)", marginBottom: 12, lineHeight: 1.3 }}>
              find teammates.
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.7, marginBottom: 40, maxWidth: 380, margin: "0 auto 40px" }}>
              match with engineers, designers, and builders who complement your skills. software, hardware, robotics — all disciplines welcome.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>your name</label>
              <input style={inputStyle} placeholder="Arjun K."
                value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
              />
            </div>
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}>where are you based?</label>
              <input style={inputStyle} placeholder="Bangalore, IN"
                value={data.location} onChange={e => setData(d => ({ ...d, location: e.target.value }))}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
              />
            </div>
            <NavButtons onNext={next} canNext={data.name.trim().length > 0} nextLabel="get started" />
          </div>
        )}

        {/* STEP 1 — Role + Discipline + Bio */}
        {step === 1 && (
          <div>
            <ProgressBar step={step} />
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>what do you do?</h2>
            <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>// pick your primary role and disciplines</p>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>primary role</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ROLES.map(r => <Chip key={r} label={r} selected={data.role === r} onClick={() => setData(d => ({ ...d, role: r }))} />)}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>disciplines (pick all that apply)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DISCIPLINES.map(d => <Chip key={d} label={d} selected={data.disciplines.includes(d)} onClick={() => toggle("disciplines", d)} />)}
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>short bio</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties}
                placeholder="I build fast APIs and design PCBs on weekends..."
                value={data.bio} onChange={e => setData(d => ({ ...d, bio: e.target.value }))}
                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--teal)"}
                onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--border2)"}
              />
            </div>
            <NavButtons onBack={back} onNext={next} canNext={data.role.length > 0} />
          </div>
        )}

        {/* STEP 2 — Stack */}
        {step === 2 && (
          <div>
            <ProgressBar step={step} />
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>what's your stack?</h2>
            <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>// tools, languages, frameworks — pick everything you're comfortable with</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {STACKS.map(s => <Chip key={s} label={s} selected={data.stack.includes(s)} onClick={() => toggle("stack", s)} />)}
            </div>
            <NavButtons onBack={back} onNext={next} canNext={data.stack.length > 0} />
          </div>
        )}

        {/* STEP 3 — Availability */}
        {step === 3 && (
          <div>
            <ProgressBar step={step} />
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>what are you looking for?</h2>
            <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>// pick all that apply</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {AVAILABILITY.map(a => <Chip key={a} label={a} selected={data.availability.includes(a)} onClick={() => toggle("availability", a)} />)}
            </div>
            <NavButtons onBack={back} onNext={next} canNext={data.availability.length > 0} />
          </div>
        )}

        {/* STEP 4 — Links */}
        {step === 4 && (
          <div>
            <ProgressBar step={step} />
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>link your work</h2>
            <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>// github is required to verify your identity and score</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6 }}>
                github
                <span style={{ color: "#ef4444", fontSize: 11 }}>required</span>
              </label>
              <div style={{ position: "relative" }}>
                <GitBranch size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input style={{ ...inputStyle, paddingLeft: 38 }} placeholder="github.com/username"
                  value={data.github} onChange={e => setData(d => ({ ...d, github: e.target.value }))}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>devpost (optional)</label>
              <div style={{ position: "relative" }}>
                <Globe size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input style={{ ...inputStyle, paddingLeft: 38 }} placeholder="devpost.com/username"
                  value={data.devpost} onChange={e => setData(d => ({ ...d, devpost: e.target.value }))}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
                />
              </div>
            </div>

            {/* Devpost reminder banner */}
            <div style={{
              background: "rgba(167,139,250,0.08)", border: "0.5px solid rgba(167,139,250,0.3)",
              borderRadius: 10, padding: "12px 14px", marginBottom: 28,
            }}>
              <div className="mono" style={{ fontSize: 11, color: "#a78bfa", marginBottom: 4 }}>// no devpost yet?</div>
              <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6 }}>
                Devpost is free and lets you showcase hackathon projects. Linking it later unlocks higher tier scores.{" "}
                <a href="https://devpost.com" target="_blank" rel="noreferrer" style={{ color: "#a78bfa" }}>create one here →</a>
              </div>
            </div>

            <NavButtons onBack={back} onNext={next} canNext={data.github.trim().length > 0} nextLabel="finish setup" />
          </div>
        )}

        {/* STEP 5 — Done */}
        {step === 5 && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
              background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              you're in, {data.name.split(" ")[0]}.
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.7, marginBottom: 40 }}>
              your profile is live. go find your team.
            </p>
            <button onClick={() => onComplete(data)} style={{
              width: "100%", padding: "14px", borderRadius: 12,
              background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
              color: "var(--teal)", fontFamily: "var(--font-mono, monospace)", fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              start matching <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
