import { Router } from "express";
import {
  getAllQuestions,
  getQuestionsBySkills,
  getCategories,
  getQuestionById,
} from "../lib/questions";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  const { skills, category, limit = "20", offset = "0", shuffle = "true", difficulty } = req.query as Record<string, string>;

  let questions = skills
    ? getQuestionsBySkills(skills.split(",").map(s => s.trim().toLowerCase()))
    : getAllQuestions();

  if (category) {
    questions = questions.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }

  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty);
  }

  if (shuffle !== "false") {
    questions = [...questions].sort(() => Math.random() - 0.5);
  }

  const total = questions.length;
  const off = parseInt(offset, 10) || 0;
  const lim = parseInt(limit, 10) || 20;
  const paginated = questions.slice(off, off + lim);

  res.json({ success: true, total, offset: off, limit: lim, questions: paginated });
});

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = getCategories();
  res.json({ success: true, categories });
});

router.get("/stats", async (_req, res): Promise<void> => {
  const all = getAllQuestions();
  const cats = getCategories();
  const breakdown = cats.map(cat => ({
    category: cat,
    count: all.filter(q => q.category === cat).length,
  }));
  res.json({ success: true, total: all.length, breakdown });
});

router.get("/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const id = parseInt(raw ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const question = getQuestionById(id);
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.json({ success: true, question });
});

export default router;
