"use client";
import { Plus } from "lucide-react";
import { hackathons } from "../data/mock";

function Tag({ label }: { label: string }) {
  return (
    <span className="mono" style={{
      fontSize: 10, padding: "3px 8px", borderRadius: 5,
      color: "var(--muted2)", background: "var(--surface2)", border: "0.5px solid var(--border)",
    }}>
      {label}
    </span>
  );
}

export default function HackathonsPage() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)" }}>hackathons</h1>
        <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          // upcoming events · find a team or host your own
        </p>
      </div>

      <button
        onClick={() => alert("Host a hackathon — coming soon")}
        className="mono"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
          borderRadius: 10, padding: "10px 18px", cursor: "pointer",
          fontSize: 12, color: "var(--teal)", marginBottom: 24, transition: "all 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(45,212,191,0.2)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--teal-dim)"}
      >
        <Plus size={14} /> host a hackathon
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {hackathons.map(h => {
          const fillPct = Math.round((h.spots / h.totalSpots) * 100);
          return (
            <div key={h.id} style={{
              background: "var(--surface)", border: "0.5px solid var(--border)",
              borderRadius: 12, padding: 20, cursor: "pointer", transition: "border-color 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--teal)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>{h.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginBottom: 14 }}>{h.org}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 13, color: "var(--teal)" }}>{h.prize}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>{h.date}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                {h.tags.map(t => <Tag key={t} label={t} />)}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10 }}>
                spots: {h.spots} / {h.totalSpots} filled
              </div>
              <div style={{ height: 2, background: "var(--surface2)", borderRadius: 1, marginTop: 4 }}>
                <div style={{ height: 2, background: "var(--teal)", borderRadius: 1, width: `${fillPct}%` }} />
              </div>
            </div>
          );
        })}

        <div style={{
          background: "var(--surface)", border: "0.5px dashed var(--border2)",
          borderRadius: 12, padding: 20, cursor: "pointer", opacity: 0.5,
          display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s",
        }}
          onClick={() => alert("Host flow — coming soon")}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.8"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.5"}
        >
          <div style={{ textAlign: "center" }}>
            <Plus size={24} color="var(--muted)" style={{ display: "block", margin: "0 auto 8px" }} />
            <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>host your hackathon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
