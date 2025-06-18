// app/api/products/[productId]/assignSellers/route.ts
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  await connectDb();

  try {
    const { productId } = await params;
    const body = await req.json();

    if (!body?.data || !Array.isArray(body.data.assignedSellers)) {
      return NextResponse.json(
        { message: "Invalid request body structure" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingSellerIds = product.assignedSellers.map((seller: any) =>
      seller.toString()
    );  
    const newSellerIds = body.data.assignedSellers.filter(
      (id: string) => !existingSellerIds.includes(id)
    );

    const uniqueAssignedSellers = [...new Set([...existingSellerIds, ...newSellerIds])];

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: { assignedSellers: uniqueAssignedSellers } },
      { new: true }
    );

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating assigned sellers:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
