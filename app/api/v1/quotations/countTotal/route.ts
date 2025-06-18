import { NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Quotation from '@/models/Quotation';
import Requirement from '@/models/Requirement';
import News from '@/models/News';

export async function GET() {
  try {
    await connectDb();
    const [totalUsers, totalProducts, totalQuotations, totalRequirements, totalNews] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Quotation.countDocuments(),
      Requirement.countDocuments(),
      News.countDocuments(),
    ]);

    return NextResponse.json({ totalUsers, totalProducts, totalQuotations, totalRequirements, totalNews });
  } catch (error) {
    console.error('Error fetching total counts:', error);
    return NextResponse.json({ message: 'Failed to fetch total counts' }, { status: 500 });
  }
}