// File: app/api/explore-category/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import ExploreCategory from "@/models/home/ExploreCategory";
import { connectDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDb();
    const category = await ExploreCategory.findById(params.id);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}