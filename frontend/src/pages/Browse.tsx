import { useState, useEffect } from "react";

interface Flashcard {
  id: number;
  category: string;
  skill: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  question: string;
  answer: string;
}

const DIFFICULTY_COLORS = {
  beginner:     "text-[#00ff41] border-[#00ff41]/50",
  intermediate: "text-[#ffaa00] border-[#ffaa00]/50",
  advanced:     "text-[#ff5500] border-[#ff5500]/50",
};

const API = "/api";

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/flashcards/categories`).then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
    fetch(`${API}/flashcards/stats`).then((r) => r.json()).then((d) => setTotal(d.total ?? 0));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const q = new URLSearchParams({ limit: "200", shuffle: "false" });
    if (selectedCategory) q.set("category", selectedCategory);
    if (selectedDifficulty) q.set("difficulty", selectedDifficulty);
    fetch(`${API}/flashcards?${q}`)
      .then((r) => r.json())
      .then((d) => setAllCards(d.questions ?? []))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, selectedDifficulty]);

  const filtered = allCards.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q) || c.skill.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      <aside className="w-48 shrink-0">
        <div className="sticky top-20 bg-black/60 border border-primary/20 rounded p-4">
          <p className="text-xs tracking-widest text-primary/50 mb-4">&gt; FILTERS</p>
          <div className="mb-4 pb-4 border-b border-primary/10">
            <p className="text-primary text-xl font-bold">{total}</p>
            <p className="text-primary/40 text-xs">TOTAL QUESTIONS</p>
          </div>
          <div className="mb-4">
            <p className="text-primary/40 text-xs tracking-wider mb-2">DIFFICULTY</p>
            {(["", "beginner", "intermediate", "advanced"] as const).map((d) => (
              <button key={d || "all"} onClick={() => setSelectedDifficulty(d)} className={`w-full text-left text-xs py-1 px-2 rounded mb-1 tracking-wider transition-colors ${selectedDifficulty === d ? "bg-primary/20 text-primary border-l-2 border-primary" : "text-primary/50 hover:text-primary hover:bg-primary/10"}`}>
                {d ? d.toUpperCase() : "ALL"}
              </button>
            ))}
          </div>
          <div>
            <p className="text-primary/40 text-xs tracking-wider mb-2">CATEGORY</p>
            <button onClick={() => setSelectedCategory("")} className={`w-full text-left text-xs py-1 px-2 rounded mb-1 tracking-wider transition-colors ${!selectedCategory ? "bg-primary/20 text-primary border-l-2 border-primary" : "text-primary/50 hover:text-primary hover:bg-primary/10"}`}>ALL</button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)} className={`w-full text-left text-xs py-1 px-2 rounded mb-1 transition-colors ${selectedCategory === cat ? "bg-primary/20 text-primary border-l-2 border-primary" : "text-primary/50 hover:text-primary hover:bg-primary/10"}`}>{cat}</button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-primary font-bold tracking-wider shrink-0">&gt; QUESTION_DATABASE</h2>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH QUESTIONS..." className="bg-black border border-primary/30 text-primary text-xs px-3 py-2 rounded w-full max-w-sm focus:outline-none focus:border-primary placeholder-primary/20" />
        </div>
        <p className="text-primary/40 text-xs mb-4 tracking-wider">SHOWING {filtered.length} QUESTIONS</p>
        {isLoading ? (
          <div className="text-primary/40 text-sm animate-pulse tracking-widest">&gt; LOADING...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((card) => (
              <div key={card.id} className="border border-primary/20 rounded bg-black/50 hover:border-primary/40 transition-colors">
                <button onClick={() => setExpandedId(expandedId === card.id ? null : card.id)} className="w-full text-left p-4 flex items-start gap-3">
                  <span className="text-primary/30 text-xs font-mono shrink-0 mt-0.5">{String(card.id).padStart(3, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-primary/50 text-xs border border-primary/20 px-2 py-0.5 rounded uppercase">{card.category}</span>
                      <span className={`text-xs border px-2 py-0.5 rounded uppercase ${DIFFICULTY_COLORS[card.difficulty]}`}>{card.difficulty}</span>
                    </div>
                    <p className="text-primary text-sm leading-relaxed">{card.question}</p>
                  </div>
                  <span className="text-primary/30 text-xs shrink-0 ml-2 mt-0.5">{expandedId === card.id ? "[-]" : "[+]"}</span>
                </button>
                {expandedId === card.id && (
                  <div className="px-4 pb-4 border-t border-primary/10 pt-3 ml-8">
                    <p className="text-primary/40 text-xs tracking-wider mb-2">&gt; ANSWER:</p>
                    <p className="text-primary/80 text-sm leading-relaxed">{card.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
