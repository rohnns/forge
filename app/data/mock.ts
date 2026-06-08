export const currentUser = {
  id: "u0",
  initials: "AK",
  name: "Arjun K.",
  role: "Fullstack Engineer",
  stack: ["React", "Node", "PostgreSQL", "TypeScript"],
  bio: "Building side projects on weekends. Interested in devtools, productivity, and anything that makes engineers' lives less annoying. 4x hackathon participant, 1 win so far.",
  location: "Bangalore, IN",
  level: 4,
  points: 23,
  availability: ["hackathons", "projects"],
  stats: { hackathons: 4, wins: 1, projects: 3, rating: 4.8 },
};

export const profiles = [
  {
    id: "u1",
    initials: "SR",
    name: "Sneha R.",
    role: "ML Engineer",
    stack: ["Python", "PyTorch", "FastAPI", "React"],
    bio: "Building at the intersection of NLP and product. Love turning messy research into things people actually use. Looking for a strong frontend or systems person for next hackathon run.",
    location: "Bangalore, IN",
    level: 5,
    points: 28,
    availability: ["hackathons", "projects"],
    stats: { hackathons: 6, wins: 3, projects: 5, rating: 4.9 },
  },
  {
    id: "u2",
    initials: "MJ",
    name: "Marcus J.",
    role: "Systems Engineer",
    stack: ["Rust", "Go", "TypeScript", "Linux"],
    bio: "Low-level by day, full-stack by night. I like building things that are embarrassingly fast. Looking for a product-minded person to help me actually ship.",
    location: "Remote",
    level: 3,
    points: 14,
    availability: ["hackathons"],
    stats: { hackathons: 3, wins: 0, projects: 4, rating: 4.6 },
  },
  {
    id: "u3",
    initials: "PT",
    name: "Priya T.",
    role: "Backend Engineer",
    stack: ["Go", "PostgreSQL", "Redis", "Docker"],
    bio: "API design nerd. I care a lot about reliability and clean interfaces. Open to long-term side projects that actually get finished.",
    location: "Mumbai, IN",
    level: 4,
    points: 19,
    availability: ["projects"],
    stats: { hackathons: 2, wins: 1, projects: 6, rating: 4.7 },
  },
  {
    id: "u4",
    initials: "LK",
    name: "Leo K.",
    role: "Frontend Engineer",
    stack: ["React", "Figma", "Next.js", "CSS"],
    bio: "Design-engineer hybrid. I obsess over interaction details most people don't notice. Want to find a solid backend person to stop doing everything myself.",
    location: "Pune, IN",
    level: 3,
    points: 11,
    availability: ["hackathons", "projects"],
    stats: { hackathons: 5, wins: 1, projects: 2, rating: 4.5 },
  },
];

export const matches = [
  { id: "u3", initials: "PT", name: "Priya T.", role: "Backend · Go, PostgreSQL", level: 4, unread: true },
  { id: "u4", initials: "LK", name: "Leo K.", role: "Frontend · React, Figma", level: 3, unread: false },
];

export const projects = [
  {
    id: "p1",
    name: "NeuralDraft",
    type: "Hackathon · Devfolio · 2024",
    desc: "AI writing assistant with context-aware suggestions. Won 1st place at HackBLR. Verified via Devpost.",
    tier: 3,
    placement: "1st place",
    githubLinked: true,
    verified: true,
    points: 3,
  },
  {
    id: "p2",
    name: "GridSync",
    type: "Side Project · 2023",
    desc: "Real-time collaborative spreadsheet tool. Open source, 40+ stars. Demo live.",
    tier: 1,
    placement: null,
    githubLinked: true,
    verified: false,
    points: 1,
    stars: 40,
  },
];

export const scoreBreakdown = [
  { label: "Hackathon placements", pts: 9, max: 15 },
  { label: "Project quality", pts: 6, max: 15 },
  { label: "Teammate ratings", pts: 5, max: 15 },
  { label: "GitHub activity", pts: 3, max: 15 },
];

export const tierGuide = [
  { tier: 3, label: "Top 3 placement · real users", pts: "+3 pts", color: "teal" },
  { tier: 2, label: "Any placement · notable tech", pts: "+2 pts", color: "purple" },
  { tier: 1, label: "Shipped · live repo · demo", pts: "+1 pt", color: "blue" },
  { tier: 0, label: "Incomplete · no repo", pts: "+0 pts", color: "gray" },
];

export const hackathons = [
  {
    id: "h1",
    name: "HackBLR 2025",
    org: "IISC · Bangalore",
    prize: "₹2,00,000",
    date: "Aug 12–13, 2025",
    tags: ["ai/ml", "web3", "open track"],
    spots: 48,
    totalSpots: 120,
  },
  {
    id: "h2",
    name: "SynthHack",
    org: "Remote · Global",
    prize: "$5,000",
    date: "Jul 28–29, 2025",
    tags: ["devtools", "cli", "oss"],
    spots: 90,
    totalSpots: 200,
  },
  {
    id: "h3",
    name: "HealthForge",
    org: "AIIMS Delhi · Hybrid",
    prize: "₹75,000",
    date: "Sep 5–6, 2025",
    tags: ["healthtech", "iot"],
    spots: 22,
    totalSpots: 80,
  },
];
