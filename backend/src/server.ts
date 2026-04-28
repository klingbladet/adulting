import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { auth } from "./utils/auth";
import aiRoutes from "./api/ai/routes";
import sessionRoutes from "./routes/session";
import adminRoutes from "./routes/admin";

const app = express();
const port = Number(process.env.PORT || 3001);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3002",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api", sessionRoutes);
app.use("/api", adminRoutes);
app.use("/api/auth", toNodeHandler(auth));

app.get("/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);

    res.status(200).json({
      ok: true,
      server: "up",
      db: "up",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      ok: false,
      server: "up",
      db: "down",
      error: message,
    });
  }
});

app.post("/sign-in", (req, res) => {
  console.log(req.body);
  res.json({ ok: true });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend running on http://localhost:${port}`);
});