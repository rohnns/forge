"use client";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // slight delay before animating in
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setFadeOut(true), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 9999, transition: "opacity 0.5s ease", opacity: fadeOut ? 0 : 1,
    }}>
      <div className="dot-bg" />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        transition: "transform 0.6s cubic-bezier(.25,.8,.25,1), opacity 0.6s ease",
        transform: visible ? "translateY(0)" : "translateY(18px)",
        opacity: visible ? 1 : 0,
        zIndex: 1,
      }}>
        {/* Logo mark */}
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "var(--teal-dim)", border: "0.5px solid var(--teal)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          {/* Anvil-like forge symbol made from divs */}
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="18" width="24" height="5" rx="2" fill="var(--teal)" opacity="0.9"/>
            <rect x="9" y="10" width="16" height="9" rx="2" fill="var(--teal)" opacity="0.7"/>
            <rect x="14" y="23" width="6" height="6" rx="1" fill="var(--teal)" opacity="0.5"/>
            <circle cx="26" cy="10" r="3" fill="var(--teal)" opacity="0.4"/>
            <circle cx="26" cy="10" r="1.5" fill="var(--teal)"/>
          </svg>
        </div>

        {/* Wordmark */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "'Questrial', sans-serif", fontSize: 36, fontWeight: 400,
            color: "var(--text)", letterSpacing: "-0.01em", lineHeight: 1,
          }}>
            .merge
          </div>
          <div style={{
            fontFamily: "'Satoshi', sans-serif", fontWeight: 900,
            fontSize: 12, color: "var(--muted)", marginTop: 8,
          }}>
            for your next genius masterplan.
          </div>
        </div>
      </div>

      {/* Bottom pulse indicator */}
      <div style={{
        position: "absolute", bottom: 48,
        display: "flex", gap: 5, alignItems: "center",
        opacity: visible ? 0.5 : 0, transition: "opacity 0.6s ease 0.4s",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: "50%", background: "var(--teal)",
            animation: `splash-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
