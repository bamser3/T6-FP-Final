import axios from "axios";

const BASE = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "/api";

const api = axios.create({ baseURL: BASE });

export async function extractFromText(text: string) {
  const { data } = await api.post("/extract/text", { text });
  return data;
}

export async function extractFromUrl(url: string) {
  const { data } = await api.post("/extract/url", { url });
  return data;
}

export async function listFlashcards(params?: {
  skills?: string;
  category?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
  shuffle?: string;
}) {
  const { data } = await api.get("/flashcards", { params });
  return data;
}

export async function listCategories() {
  const { data } = await api.get("/flashcards/categories");
  return data;
}

export async function getStats() {
  const { data } = await api.get("/flashcards/stats");
  return data;
}
