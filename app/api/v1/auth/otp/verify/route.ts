import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const { email, userType } = await req.json();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, userType });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email, userType },
      process.env.JWT_SECRET as string,
      { expiresIn: "7h" }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Error verifying OTP" }, { status: 500 });
  }
}
