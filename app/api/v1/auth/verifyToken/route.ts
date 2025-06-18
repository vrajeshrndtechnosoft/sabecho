import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
export async function POST(req: NextRequest) {
  const jwt_secret: string = process.env.JWT_SECRET || "DEV_SECRET"
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token not provided" }, { status: 400 });
    }
    const decoded = jwt.verify(token, jwt_secret)
      return NextResponse.json(decoded)
  } catch (error) {
    console.error("Invalid token:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
