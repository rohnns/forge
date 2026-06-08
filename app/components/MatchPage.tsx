"use client";
import { useState, useEffect } from "react";
import { X, Check, Zap, SlidersHorizontal } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";

function LevelBadge({ level }: { level: number }) {
  return (
    <div className="mono" style={{
      background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
      borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "var(--teal)", whiteSpace: "nowrap",
    }}>
      lvl {level}
    </div>
  );
}

function Tag({ label, teal }: { label: string; teal?: boolean }) {
  return (
    <span className="mono" style={{
      fontSize: 10, padding: "3px 8px", borderRadius: 5,
      color: teal ? "var(--teal)" : "var(--muted2)",
      background: teal ? "var(--teal-dim2)" : "var(--surface2)",
      border: `0.5px solid ${teal ? "rgba(45,212,191,0.3)" : "var(--border)"}`,
    }}>{label}</span>
  );
}

function EmptyState() {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "var(--surface)",
      border: "0.5px solid var(--border)", borderRadius: 16,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 12, padding: 32, textAlign: "center",
      animation: "fadeUp 0.3s ease both",
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.2">
        <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
      </svg>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>you've seen everyone</div>
      <div className="mono" style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
        no more engineers in your range right now.<br />check back soon.
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--teal)", marginTop: 8 }}>
        // invite friends to grow the pool faster
      </div>
    </div>
  );
}

interface FilterState {
  location: string;
  roles: string[];
  availability: string[];
  levelMin: number;
  levelMax: number;
}

const ALL_ROLES = [
  "Frontend", "Backend", "Fullstack", "ML / AI", "Data Science",
  "Mobile", "Systems / Low-level", "DevOps / Infra", "Embedded Systems",
  "Hardware / PCB", "Robotics", "IoT", "Design / UX", "Product",
];

const ALL_AVAIL = [
  "Open to hackathons", "Open to side projects",
  "Open to long-term projects", "Open to hardware builds",
  "Open to research collabs",
];

