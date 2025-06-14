// app/api/users/route.ts
import { NextResponse } from "next/server";
import {connectDb} from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDb();
    const users = await User.find();
    return NextResponse.json(users, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
