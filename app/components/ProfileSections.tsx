import { Code2, ExternalLink, Plus, Trophy } from "lucide-react";
import { Profile, Project, UserHackathon } from "../lib/supabase";

export function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span className="mono" style={{
      fontSize: 10, padding: "3px 8px", borderRadius: 5,
      color: accent ? "var(--text)" : "var(--muted2)",
      background: accent ? "rgba(255,255,255,0.06)" : "var(--surface2)",
      border: `0.5px solid ${accent ? "var(--border2)" : "var(--border)"}`,
    }}>
      {label}
    </span>
  );
}

function safeExternalUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

function placementLabel(n: number) {
  if (n === 1) return "1st place";
  if (n === 2) return "2nd place";
  if (n === 3) return "3rd place";
  return `#${n}`;
}

export function ProfileHero({ profile }: { profile: Profile }) {
  const initials = profile.avatar_initials ?? profile.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div className="profile-hero" style={{
      background: "var(--surface)", border: "0.5px solid var(--border)",
      borderRadius: 14, padding: 28, display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 20,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 14,
        background: "rgba(255,255,255,0.06)", border: "0.5px solid var(--border2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "monospace", fontSize: 24, fontWeight: 500, color: "var(--text)", flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>{profile.name}</div>
        <div className="mono" style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4 }}>
          {profile.role?.toLowerCase()}{profile.location ? ` · ${profile.location}` : ""}
        </div>
        <p style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.6, marginTop: 10 }}>
          {profile.bio || "no bio yet"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {profile.availability?.map(a => <Tag key={a} label={a.toLowerCase()} accent />)}
          {profile.stack?.map(s => <Tag key={s} label={s.toLowerCase()} />)}
        </div>
        {profile.disciplines?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {profile.disciplines.map(d => <Tag key={d} label={d.toLowerCase()} />)}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="mono" style={{
          display: "inline-block", background: "rgba(255,255,255,0.06)", border: "0.5px solid var(--border2)",
          borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "var(--text)", marginBottom: 8,
        }}>
          lvl {profile.level}
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>{profile.points} pts total</div>
        {profile.github && (
          <a href={safeExternalUrl(profile.github)} target="_blank" rel="noreferrer"
            className="mono" style={{ display: "block", fontSize: 10, color: "var(--muted2)", marginTop: 6 }}>
            github →
          </a>
        )}
        {profile.devpost && (
          <a href={safeExternalUrl(profile.devpost)} target="_blank" rel="noreferrer"
            className="mono" style={{ display: "block", fontSize: 10, color: "var(--muted2)", marginTop: 4 }}>
            devpost →
          </a>
        )}
      </div>
    </div>
  );
}

export function ProfileStats({ profile, projects, hackathons }: { profile: Profile; projects: Project[]; hackathons: UserHackathon[] }) {
  return (
    <div className="profile-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
      {[
        { val: hackathons.length, lbl: "hackathons" },
        { val: hackathons.filter(h => h.placement === 1).length, lbl: "wins" },
        { val: projects.length, lbl: "projects" },
        { val: profile.public_profile_enabled === false ? "off" : "on", lbl: "public" },
      ].map(s => (
        <div key={s.lbl} style={{
          background: "var(--surface)", border: "0.5px solid var(--border)",
          borderRadius: 10, padding: "14px 12px", textAlign: "center",
        }}>
          <div className="mono" style={{ fontSize: 20, fontWeight: 500, color: "var(--text)" }}>{s.val}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.lbl}</div>
        </div>
      ))}
    </div>
  );
}

export function ProfileProjects({ projects, loading, onAddProject }: { projects: Project[]; loading?: boolean; onAddProject?: () => void }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Code2 size={15} color="var(--muted2)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>projects</span>
          <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>({projects.length})</span>
        </div>
        {onAddProject && (
          <button onClick={onAddProject} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
            background: "var(--surface)", border: "0.5px solid var(--border2)",
            borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 11,
            color: "var(--muted2)", transition: "all 0.15s",
          }}>
            <Plus size={11} /> add project
          </button>
        )}
      </div>

      {loading && <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>loading...</div>}
      {!loading && projects.length === 0 && (
        <div style={{ background: "var(--surface)", border: "0.5px dashed var(--border2)", borderRadius: 12, padding: "28px 20px", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>no projects yet</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map(p => (
          <div key={p.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{p.name}</span>
                  {p.status && <Tag label={p.status} />}
                </div>
                {p.description && <p style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6, marginBottom: 10 }}>{p.description}</p>}
                {p.stack?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{p.stack.map(s => <Tag key={s} label={s.toLowerCase()} />)}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color: "var(--muted2)" }}><GithubIcon size={14} /></a>}
                {(p.url || p.demo_url) && <a href={(p.url || p.demo_url)!} target="_blank" rel="noreferrer" style={{ color: "var(--muted2)" }}><ExternalLink size={14} /></a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileHackathons({ hackathons, loading, onAddHackathon }: { hackathons: UserHackathon[]; loading?: boolean; onAddHackathon?: () => void }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy size={15} color="var(--muted2)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>hackathons</span>
          <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>({hackathons.length})</span>
        </div>
        {onAddHackathon && (
          <button onClick={onAddHackathon} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
            background: "var(--surface)", border: "0.5px solid var(--border2)",
            borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 11,
            color: "var(--muted2)", transition: "all 0.15s",
          }}>
            <Plus size={11} /> add hackathon
          </button>
        )}
      </div>

      {!loading && hackathons.length === 0 && (
        <div style={{ background: "var(--surface)", border: "0.5px dashed var(--border2)", borderRadius: 12, padding: "28px 20px", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>no hackathons logged yet</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {hackathons.map(h => (
          <div key={h.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{h.name || h.event_name}</span>
                  {h.placement && <Tag label={placementLabel(h.placement)} accent />}
                </div>
                {h.event_name && h.event_name !== h.name && (
                  <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
                    {h.event_name}{h.date ? ` · ${new Date(h.date).getFullYear()}` : ""}
                  </div>
                )}
                {h.description && <p style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6, marginBottom: 8 }}>{h.description}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {h.stack?.map(s => <Tag key={s} label={s.toLowerCase()} />)}
                  {h.team_size && <Tag label={`${h.team_size} person team`} />}
                </div>
              </div>
              {h.url && <a href={h.url} target="_blank" rel="noreferrer" style={{ color: "var(--muted2)", flexShrink: 0 }}><ExternalLink size={14} /></a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
