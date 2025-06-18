import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Quotation from '@/models/Quotation';

export async function GET(_: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  try {
    await connectDb();
    const { email } = await params;

    const quotedQuotations = await Quotation.find({
      "selectedCompanies.status": "Quoted",
      "selectedCompanies.email": email,
    }).sort({ createdAt: -1 });

    return NextResponse.json(quotedQuotations);
  } catch (error) {
    console.error('Error fetching quoted quotations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
