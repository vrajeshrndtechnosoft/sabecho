import { connectDb } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

// app/api/users/[type]/route.ts
export async function GET(_: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    await connectDb();
    const {type} = await params;
    const users = await User.find({ userType: type });
    return NextResponse.json(users, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
