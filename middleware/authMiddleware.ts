// lib/middleware/verifyToken.ts
import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "@/lib/jwtConfig";

interface DecodedUser extends JwtPayload {
  id: string;
  email: string;
  userType?: string;
}

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  user: DecodedUser;
}

export function verifyToken(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const authHeader =
      req.headers.authorization ||
      (req.cookies?.admintoken ? `Bearer ${req.cookies.admintoken}` : "");

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    try {
      const decoded = jwt.verify(token, config.secret);
      if (typeof decoded === "string" || !decoded || !("id" in decoded) || !("email" in decoded)) {
        res.status(403).json({ message: "Unauthorized: Invalid token payload" });
        return;
      }

      (req as AuthenticatedNextApiRequest).user = decoded as DecodedUser;
      await handler(req as AuthenticatedNextApiRequest, res);
    } catch (error) {
      console.error("JWT verification failed:", error);
      res.status(403).json({ message: "Unauthorized: Invalid token" });
    }
  };
}
