// api/generate-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import OTP from "@/models/OTP";
// import { transporter } from "@/lib/transporter";

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const { email } = await req.json();
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP :", otp);
    
    // Calculate expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // Delete any existing OTP for this email
    await OTP.deleteOne({ email });
    
    // Create new OTP document
    const otpDoc = new OTP({
      email,
      otp,
      createdAt: new Date(),
      expiresAt
    });
    
    await otpDoc.save();
    
    // const mailOptions = {
    //   from: "info@sabecho.com",
    //   to: email,
    //   subject: "Email Verification OTP",
    //   text: `Your OTP for email verification is: ${otp}`,
    // };

    // const info = await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ 
      message: "OTP generated and sent successfully",
      expiresAt 
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return NextResponse.json({ error: "Error generating OTP" }, { status: 500 });
  }
}