import { NextRequest, NextResponse } from "next/server";
import { otpMap } from "@/lib/otpMap";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const createdAt = Date.now();

    otpMap.set(email, { otp, createdAt });

    // Predefined demo OTPs
    otpMap.set("customer@gmail.com", { otp: "123456", createdAt });
    otpMap.set("seller@gmail.com", { otp: "123456", createdAt });
    otpMap.set("admin@gmail.com", { otp: "123456", createdAt });

    // You can integrate nodemailer here later for real OTP emails
    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
