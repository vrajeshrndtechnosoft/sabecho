// app/api/products/match/route.ts
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const { email, type } = await req.json();

    if (type !== "admin") {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
      }

      const matchedProducts = await Product.find({ email });
      return NextResponse.json(matchedProducts, { status: 200 });
    }

    const matchedProducts = await Product.find();
    return NextResponse.json(matchedProducts, { status: 200 });

  } catch (error) {
    console.error("Error in /products/match:", error);
    return NextResponse.json(
      { message: "Oops! Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
