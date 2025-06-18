// app/api/products/code/[pid]/route.ts
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pid: string }> }
) {
  await connectDb();

  try {
    const { pid } = await params;
    const products = await Product.find({ pid }).select("hsnCode gstPercentage");
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching product code details:", error);
    return NextResponse.json(
      { message: "Oops! Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
