import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "@/lib/jwtConfig";

export interface DecodedUser extends JwtPayload {
  id: string;
  email: string;
  userType?: string;
}

export async function verifyToken(req: NextRequest): Promise<DecodedUser | null> {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("admintoken")?.value;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : cookieToken;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, config.secret);
    if (
      typeof decoded === "string" ||
      !decoded ||
      !("id" in decoded) ||
      !("email" in decoded)
    ) {
      return null;
    }

    return decoded as DecodedUser;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
