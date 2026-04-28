import { Router } from "express";
import { asc } from "drizzle-orm";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "../db"
import { auth } from "../utils/auth";
import { user } from "../db/auth-schema";

const router = Router();

router.get("/admin/users", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = session.user?.role ?? "user";
    const roles = String(role)
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    const isAdmin = roles.includes("admin");

    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(asc(user.createdAt));

    return res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

export default router;