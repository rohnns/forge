import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `You are extracting structured data from a resume for an engineer matchmaking platform called forge/. 

Extract the following from this resume and return ONLY valid JSON, no markdown, no explanation:

{
  "projects": [
    {
      "name": "project name",
      "description": "1-2 sentence description",
      "tech": ["tech1", "tech2"],
      "github_url": "url if mentioned or null",
      "demo_url": "url if mentioned or null",
      "year": "year if mentioned or null"
    }
  ],
  "hackathons": [
    {
      "name": "hackathon name",
      "placement": "1st/2nd/3rd/finalist/participant or null",
      "year": "year if mentioned or null",
      "project": "project name if mentioned or null"
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "year": "year if mentioned or null"
    }
  ],
  "suggested_stack": ["tech1", "tech2"],
  "suggested_role": "best matching role from: Frontend, Backend, Fullstack, ML/AI, Data Science, Mobile, Systems/Low-level, DevOps/Infra, Embedded Systems, Hardware/PCB, Robotics, IoT, Mechanical Eng., ECE, Biomedical, Design/UX, Product, Security"
}

Resume text:
${resumeText}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "{}";

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      parsed = { projects: [], hackathons: [], certifications: [], suggested_stack: [], suggested_role: "" };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Resume scrape error:", err);
    return NextResponse.json({ error: "Failed to scrape resume" }, { status: 500 });
  }
}
