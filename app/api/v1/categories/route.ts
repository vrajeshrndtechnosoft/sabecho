// File: app/api/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Category } from '@/models/Category';

export async function GET() {
  try {
    await connectDb();
    const categories = await Category.find().select('category');
    return NextResponse.json(categories, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { category, subCategory } = await req.json();

    const existingCategory = await Category.findOne({ category });
    if (existingCategory) {
      existingCategory.subCategory.push(...subCategory);
      const updatedCategory = await existingCategory.save();
      return NextResponse.json(updatedCategory, { status: 200 });
    }

    const newCategory = new Category({ category, subCategory });
    const savedCategory = await newCategory.save();
    return NextResponse.json(savedCategory, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
