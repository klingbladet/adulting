import "dotenv/config";
console.log("--- SERVER STARTING ---");
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { auth } from "./utils/auth";
import aiRoutes from "./api/routes/ai";
import sessionRoutes from "./api/routes/session";
import adminRoutes from "./api/routes/admin";
import courseRoutes from "./api/routes/course-routes";
import userRoutes from "./api/routes/users"
import onboardingRouter from "./api/routes/onboarding";
import learningRoutes from "./api/routes/learning-routes";
import learningAssistantRoutes from "./api/routes/learning-assistant-routes";
import blockRoutes from "./api/routes/block-routes";
import quizRoutes from "./api/routes/quiz-routes";


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

app.use("/api/users", userRoutes);

app.use(express.json());

// Lägg till denna för att debugga 404
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/courses", courseRoutes);
app.use("/api/courses", blockRoutes);
app.use("/api/courses", quizRoutes);
app.use("/api", sessionRoutes);
app.use("/api", adminRoutes);
app.use("/api/auth", toNodeHandler(auth));
app.use("/api/ai", aiRoutes)
app.use("/api/onboarding", onboardingRouter);
app.use("/api/learning", learningRoutes);
app.use("/api/learning-assistant", learningAssistantRoutes);


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

app.use("/api/auth", toNodeHandler(auth));

// --- NYTT: Fånga alla 404 för att debugga ---
app.use((req, res) => {
  console.log(`404 på: ${req.method} ${req.url}`);
  res.status(404).json({
    error: "Route not found",
    tried: `${req.method} ${req.url}`,
    hint: "Kolla att du använder http://localhost:3001/api/courses"
  });
});

import { Server } from "socket.io";

const io = new Server(3002, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log("Joined room:", roomId);
  });

  socket.on("send_message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


app.listen(port, "0.0.0.0", () => {
  console.log(`Backend running on http://localhost:${port}`);
});
