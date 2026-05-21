import { useState } from "react";
import { useLocation } from "wouter";
import { MatrixRain } from "@/MatrixRain";

type Category = "languages" | "frameworks" | "databases" | "cloud" | "tools" | "methodologies" | "other";

const CATEGORY_COLORS: Record<Category, string> = {
  languages:     "border-[#00ff41] text-[#00ff41]",
  frameworks:    "border-[#00cc33] text-[#00cc33]",
  databases:     "border-[#00aaff] text-[#00aaff]",
  cloud:         "border-[#aa00ff] text-[#aa00ff]",
  tools:         "border-[#ffaa00] text-[#ffaa00]",
  methodologies: "border-[#ff5500] text-[#ff5500]",
  other:         "border-[#888888] text-[#888888]",
};

interface ExtractionResult {
  skills: string[];
  categories: Record<Category, string[]>;
  experience_level?: string;
  role_type?: string;
  summary?: string;
}

const API = "/api";

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"text" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const endpoint = activeTab === "text" ? `${API}/extract/text` : `${API}/extract/url`;
      const body = activeTab === "text" ? { text } : { url };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudyFlashcards = () => {
    if (!result?.skills?.length) return;
    const skillsParam = result.skills.slice(0, 10).join(",");
    setLocation(`/flashcards?skills=${encodeURIComponent(skillsParam)}`);
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded border border-primary/20 mb-8 py-12 px-6 text-center bg-black/60">
        <MatrixRain />
        <div className="relative z-10">
          <p className="text-primary/60 text-xs tracking-widest uppercase mb-2">&gt; system::initialize</p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">TECH<span className="text-primary/40">_</span>EXTRACT</h1>
          <p className="text-primary/70 text-lg">Paste a job description. AI extracts every skill. Study with flashcards.</p>
        </div>
      </div>

      <div className="bg-black/70 border border-primary/30 rounded p-6 mb-6">
        <div className="flex mb-4 border border-primary/30 rounded overflow-hidden">
          <button onClick={() => setActiveTab("text")} className={`flex-1 py-2 text-sm tracking-wider transition-colors ${activeTab === "text" ? "bg-primary text-black font-bold" : "text-primary/60 hover:text-primary hover:bg-primary/10"}`}>[PASTE TEXT]</button>
          <button onClick={() => setActiveTab("url")} className={`flex-1 py-2 text-sm tracking-wider transition-colors border-l border-primary/30 ${activeTab === "url" ? "bg-primary text-black font-bold" : "text-primary/60 hover:text-primary hover:bg-primary/10"}`}>[URL]</button>
        </div>

        {activeTab === "text" ? (
          <div>
            <label className="block text-xs text-primary/60 mb-2 tracking-wider">&gt; PASTE JOB DESCRIPTION:</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder="Paste the full job description here..." className="w-full bg-black border border-primary/40 text-primary font-mono text-sm p-3 rounded resize-none focus:outline-none focus:border-primary placeholder-primary/20" />
            <p className="text-primary/30 text-xs mt-1">{text.length} chars</p>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-primary/60 mb-2 tracking-wider">&gt; JOB POSTING URL:</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://jobs.example.com/posting/..." className="w-full bg-black border border-primary/40 text-primary font-mono text-sm p-3 rounded focus:outline-none focus:border-primary placeholder-primary/20" />
          </div>
        )}

        {error && <div className="mt-3 border border-red-500/50 bg-red-500/10 rounded p-3 text-red-400 text-sm">ERROR: {error}</div>}

        <button onClick={handleExtract} disabled={isLoading} className="mt-4 w-full bg-primary text-black font-bold py-3 rounded tracking-widest uppercase text-sm hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? ">> ANALYZING..." : ">> RUN EXTRACTION"}
        </button>
      </div>

      {result && (
        <div className="bg-black/70 border border-primary/30 rounded p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-primary/20 pb-3">
            <span className="text-primary text-sm font-bold tracking-wider">EXTRACTION COMPLETE</span>
            <span className="text-primary/40 text-xs">— {result.skills?.length ?? 0} skills detected</span>
          </div>
          {result.summary && <div><p className="text-xs text-primary/50 tracking-wider mb-1">&gt; ROLE SUMMARY:</p><p className="text-primary/80 text-sm leading-relaxed border-l-2 border-primary/30 pl-3">{result.summary}</p></div>}
          {(result.experience_level || result.role_type) && (
            <div className="flex gap-4 text-xs">
              {result.experience_level && <div><span className="text-primary/40 tracking-wider">LEVEL: </span><span className="text-primary uppercase">{result.experience_level}</span></div>}
              {result.role_type && <div><span className="text-primary/40 tracking-wider">ROLE: </span><span className="text-primary uppercase">{result.role_type}</span></div>}
            </div>
          )}
          <div>
            <p className="text-xs text-primary/50 tracking-wider mb-2">&gt; DETECTED SKILLS:</p>
            <div className="flex flex-wrap gap-2">
              {result.skills?.map((skill) => <span key={skill} className="border border-primary/50 text-primary text-xs px-2 py-0.5 rounded uppercase tracking-wider">{skill}</span>)}
            </div>
          </div>
          {result.categories && (
            <div>
              <p className="text-xs text-primary/50 tracking-wider mb-3">&gt; BY CATEGORY:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.entries(result.categories) as [Category, string[]][]).filter(([, s]) => s?.length > 0).map(([cat, skills]) => (
                  <div key={cat} className={`border rounded p-3 ${CATEGORY_COLORS[cat] ?? "border-primary/30 text-primary"}`}>
                    <p className="text-xs uppercase tracking-widest mb-2 opacity-70">{cat}</p>
                    <div className="flex flex-wrap gap-1">{skills.map((s) => <span key={s} className={`text-xs border px-2 py-0.5 rounded ${CATEGORY_COLORS[cat] ?? "border-primary/30"}`}>{s}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={handleStudyFlashcards} className="w-full border-2 border-primary text-primary font-bold py-3 rounded tracking-widest uppercase text-sm hover:bg-primary hover:text-black transition-colors">&gt;&gt; STUDY FLASHCARDS FOR THESE SKILLS</button>
        </div>
      )}
    </div>
  );
}
