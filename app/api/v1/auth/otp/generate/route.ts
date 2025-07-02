// api/generate-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import OTP from "@/models/OTP";
// import { transporter } from "@/lib/transporter";
// import { HTML_TEMPLATE } from "@/lib/templates/otp_template"; // Import your HTML template

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const { email } = await req.json();
    
    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP for", email, ":", otp);
    
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
    
    // // Prepare email with HTML template
    // const mailOptions = {
    //   from: "info@sabecho.com",
    //   to: email,
    //   subject: "Email Verification OTP - SABECHO",
    //   text: `Your OTP for email verification is: ${otp}. This OTP is valid for 5 minutes.`,
    //   html: HTML_TEMPLATE(otp), // Use the HTML template
    // };

    // // Send email
    // const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent successfully:", info.messageId);
    
    return NextResponse.json({ 
      message: "OTP generated and sent successfully",
      expiresAt,
      success: true
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error generating/sending OTP:", error);
    
    // More specific error handling
    if (error.code === 'EAUTH') {
      return NextResponse.json({ 
        error: "Email authentication failed. Please check email credentials." 
      }, { status: 500 });
    } else if (error.code === 'ECONNECTION') {
      return NextResponse.json({ 
        error: "Failed to connect to email server." 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Error generating OTP. Please try again." 
    }, { status: 500 });
  }
}