// File: app/api/categories/names/route.ts

import { NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import {Category} from '@/models/Category';

export async function GET() {
  try {
    await connectDb();
    const categories = await Category.find().select('category');
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
