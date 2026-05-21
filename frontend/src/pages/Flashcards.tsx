import { useState, useEffect, useCallback } from "react";
import { useSearch } from "wouter";

interface Flashcard {
  id: number;
  category: string;
  skill: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  question: string;
  answer: string;
}

const DIFFICULTY_COLORS = {
  beginner:     "border-[#00ff41] text-[#00ff41]",
  intermediate: "border-[#ffaa00] text-[#ffaa00]",
  advanced:     "border-[#ff5500] text-[#ff5500]",
};

const API = "/api";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("techextract_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Flashcards() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const skillsParam = params.get("skills") ?? "";
  const categoryParam = params.get("category") ?? "";

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const q = new URLSearchParams({ limit: "50", shuffle: "true" });
    if (skillsParam) q.set("skills", skillsParam);
    if (categoryParam) q.set("category", categoryParam);
    if (difficulty) q.set("difficulty", difficulty);
    fetch(`${API}/flashcards?${q}`, {
      headers: authHeaders(),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => { setCards(data.questions ?? []); setCurrentIndex(0); setIsFlipped(false); })
      .finally(() => setIsLoading(false));
  }, [skillsParam, categoryParam, difficulty]);

  const total = cards.length;
  const card = cards[currentIndex];
  const goNext = useCallback(() => { setIsFlipped(false); setTimeout(() => setCurrentIndex((i) => Math.min(i + 1, total - 1)), 150); }, [total]);
  const goPrev = useCallback(() => { setIsFlipped(false); setTimeout(() => setCurrentIndex((i) => Math.max(i - 1, 0)), 150); }, []);
  const flipCard = useCallback(() => setIsFlipped((f) => !f), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); flipCard(); }
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flipCard, goNext, goPrev]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-primary/60 text-sm tracking-widest animate-pulse">&gt; LOADING DATABASE...</div>
    </div>
  );

  if (!cards.length) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <p className="text-primary/40 text-sm">&gt; NO CARDS FOUND FOR THESE FILTERS</p>
      <a href="/browse" className="text-primary border border-primary/40 px-4 py-2 text-sm hover:bg-primary/10 transition-colors">[BROWSE ALL QUESTIONS]</a>
    </div>
  );

  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-primary font-bold tracking-wider">&gt; FLASHCARD_STUDY</h2>
          {skillsParam && <p className="text-primary/40 text-xs mt-1">SKILLS: {skillsParam.split(",").join(" · ")}</p>}
        </div>
        <div className="flex gap-2">
          {(["", "beginner", "intermediate", "advanced"] as const).map((d) => (
            <button key={d || "all"} onClick={() => setDifficulty(d)} className={`text-xs px-2 py-1 border rounded tracking-wider transition-colors ${difficulty === d ? "bg-primary text-black border-primary" : "border-primary/30 text-primary/50 hover:border-primary hover:text-primary"}`}>
              {d || "ALL"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-primary/50 mb-1 tracking-wider">
          <span>CARD {currentIndex + 1} / {total}</span><span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1 bg-primary/10 rounded overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {card && (
        <div className="mb-6">
          <div className="flex gap-2 mb-3 text-xs">
            <span className="border border-primary/30 text-primary/60 px-2 py-0.5 rounded uppercase tracking-wider">{card.category}</span>
            <span className={`border px-2 py-0.5 rounded uppercase tracking-wider ${DIFFICULTY_COLORS[card.difficulty]}`}>{card.difficulty}</span>
          </div>
          <div onClick={flipCard} className="cursor-pointer" style={{ perspective: "1000px" }}>
            <div style={{ transformStyle: "preserve-3d", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", position: "relative", minHeight: "260px" }}>
              <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as React.CSSProperties} className="absolute inset-0 bg-black border border-primary/40 rounded p-8 flex flex-col justify-center">
                <p className="text-primary/30 text-xs tracking-widest mb-4">&gt; QUESTION</p>
                <p className="text-primary text-xl leading-relaxed">{card.question}</p>
                <p className="text-primary/20 text-xs mt-6 tracking-wider">CLICK OR PRESS SPACE TO REVEAL</p>
              </div>
              <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" } as React.CSSProperties} className="absolute inset-0 bg-[#001a00] border border-primary rounded p-8 flex flex-col justify-center">
                <p className="text-primary/50 text-xs tracking-widest mb-4">&gt; ANSWER</p>
                <p className="text-primary text-base leading-relaxed">{card.answer}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 items-center justify-center">
        <button onClick={goPrev} disabled={currentIndex === 0} className="border border-primary/40 text-primary px-6 py-2 text-sm tracking-wider hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded">[PREV]</button>
        <button onClick={flipCard} className="border-2 border-primary text-primary px-8 py-2 text-sm tracking-wider hover:bg-primary hover:text-black transition-colors font-bold rounded">{isFlipped ? "[HIDE]" : "[FLIP]"}</button>
        <button onClick={goNext} disabled={currentIndex === total - 1} className="border border-primary/40 text-primary px-6 py-2 text-sm tracking-wider hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded">[NEXT]</button>
      </div>
      <p className="text-center text-primary/20 text-xs mt-4 tracking-wider">KEYBOARD: SPACE = FLIP · ← → = NAVIGATE</p>
    </div>
  );
}
