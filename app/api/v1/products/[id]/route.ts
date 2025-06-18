// app/api/products/[id]/route.ts
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();

  try {
    const { id } = await params;
    const product = await Product.findById(id);

    if (product) {
      return NextResponse.json(product, { status: 200 });
    } else {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error in GET /products/:id:", error);
    return NextResponse.json(
      { message: "Oops! Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();

  const { id } = await params;
  const { price, name, brand } = await req.json();

  try {
    let product;

    if (id && id !== "null" && id !== "undefined") {
      // Update by product ID
      product = await Product.findByIdAndUpdate(
        id,
        { price },
        { new: true }
      );
    } else if (name && brand) {
      // Fallback: update by name & brand
      product = await Product.findOneAndUpdate(
        { name, brand },
        { price },
        { new: true }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid update request. Provide product ID or name & brand." },
        { status: 400 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product price updated successfully.",
      product,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating product price:", error);
    return NextResponse.json(
      {
        message: "Oops! Something went wrong. Please try again later.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
