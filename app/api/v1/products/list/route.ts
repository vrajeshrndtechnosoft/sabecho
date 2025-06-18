// app/api/products/list/route.ts
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDb();

  try {
    const products = await Product.find().select("name minQty pid measurements");
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products list:", error);
    return NextResponse.json(
      { message: "Oops! Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
