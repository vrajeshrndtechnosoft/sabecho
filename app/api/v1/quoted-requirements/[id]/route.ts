import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import QuotaRequirementCollection from '@/models/QuotationRequirementCollection';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDb();
    const { id } = await params;
    const requirement = await QuotaRequirementCollection.findOne({ reqId: id });

    if (!requirement) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(requirement);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
