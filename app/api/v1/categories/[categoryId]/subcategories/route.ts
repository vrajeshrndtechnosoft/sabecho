
// File: app/api/categories/[categoryId]/subcategories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import {Category, } from '@/models/Category'

export async function GET(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
    if (!categoryId) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    await connectDb();
    const category = await Category.findById(categoryId);

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subcategories = category.subCategory.map((subcategory: any) => ({
      _id: subcategory._id,
      name: subcategory.name,
    }));

    return NextResponse.json(subcategories, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}