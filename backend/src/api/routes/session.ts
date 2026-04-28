import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../utils/auth";

const router = Router();

router.get("/session", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      session,
    });
  } catch (error) {
    console.error("Session route error:", error);
    return res.status(500).json({ authenticated: false });
  }
});

export default router;