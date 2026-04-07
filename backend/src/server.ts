import "dotenv";
import express from "express";
import cors from "cors";
import { db } from "./db";

const app = express();
const port = process.env.PORT || 3001;



app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await db.execute("SELECT 1");

    res.status(200).json({
      ok: true,
      server: "up",
      db: "up",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      server: "up",
      db: "down",
      error: error.message,
    });
  }
});

app.listen(port, () => {
    console.log(`Servern kör på http://localhost:${port}`);
})
