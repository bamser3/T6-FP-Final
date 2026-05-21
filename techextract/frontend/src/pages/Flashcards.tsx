import { useState, useEffect, useCallback } from "react";
import { useSearch } from "wouter";
import {
  useListFlashcards,
  getListFlashcardsQueryKey,
  type ListFlashcardsDifficulty,
} from "@workspace/api-client-react";

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

export default function Flashcards() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const skillsParam = params.get("skills") ?? undefined;
  const categoryParam = params.get("category") ?? undefined;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [difficulty, setDifficulty] = useState<ListFlashcardsDifficulty | "">("");

  const { data, isLoading } = useListFlashcards(
    {
      skills: skillsParam,
      category: categoryParam,
      difficulty: difficulty || undefined,
      limit: 50,
      shuffle: "true",
    },
    {
      query: {
        queryKey: getListFlashcardsQueryKey({
          skills: skillsParam,
          category: categoryParam,
          difficulty: difficulty || undefined,
          limit: 50,
          shuffle: "true",
        }),
      },
    }
  );

  const cards: Flashcard[] = (data?.questions as Flashcard[]) ?? [];
  const total = cards.length;
  const card = cards[currentIndex];

  const goNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => Math.min(i + 1, total - 1)), 150);
  }, [total]);

  const goPrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => Math.max(i - 1, 0)), 150);
  }, []);

  const flipCard = useCallback(() => setIsFlipped((f) => !f), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); flipCard(); }
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flipCard, goNext, goPrev]);

  // Reset index when data changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [skillsParam, categoryParam, difficulty]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-primary/60 text-sm tracking-widest animate-pulse">&gt; LOADING DATABASE...</div>
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-2 h-8 bg-primary/30 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <p className="text-primary/40 text-sm">&gt; NO CARDS FOUND FOR THESE FILTERS</p>
        <a href="/browse" className="text-primary border border-primary/40 px-4 py-2 text-sm hover:bg-primary/10 transition-colors">
          [BROWSE ALL QUESTIONS]
        </a>
      </div>
    );
  }

  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-primary glow font-bold tracking-wider">
            &gt; FLASHCARD_STUDY
          </h2>
          {skillsParam && (
            <p className="text-primary/40 text-xs mt-1">
              SKILLS: {skillsParam.split(",").join(" · ")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {(["", "beginner", "intermediate", "advanced"] as const).map((d) => (
            <button
              key={d || "all"}
              data-testid={`filter-difficulty-${d || "all"}`}
              onClick={() => setDifficulty(d)}
              className={`text-xs px-2 py-1 border rounded tracking-wider transition-colors ${
                difficulty === d
                  ? "bg-primary text-black border-primary"
                  : "border-primary/30 text-primary/50 hover:border-primary hover:text-primary"
              }`}
            >
              {d || "ALL"}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-primary/50 mb-1 tracking-wider">
          <span>CARD {currentIndex + 1} / {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1 bg-primary/10 rounded overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      {card && (
        <div className="mb-6">
          <div className="flex gap-2 mb-3 text-xs">
            <span className="border border-primary/30 text-primary/60 px-2 py-0.5 rounded uppercase tracking-wider">
              {card.category}
            </span>
            <span className={`border px-2 py-0.5 rounded uppercase tracking-wider ${DIFFICULTY_COLORS[card.difficulty]}`}>
              {card.difficulty}
            </span>
          </div>

          <div
            data-testid="flashcard"
            onClick={flipCard}
            className="cursor-pointer"
            style={{ perspective: "1000px" }}
          >
            <div
              style={{
                transformStyle: "preserve-3d",
                transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                position: "relative",
                minHeight: "260px",
              }}
            >
              {/* Front */}
              <div
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                className="absolute inset-0 bg-black border border-primary/40 rounded p-8 flex flex-col justify-center"
              >
                <p className="text-primary/30 text-xs tracking-widest mb-4">&gt; QUESTION</p>
                <p className="text-primary text-xl leading-relaxed">{card.question}</p>
                <p className="text-primary/20 text-xs mt-6 tracking-wider">
                  CLICK OR PRESS SPACE TO REVEAL
                </p>
              </div>

              {/* Back */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
                className="absolute inset-0 bg-[#001a00] border border-primary rounded p-8 flex flex-col justify-center"
              >
                <p className="text-primary/50 text-xs tracking-widest mb-4">&gt; ANSWER</p>
                <p className="text-primary text-base leading-relaxed">{card.answer}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 items-center justify-center">
        <button
          data-testid="button-prev"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="border border-primary/40 text-primary px-6 py-2 text-sm tracking-wider hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded"
        >
          [PREV]
        </button>
        <button
          data-testid="button-flip"
          onClick={flipCard}
          className="border-2 border-primary text-primary px-8 py-2 text-sm tracking-wider hover:bg-primary hover:text-black transition-colors font-bold rounded"
        >
          {isFlipped ? "[HIDE]" : "[FLIP]"}
        </button>
        <button
          data-testid="button-next"
          onClick={goNext}
          disabled={currentIndex === total - 1}
          className="border border-primary/40 text-primary px-6 py-2 text-sm tracking-wider hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded"
        >
          [NEXT]
        </button>
      </div>

      <p className="text-center text-primary/20 text-xs mt-4 tracking-wider">
        KEYBOARD: SPACE = FLIP · ← → = NAVIGATE
      </p>
    </div>
  );
}
