import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../lib/auth";
import { rateLimit } from "../../lib/rateLimit";
import { sanitizeText } from "../../lib/sanitize";

const MAX_RESUME_LENGTH = 50_000; // ~50KB of text, enough for any resume
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 scrapes per hour per user

// FIX #1: System prompt is strictly instructions only — resume is passed as a
// separate user message (Anthropic) or wrapped in XML delimiters (Gemini) to
// prevent prompt injection via resume content.
const SYSTEM_PROMPT = `You are extracting structured data from a resume for an engineer matchmaking platform.
Extract ONLY what is explicitly stated — do not infer or hallucinate.
Return ONLY valid JSON, no markdown, no explanation:

{
  "projects": [{ "name": string, "description": string (max 100 chars), "tech": string[], "github_url": string|null, "demo_url": string|null, "year": string|null }],
  "hackathons": [{ "name": string, "placement": string|null, "year": string|null, "project": string|null }],
  "certifications": [{ "name": string, "issuer": string, "year": string|null }],
  "suggested_stack": string[],
  "suggested_role": string
}`;

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check — must be logged in
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit — 5 requests per hour per user
    const rl = await rateLimit(`scrape:${user.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    // 3. Parse and validate body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { resumeText } = body;

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
    }

    // 4. Sanitize and limit input size
    const sanitized = sanitizeText(resumeText, MAX_RESUME_LENGTH);
    if (sanitized.length < 50) {
      return NextResponse.json({ error: "Resume text too short" }, { status: 400 });
    }

    // 5. Check API key exists
    if (!process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    // 6. Call AI API
    // FIX #1: Resume content is structurally isolated from instructions.
    // Anthropic: system prompt = instructions, user message = resume only.
    // Gemini: instructions prepended, resume wrapped in <resume> XML tags to
    //         prevent the content from being interpreted as further instructions.
    let text = "{}";

    if (process.env.GEMINI_API_KEY) {
      const geminiPrompt = `${SYSTEM_PROMPT}\n\n<resume>\n${sanitized}\n</resume>`;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: geminiPrompt }] }] }),
        }
      );
      const data = await response.json();
      text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    } else {
      // Anthropic: system prompt carries instructions, user message carries
      // only the resume — structurally isolated, can't be prompt-injected.
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: sanitized }],
        }),
      });
      const data = await response.json();
      text = data.content?.[0]?.text ?? "{}";
    }

    // 7. Parse response safely
    let parsed;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);

      parsed.projects = (parsed.projects ?? []).slice(0, 20).map((p: any) => ({
        name: sanitizeText(p.name ?? "", 100),
        description: sanitizeText(p.description ?? "", 200),
        tech: Array.isArray(p.tech) ? p.tech.slice(0, 10).map((t: string) => sanitizeText(t, 50)) : [],
        github_url: null, // Never trust AI-extracted URLs — let user paste manually
        demo_url: null,
        year: p.year ? String(p.year).slice(0, 4) : null,
      }));

      parsed.hackathons = (parsed.hackathons ?? []).slice(0, 20).map((h: any) => ({
        name: sanitizeText(h.name ?? "", 100),
        placement: sanitizeText(h.placement ?? "", 50),
        year: h.year ? String(h.year).slice(0, 4) : null,
        project: sanitizeText(h.project ?? "", 100),
      }));

      parsed.certifications = (parsed.certifications ?? []).slice(0, 20).map((c: any) => ({
        name: sanitizeText(c.name ?? "", 100),
        issuer: sanitizeText(c.issuer ?? "", 100),
        year: c.year ? String(c.year).slice(0, 4) : null,
      }));

      parsed.suggested_stack = Array.isArray(parsed.suggested_stack)
        ? parsed.suggested_stack.slice(0, 20).map((s: string) => sanitizeText(s, 50))
        : [];

      parsed.suggested_role = sanitizeText(parsed.suggested_role ?? "", 100);
    } catch {
      parsed = { projects: [], hackathons: [], certifications: [], suggested_stack: [], suggested_role: "" };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Resume scrape error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
