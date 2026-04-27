import { Request, Response, NextFunction } from "express"
import { auth } from "../../../utils/auth"

export const checkRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next:
    NextFunction) => {
      try {
        const session = await auth.api.getSession({
          headers: new Headers(req.headers as any),
        });
        if (!session) {
          res.status(401).json({ error: "Unauthorized - Please sign in" });
          return;
        }
        const userRole = session.user.role;
        if(!allowedRoles.includes(userRole)) {
          res.status(403).json({
            error: "Forbidden - You do not have the required permissions"
          });
          return;
        }
        
        // ifall allt är okej, släpp förbi användaren till nästa funktion (routen)
        next();
      } catch (error) {
        console.error("Role Middleware Error", error);
        res.status(500).json ({ error: "Internal server error during role validation" });
    }
  };
};

