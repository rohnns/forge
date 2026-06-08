"use client";
import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, MessageSquare, X, GitBranch, Globe } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface Match {
  id: string;
  other_user_id: string;
  initials: string;
  name: string;
  role: string;
  level: number;
  bio?: string;
  stack?: string[];
  availability?: string[];
  github?: string;
  devpost?: string;
  points?: number;
  location?: string;
}

function ProfileDrawer({ match, onClose }: { match: Match; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 200, display: "flex", alignItems: "flex-end",
      animation: "fadeIn 0.15s ease both",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "100%", maxWidth: 520, margin: "0 auto",
        background: "var(--surface)", borderRadius: "16px 16px 0 0",
        border: "0.5px solid var(--border2)", maxHeight: "80vh", overflowY: "auto",
        animation: "slideUp 0.22s ease both",
      }}>
        <div style={{ width: 36, height: 4, background: "var(--border2)", borderRadius: 2, margin: "14px auto 0" }} />
        <div style={{ padding: "20px 24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12, flexShrink: 0,
              background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "monospace", fontSize: 18, fontWeight: 600, color: "var(--teal)",
            }}>
              {match.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>{match.name}</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4 }}>
                {match.role?.toLowerCase()} {match.location ? `· ${match.location}` : ""}
              </div>
            </div>
            <div className="mono" style={{
              background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
              borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "var(--teal)", flexShrink: 0,
            }}>
              lvl {match.level}
            </div>
          </div>

          {match.bio && (
            <p style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.7, marginBottom: 16 }}>{match.bio}</p>
          )}

          {match.availability && match.availability.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {match.availability.map(a => (
                <span key={a} className="mono" style={{
                  fontSize: 10, padding: "3px 8px", borderRadius: 5,
                  color: "var(--teal)", background: "var(--teal-dim2)", border: "0.5px solid rgba(45,212,191,0.3)",
                }}>{a.toLowerCase()}</span>
              ))}
            </div>
          )}

          {match.stack && match.stack.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {match.stack.map(s => (
                <span key={s} className="mono" style={{
                  fontSize: 10, padding: "3px 8px", borderRadius: 5,
                  color: "var(--muted2)", background: "var(--surface2)", border: "0.5px solid var(--border)",
                }}>{s.toLowerCase()}</span>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "12px", border: "0.5px solid var(--border)", textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 18, fontWeight: 500, color: "var(--teal)" }}>{match.points ?? 0}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>points</div>
            </div>
            <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "12px", border: "0.5px solid var(--border)", textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 18, fontWeight: 500, color: "var(--teal)" }}>{match.level}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>level</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {match.github && (
              <a href={match.github.startsWith("http") ? match.github : `https://${match.github}`}
                target="_blank" rel="noreferrer" className="mono" style={{
                  flex: 1, padding: "10px", borderRadius: 10, textAlign: "center",
                  background: "var(--surface2)", border: "0.5px solid var(--border2)",
                  color: "var(--muted2)", fontSize: 12, textDecoration: "none", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                <GitBranch size={13} /> github
              </a>
            )}
            {match.devpost && (
              <a href={match.devpost.startsWith("http") ? match.devpost : `https://${match.devpost}`}
                target="_blank" rel="noreferrer" className="mono" style={{
                  flex: 1, padding: "10px", borderRadius: 10, textAlign: "center",
                  background: "var(--surface2)", border: "0.5px solid var(--border2)",
                  color: "var(--muted2)", fontSize: 12, textDecoration: "none", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                <Globe size={13} /> devpost
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useUser();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) fetchMatches(); }, [user]);

  useEffect(() => {
    if (!selected || !user) return;
    fetchMessages();
    const channel = supabase
      .channel(`chat-${selected.other_user_id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        (payload) => setMessages(prev => [...prev, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchMatches = async () => {
    setLoading(true);
    const { data: sent } = await supabase.from("matches")
      .select("user_b, profiles!matches_user_b_fkey(id, name, role, level, avatar_initials, bio, stack, availability, github, devpost, points, location)")
      .eq("user_a", user!.id);
    const { data: received } = await supabase.from("matches")
      .select("user_a, profiles!matches_user_a_fkey(id, name, role, level, avatar_initials, bio, stack, availability, github, devpost, points, location)")
      .eq("user_b", user!.id);

    const all: Match[] = [];
    const seen = new Set<string>();

    const mapProfile = (p: any, uid: string): Match => ({
      id: uid, other_user_id: uid,
      initials: p.avatar_initials ?? p.name?.slice(0, 2).toUpperCase() ?? "?",
      name: p.name, role: p.role, level: p.level ?? 1,
      bio: p.bio, stack: p.stack, availability: p.availability,
      github: p.github, devpost: p.devpost, points: p.points, location: p.location,
    });

    sent?.forEach((m: any) => {
      const p = m.profiles;
      if (p && !seen.has(p.id)) { seen.add(p.id); all.push(mapProfile(p, m.user_b)); }
    });
    received?.forEach((m: any) => {
      const p = m.profiles;
      if (p && !seen.has(p.id)) { seen.add(p.id); all.push(mapProfile(p, m.user_a)); }
    });

    setMatches(all);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from("messages").select("*")
      .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${selected!.other_user_id}),and(sender_id.eq.${selected!.other_user_id},receiver_id.eq.${user!.id})`)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
  };

  const send = async () => {
    if (!input.trim() || !selected || !user || sending) return;
    setSending(true);
    const { data } = await supabase.from("messages")
      .insert({ sender_id: user.id, receiver_id: selected.other_user_id, content: input.trim() })
      .select().single();
    if (data) setMessages(prev => [...prev, data]);
    setInput("");
    setSending(false);
  };

  // CHAT VIEW
  if (selected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        {showProfile && <ProfileDrawer match={selected} onClose={() => setShowProfile(false)} />}

        <div style={{
          padding: "14px 20px", borderBottom: "0.5px solid var(--border)",
          display: "flex", alignItems: "center", gap: 12,
          background: "var(--surface)", flexShrink: 0,
        }}>
          <button onClick={() => { setSelected(null); setMessages([]); }} style={{
            width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border2)",
            background: "var(--surface2)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <ArrowLeft size={14} color="var(--muted2)" />
          </button>

          {/* Clickable profile area */}
          <div onClick={() => setShowProfile(true)} style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: "var(--teal-dim)", border: "0.5px solid rgba(45,212,191,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "monospace", fontSize: 12, color: "var(--teal)",
            }}>
              {selected.initials}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{selected.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                {selected.role?.toLowerCase()} · lvl {selected.level} · tap to view profile
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 60 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, margin: "0 auto 12px",
                background: "var(--teal-dim)", border: "0.5px solid rgba(45,212,191,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.6">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                you connected with {selected.name} — say hi
              </div>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "72%", padding: "10px 14px",
                  borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                  background: isMe ? "var(--teal-dim)" : "var(--surface2)",
                  border: `0.5px solid ${isMe ? "rgba(45,212,191,0.3)" : "var(--border)"}`,
                  color: isMe ? "var(--teal)" : "var(--text)",
                  fontSize: 13, lineHeight: 1.5, wordBreak: "break-word",
                }}>
                  {msg.content}
                  <div className="mono" style={{ fontSize: 9, color: isMe ? "rgba(45,212,191,0.5)" : "var(--muted)", marginTop: 4, textAlign: "right" }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="type a message..." rows={1}
            style={{
              flex: 1, background: "var(--surface2)", border: "0.5px solid var(--border2)",
              borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13,
              fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 100,
            }}
            onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--teal)"}
            onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--border2)"}
          />
          <button onClick={send} disabled={!input.trim() || sending} style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: input.trim() ? "var(--teal-dim)" : "var(--surface2)",
            border: `0.5px solid ${input.trim() ? "var(--teal)" : "var(--border)"}`,
            cursor: input.trim() ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
          }}>
            <Send size={15} color={input.trim() ? "var(--teal)" : "var(--muted)"} />
          </button>
        </div>
      </div>
    );
  }

  // MATCH LIST
  return (
    <div className="page-pad" style={{ padding: 32, animation: "fadeUp 0.22s ease both" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>messages</h1>
        <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>// your connections</p>
      </div>
      <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "14px 20px", borderBottom: "0.5px solid var(--border)" }}>
          // connections ({matches.length})
        </div>
        {loading && <div className="mono" style={{ padding: "24px 20px", fontSize: 11, color: "var(--muted)" }}>loading...</div>}
        {!loading && matches.length === 0 && (
          <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
            <MessageSquare size={32} color="var(--muted)" strokeWidth={1} />
            <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>no connections yet</div>
            <div className="mono" style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>start swiping to match with engineers</div>
          </div>
        )}
        {matches.map(m => (
          <div key={m.id} onClick={() => setSelected(m)} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
            borderBottom: "0.5px solid var(--border)", cursor: "pointer", transition: "background 0.1s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--teal-dim2)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: "var(--teal-dim)", border: "0.5px solid rgba(45,212,191,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "monospace", fontSize: 13, color: "var(--teal)", fontWeight: 500,
            }}>
              {m.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{m.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
                {m.role?.toLowerCase()} · lvl {m.level}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
