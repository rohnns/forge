"use client";
import { useState, useEffect } from "react";
import { useUser } from "./context/UserContext";
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import MatchPage from "./components/MatchPage";
import ScorePage from "./components/ScorePage";
import HackathonsPage from "./components/HackathonsPage";
import ProfilePage from "./components/ProfilePage";
import MessagesPage from "./components/MessagesPage";
import Onboarding from "./components/Onboarding";
import BottomNav from "./components/BottomNav";
import AuthScreen from "./components/AuthScreen";
import DevpostBanner from "./components/DevpostBanner";
import SplashScreen from "./components/SplashScreen";

export default function Home() {
  const [activePage, setActivePage] = useState("match");
  const [showSplash, setShowSplash] = useState(true);
  const [openChatWithId, setOpenChatWithId] = useState<string | null>(null);
  const { user, profile, loading, setProfile, signInWithGoogle, signInWithGitHub } = useUser();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div className="dot-bg" />
        <div className="mono" style={{ color: "var(--muted)", fontSize: 13, zIndex: 1 }}>loading...</div>
      </div>
    );
  }

  if (!user) return <AuthScreen onGoogleSignIn={signInWithGoogle} onGitHubSignIn={signInWithGitHub} />;

  if (!profile) {
    return (
      <Onboarding onComplete={async (data) => {
        const initials = data.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
        const newProfile = { id: user.id, ...data, level: 1, points: 0, avatar_initials: initials };
        await supabase.from("profiles").upsert(newProfile);
        setProfile(newProfile);
      }} />
    );
  }

  const handleNavToMessages = (chatUserId?: string) => {
    setOpenChatWithId(chatUserId ?? null);
    setActivePage("messages");
  };

  const pages: Record<string, React.ReactNode> = {
    match: <MatchPage onNavToMessages={handleNavToMessages} />,
    messages: <MessagesPage initialOpenUserId={openChatWithId} onChatOpened={() => setOpenChatWithId(null)} />,
    score: <ScorePage />,
    hackathons: <HackathonsPage />,
    profile: <ProfilePage />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div className="dot-bg" />
      <div className="sidebar-wrapper">
        <Sidebar active={activePage} onNav={setActivePage} />
      </div>
      <main className="main-content" style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
        <DevpostBanner />
        {pages[activePage]}
      </main>
      <BottomNav
        active={activePage}
        onNav={(page) => {
          if (page !== "messages") setOpenChatWithId(null);
          setActivePage(page);
        }}
      />
    </div>
  );
}