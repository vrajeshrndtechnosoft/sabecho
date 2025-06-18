import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import QuotaRequirementCollection from '@/models/QuotationRequirementCollection';

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { email } = await req.json();

    const requirements = await QuotaRequirementCollection.find({
      buyer_email: email,
      status: { $in: ['Negotiation', 'Quoted', 'available'] }
    });

    return NextResponse.json(requirements);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}