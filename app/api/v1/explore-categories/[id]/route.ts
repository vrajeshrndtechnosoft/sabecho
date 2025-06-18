import { NextRequest, NextResponse } from "next/server";
import ExploreCategory from "@/models/home/ExploreCategory";
import { connectDb } from '@/lib/db';

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }  // ✅ Changed to Promise
) {
  try {
    await connectDb();
    
    // ✅ Await the params before accessing id
    const { id } = await params;
    
    const category = await ExploreCategory.findById(id);
    
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}