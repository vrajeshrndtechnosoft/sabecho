import { NextRequest, NextResponse } from 'next/server';
import Product from '@/models/Product';
import { connectDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';

    const products = await Product.find({
      name: { $regex: new RegExp(query, 'i') },
    }).select('categoryType categorySubType location name');

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
