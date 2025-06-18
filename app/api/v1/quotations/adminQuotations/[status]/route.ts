import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Quotation from '@/models/Quotation';

export async function GET(_: NextRequest, { params }: { params: Promise<{ status: string }> }) {
  try {
    await connectDb();
    const { status } = await params;

    const adminQuotations = await Quotation.find({ status }).sort({ createdAt: -1 });

    if (!adminQuotations || adminQuotations.length === 0) {
      return NextResponse.json({ message: 'No quotations found for admin' }, { status: 404 });
    }

    return NextResponse.json(adminQuotations);
  } catch (error) {
    console.error('Error fetching admin quotations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
