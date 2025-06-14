// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import {connectDb} from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { username, email, password, name } = await req.json();

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return NextResponse.json({ error: "User already exists" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, name });
    await user.save();

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
