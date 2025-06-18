// app/api/measurement/list/route.ts
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDb();

  try {
    const uniqueNames = await Product.distinct("measurement");
    return NextResponse.json(uniqueNames, { status: 200 });
  } catch (error) {
    console.error("Error fetching measurements:", error);
    return NextResponse.json(
      { message: "Oops! Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
