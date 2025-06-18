import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Category } from "@/models/Category";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await connectDb();
    
    // Await the params Promise before accessing categoryId
    const { categoryId } = await params;
    
    const { category } = await req.json();
    
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: { category } },
      { new: true }
    );
    
    if (!updatedCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}