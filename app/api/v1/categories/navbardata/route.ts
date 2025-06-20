// File: app/api/categories/navbardata/route.ts

import { connectDb } from "@/lib/db";
import { Category } from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();
    const categories = await Category.find({});
    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error('Error fetching navbar data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}