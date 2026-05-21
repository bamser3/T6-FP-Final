import { Router } from "express";
import Groq from "groq-sdk";
import axios from "axios";
import * as cheerio from "cheerio";

const router = Router();

function getGroqClient(): Groq {
  const key = process.env["GROQ_API_KEY"];
  if (!key) {
    throw new Error("GROQ_API_KEY is not configured. Please add it in the Secrets tab.");
  }
  return new Groq({ apiKey: key });
}

async function scrapeUrl(url: string): Promise<string> {
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TechExtract/1.0)" },
  });
  const $ = cheerio.load(response.data as string);
  $("script, style, nav, footer, header").remove();
  return $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);
}

async function extractTechSkills(text: string, groq: Groq) {
  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      {
        role: "system",
        content: `You are a precision tech skills extractor. Analyze job descriptions and return ONLY a JSON object.
Extract all technical skills, tools, frameworks, languages, platforms, and methodologies.

Return this exact JSON structure:
{
  "skills": ["skill1", "skill2", ...],
  "categories": {
    "languages": [],
    "frameworks": [],
    "databases": [],
    "cloud": [],
    "tools": [],
    "methodologies": [],
    "other": []
  },
  "experience_level": "junior|mid|senior|lead",
  "role_type": "frontend|backend|fullstack|devops|data|mobile|other",
  "summary": "one sentence summary of the role"
}

Be thorough. Return ONLY valid JSON, no markdown, no explanation.`,
      },
      {
        role: "user",
        content: `Extract all tech skills from this job description:\n\n${text}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 2048,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse Groq response as JSON");
  }
}

router.post("/text", async (req, res): Promise<void> => {
  const { text } = req.body as { text?: string };
  if (!text || text.trim().length < 20) {
    res.status(400).json({ error: "Text is too short. Paste a full job description." });
    return;
  }
  try {
    const groq = getGroqClient();
    const result = await extractTechSkills(text.slice(0, 8000), groq);
    res.json({ success: true, source: "text", ...result });
  } catch (err) {
    
    res.status(500).json({ error: err instanceof Error ? err.message : "Extraction failed" });
  }
});

router.post("/url", async (req, res): Promise<void> => {
  const { url } = req.body as { url?: string };
  if (!url || !url.startsWith("http")) {
    res.status(400).json({ error: "Invalid URL. Must start with http:// or https://" });
    return;
  }
  try {
    const groq = getGroqClient();
    let text: string;
    try {
      text = await scrapeUrl(url);
    } catch (scrapeErr) {
      res.status(400).json({ error: `Could not fetch URL: ${scrapeErr instanceof Error ? scrapeErr.message : "Unknown error"}. Try pasting the text directly.` });
      return;
    }
    if (text.length < 50) {
      res.status(400).json({ error: "Could not extract content from URL. Try pasting the text directly." });
      return;
    }
    const result = await extractTechSkills(text, groq);
    res.json({ success: true, source: "url", url, ...result });
  } catch (err) {
    
    res.status(500).json({ error: err instanceof Error ? err.message : "Extraction failed" });
  }
});

export default router;
