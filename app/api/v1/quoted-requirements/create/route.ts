import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import QuotaRequirementCollection from '@/models/QuotationRequirementCollection';
import { sendCustomerQuotationPrice } from '@/lib/sendProductInquiryEmail';

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();

    const newRequirement = new QuotaRequirementCollection({
      ...body,
      negotiationDetails: {}
    });

    const saved = await newRequirement.save();
    await sendCustomerQuotationPrice(saved);

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Error creating quota requirement:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
