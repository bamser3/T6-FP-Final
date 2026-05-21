import express from "express";
import cors from "cors";
import extractRouter from "./routes/extract.js";
import flashcardsRouter from "./routes/flashcards.js";

const app = express();
const PORT = process.env["PORT"] ?? 5000;

app.use(cors());
app.use(express.json());

app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));
app.use("/api/extract", extractRouter);
app.use("/api/flashcards", flashcardsRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
