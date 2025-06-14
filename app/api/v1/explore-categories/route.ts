// File: app/api/explore-category/route.ts 
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import ExploreCategory from "@/models/home/ExploreCategory";

export async function GET() {
  try {
    await connectDb();
    const categories = await ExploreCategory.find();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
