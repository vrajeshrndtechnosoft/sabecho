// api/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP"; // Import the OTP model
import jwt from "jsonwebtoken";

// Helper function to generate userId
function generateUserId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const { email, userType, otp } = await req.json();
    
    // Find the OTP document by email
    const storedOtp = await OTP.findOne({ email });
    
    console.log("Fetched OTP from DB:", storedOtp.otp);
    
    if (!storedOtp) {
      return NextResponse.json({ message: "OTP not found or expired" }, { status: 400 });
    }
    
    if (otp === storedOtp.otp) {
      // Find the User document by email
      let user = await User.findOne({ email });
      
      // If user doesn't exist, create with only required fields
      if (!user) {
        let userId: string = '';
        let isUnique = false;

        while (!isUnique) {
          userId = generateUserId();
          const existingUser = await User.findOne({ userId });
          if (!existingUser) isUnique = true;
        }

        user = new User({ 
          email, 
          userType: 'buyer',
          userId: userId
        });
        
        await user.save();
      }

      // Delete the OTP after successful verification
      await OTP.deleteOne({ email });

      const token = jwt.sign(
        { userId: user._id, email, userType },
        process.env.JWT_SECRET as string,
        { expiresIn: "24h" }
      );
      
      return NextResponse.json({ token });
    }
    
    return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Error verifying OTP" }, { status: 500 });
  }
}