function FilterModal({ filters, onApply, onClose }: {
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<FilterState>({ ...filters });

  const toggleArr = (field: "roles" | "availability", val: string) => {
    setDraft(d => ({
      ...d,
      [field]: d[field].includes(val) ? d[field].filter(x => x !== val) : [...d[field], val],
    }));
  };

  const reset = () => setDraft({
    location: "", roles: [], availability: [], levelMin: 1, levelMax: 5,
  });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
      zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.15s ease both",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "var(--surface)", border: "0.5px solid var(--border2)",
        borderRadius: "16px 16px 0 0", padding: 28, width: "100%", maxWidth: 480,
        maxHeight: "85vh", overflowY: "auto",
        paddingBottom: 100, // room for bottom nav + apply button
        animation: "slideUp 0.22s cubic-bezier(.25,.8,.25,1) both",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>filter engineers</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>// narrow your feed</div>
          </div>
          <button onClick={reset} className="mono" style={{
            fontSize: 11, color: "var(--teal)", cursor: "pointer",
            background: "none", border: "none", padding: 0,
          }}>reset all</button>
        </div>

        {/* Location */}
        <div style={{ marginBottom: 24 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            // location
          </div>
          <input
            value={draft.location}
            onChange={e => setDraft(d => ({ ...d, location: e.target.value }))}
            placeholder="city, country, or remote"
            style={{
              width: "100%", background: "var(--surface2)", border: "0.5px solid var(--border2)",
              borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13,
              fontFamily: "inherit", outline: "none",
            }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--teal)"}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border2)"}
          />
        </div>

        {/* Level range */}
        <div style={{ marginBottom: 24 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            // level range &nbsp;<span style={{ color: "var(--teal)" }}>{draft.levelMin} – {draft.levelMax}</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--muted)", width: 30 }}>min</span>
            <input type="range" min={1} max={5} value={draft.levelMin}
              onChange={e => setDraft(d => ({ ...d, levelMin: Math.min(Number(e.target.value), d.levelMax) }))}
              style={{ flex: 1, accentColor: "var(--teal)" }}
            />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--muted)", width: 30 }}>max</span>
            <input type="range" min={1} max={5} value={draft.levelMax}
              onChange={e => setDraft(d => ({ ...d, levelMax: Math.max(Number(e.target.value), d.levelMin) }))}
              style={{ flex: 1, accentColor: "var(--teal)" }}
            />
          </div>
        </div>

        {/* Roles */}
        <div style={{ marginBottom: 24 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            // discipline
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_ROLES.map(r => (
              <button key={r} onClick={() => toggleArr("roles", r)} className="mono" style={{
                fontSize: 11, padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                border: `0.5px solid ${draft.roles.includes(r) ? "var(--teal)" : "var(--border)"}`,
                background: draft.roles.includes(r) ? "var(--teal-dim)" : "var(--surface2)",
                color: draft.roles.includes(r) ? "var(--teal)" : "var(--muted2)",
                transition: "all 0.12s",
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div style={{ marginBottom: 32 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            // availability
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ALL_AVAIL.map(a => (
              <button key={a} onClick={() => toggleArr("availability", a)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                borderRadius: 10, cursor: "pointer", textAlign: "left",
                border: `0.5px solid ${draft.availability.includes(a) ? "var(--teal)" : "var(--border)"}`,
                background: draft.availability.includes(a) ? "var(--teal-dim)" : "var(--surface2)",
                transition: "all 0.12s",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `0.5px solid ${draft.availability.includes(a) ? "var(--teal)" : "var(--border2)"}`,
                  background: draft.availability.includes(a) ? "var(--teal)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {draft.availability.includes(a) && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5l2 2 4-4" stroke="var(--bg)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="mono" style={{ fontSize: 11, color: draft.availability.includes(a) ? "var(--teal)" : "var(--muted2)" }}>
                  {a.toLowerCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Apply — sticky so it's always visible */}
        <div style={{
          position: "sticky", bottom: 0,
          background: "var(--surface)",
          paddingTop: 12, paddingBottom: 4,
          marginTop: 8,
        }}>
          <button onClick={() => { onApply(draft); onClose(); }} style={{
            width: "100%", padding: "13px 0", borderRadius: 12,
            background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
            color: "var(--teal)", fontFamily: "var(--font-mono)", fontSize: 13,
            cursor: "pointer", fontWeight: 500, transition: "all 0.15s",
          }}>
            apply filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MatchPage({ onNav }: { onNav?: (page: string) => void }) {
  const { user, profile } = useUser();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [swipeDir, setSwipeDir] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [matchedName, setMatchedName] = useState("");
  const [matchedUserId, setMatchedUserId] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: "", roles: [], availability: [], levelMin: 1, levelMax: 5,
  });
  const [loading, setLoading] = useState(true);
  const [cardKey, setCardKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchProfiles();
    loadSeenIds();
  }, [user]);

  const loadSeenIds = async () => {
    const stored = localStorage.getItem(`forge_seen_${user?.id}`);
    const localSeen: string[] = stored ? JSON.parse(stored) : [];
    const { data } = await supabase.from("matches").select("user_b").eq("user_a", user!.id);
    const dbSeen = data?.map((m: any) => m.user_b) ?? [];
    const merged = new Set([...localSeen, ...dbSeen]);
    setSeenIds(merged);
    localStorage.setItem(`forge_seen_${user?.id}`, JSON.stringify([...merged]));
  };

  const saveSeenId = (id: string) => {
    const newSeen = new Set([...seenIds, id]);
    setSeenIds(newSeen);
    localStorage.setItem(`forge_seen_${user?.id}`, JSON.stringify([...newSeen]));
  };

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").neq("id", user!.id);
    setProfiles(data ?? []);
    setLoading(false);
  };

  const activeFilterCount = [
    filters.location,
    ...filters.roles,
    ...filters.availability,
    filters.levelMin > 1 || filters.levelMax < 5 ? "level" : "",
  ].filter(Boolean).length;

  const unseenProfiles = profiles.filter(p => {
    if (seenIds.has(p.id)) return false;
    if (filters.location && !p.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.roles.length > 0 && !filters.roles.some(r => p.role?.toLowerCase().includes(r.toLowerCase()))) return false;
    if (filters.availability.length > 0 && !filters.availability.some(a => p.availability?.includes(a))) return false;
    if (p.level < filters.levelMin || p.level > filters.levelMax) return false;
    return true;
  });

  const current = unseenProfiles[0];
  const next = unseenProfiles[1];

  const swipe = async (dir: "left" | "right") => {
    if (!current) return;
    setSwipeDir(dir);
    const swipedName = current.name;
    const swipedId = current.id;

    setTimeout(async () => {
      setSwipeDir(null);
      setCardKey(k => k + 1);
      saveSeenId(swipedId);

      if (dir === "right") {
        await supabase.from("matches").upsert({
          user_a: user!.id,
          user_b: swipedId,
          status: "pending",
        });
        setMatchedName(swipedName);
        setMatchedUserId(swipedId);
        setShowModal(true);
      }
    }, 380);
  };

  if (loading) {
    return (
      <div className="page-pad" style={{ padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>find your team</h1>
        </div>
        <div className="mono" style={{ color: "var(--muted)", fontSize: 12 }}>loading engineers...</div>
      </div>
    );
  }

  return (
    <div className="page-pad" style={{ padding: 32 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>find your team</h1>
          <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            // {unseenProfiles.length} engineers available
          </p>
        </div>
        <button
          onClick={() => setShowFilter(true)}
          style={{
            position: "relative", width: 40, height: 40, borderRadius: 10,
            background: activeFilterCount > 0 ? "var(--teal-dim)" : "var(--surface)",
            border: `0.5px solid ${activeFilterCount > 0 ? "var(--teal)" : "var(--border2)"}`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", flexShrink: 0,
          }}
        >
          <SlidersHorizontal size={16} color={activeFilterCount > 0 ? "var(--teal)" : "var(--muted2)"} />
          {activeFilterCount > 0 && (
            <div style={{
              position: "absolute", top: -5, right: -5,
              width: 16, height: 16, borderRadius: "50%",
              background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="mono" style={{ fontSize: 9, color: "var(--bg)", fontWeight: 700 }}>{activeFilterCount}</span>
            </div>
          )}
        </button>
      </div>

      {/* Card area */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <div style={{ position: "relative", width: 340, height: 480 }}>
            {next && (
              <div style={{
                position: "absolute", inset: 0, background: "var(--surface)",
                border: "0.5px solid var(--border2)", borderRadius: 16,
                transform: "translateY(8px) scale(0.97)", opacity: 0.5, zIndex: 0,
              }} />
            )}
            {current ? (
              <div
                key={cardKey}
                style={{
                  position: "absolute", inset: 0, zIndex: 2,
                  background: "var(--surface)", border: "0.5px solid var(--border2)",
                  borderRadius: 16, padding: 28, display: "flex", flexDirection: "column",
                  transition: "transform 0.35s cubic-bezier(.25,.8,.25,1), opacity 0.35s",
                  transform: swipeDir === "left" ? "translateX(-120%) rotate(-12deg)"
                    : swipeDir === "right" ? "translateX(120%) rotate(12deg)" : "none",
                  opacity: swipeDir ? 0 : 1,
                  animation: "fadeUp 0.25s ease both",
                }}
              >
                {/* Swipe hint overlays */}
                {swipeDir === "right" && (
                  <div style={{
                    position: "absolute", top: 20, left: 20, zIndex: 10,
                    border: "1.5px solid var(--teal)", borderRadius: 6,
                    padding: "4px 10px", transform: "rotate(-12deg)",
                  }}>
                    <span className="mono" style={{ fontSize: 13, color: "var(--teal)", fontWeight: 700 }}>connect</span>
                  </div>
                )}
                {swipeDir === "left" && (
                  <div style={{
                    position: "absolute", top: 20, right: 20, zIndex: 10,
                    border: "1.5px solid #ef4444", borderRadius: 6,
                    padding: "4px 10px", transform: "rotate(12deg)",
                  }}>
                    <span className="mono" style={{ fontSize: 13, color: "#ef4444", fontWeight: 700 }}>skip</span>
                  </div>
                )}

                {/* Name + role row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "monospace", fontSize: 16, fontWeight: 500, color: "var(--teal)", flexShrink: 0,
                  }}>
                    {current.avatar_initials ?? current.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "var(--text)" }}>{current.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--muted2)", marginTop: 3 }}>
                      {current.role?.toLowerCase()}
                    </div>
                    {current.location && (
                      <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                        {current.location.toLowerCase()}
                      </div>
                    )}
                  </div>
                  <LevelBadge level={current.level ?? 1} />
                </div>

                <div style={{ height: "0.5px", background: "var(--border)", marginBottom: 16 }} />

                <p style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.6, marginBottom: 16 }}>
                  {current.bio || "no bio yet."}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {current.availability?.map((a: string) => <Tag key={a} label={`open to ${a.toLowerCase().replace("open to ", "")}`} teal />)}
                  {current.stack?.slice(0, 5).map((s: string) => <Tag key={s} label={s.toLowerCase()} />)}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: "auto" }}>
                  {[
                    { val: current.points ?? 0, lbl: "pts" },
                    { val: current.level ?? 1, lbl: "level" },
                    { val: current.github ? "linked" : "—", lbl: "github" },
                  ].map(s => (
                    <div key={s.lbl} style={{
                      background: "var(--surface2)", borderRadius: 8, padding: "10px 8px",
                      textAlign: "center", border: "0.5px solid var(--border)",
                    }}>
                      <div className="mono" style={{ fontSize: 14, fontWeight: 500, color: "var(--teal)" }}>{s.val}</div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Swipe buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginTop: 20 }}>
            <button onClick={() => swipe("left")} disabled={!current} style={{
              width: 52, height: 52, borderRadius: "50%", border: "0.5px solid var(--border2)",
              background: "var(--surface)", cursor: current ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", opacity: current ? 1 : 0.3,
              transition: "transform 0.1s, background 0.1s",
            }}
              onMouseEnter={e => { if (current) (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <X size={20} color="#ef4444" />
            </button>
            <button disabled={!current} style={{
              width: 52, height: 52, borderRadius: "50%", border: "0.5px solid var(--border2)",
              background: "var(--surface)", cursor: current ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", opacity: current ? 1 : 0.3,
              transition: "transform 0.1s",
            }}
              onMouseEnter={e => { if (current) (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <Zap size={20} color="#f59e0b" />
            </button>
            <button onClick={() => swipe("right")} disabled={!current} style={{
              width: 64, height: 64, borderRadius: "50%", border: "0.5px solid rgba(45,212,191,0.4)",
              background: current ? "var(--teal-dim)" : "var(--surface)", cursor: current ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", opacity: current ? 1 : 0.3,
              transition: "transform 0.1s, background 0.1s",
            }}
              onMouseEnter={e => { if (current) (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <Check size={24} color="var(--teal)" />
            </button>
          </div>
        </div>
      </div>

      {/* Match modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.15s ease both",
        }}>
          <div style={{
            background: "var(--surface)", border: "0.5px solid var(--border2)",
            borderRadius: 16, padding: 32, width: 400, maxWidth: "90vw", textAlign: "center",
            animation: "scaleIn 0.2s cubic-bezier(.25,.8,.25,1) both",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px",
              background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>it's a match.</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 24 }}>
              you connected with {matchedName}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} className="mono" style={{
                flex: 1, padding: 10, borderRadius: 10, border: "0.5px solid var(--border2)",
                background: "var(--surface2)", color: "var(--text)", fontSize: 12, cursor: "pointer",
                transition: "border-color 0.15s",
              }}>
                keep swiping
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  onNav?.("messages");
                }}
                className="mono"
                style={{
                  flex: 1, padding: 10, borderRadius: 10,
                  border: "0.5px solid var(--teal)", background: "var(--teal-dim)",
                  color: "var(--teal)", fontSize: 12, cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                send message →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter modal */}
      {showFilter && (
        <FilterModal
          filters={filters}
          onApply={setFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
}
