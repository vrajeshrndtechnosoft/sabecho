import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import QuotaRequirementCollection from '@/models/QuotationRequirementCollection';

export async function GET(_: NextRequest, { params }: { params: Promise<{ status: string }> }) {
  try {
    await connectDb();
    const { status } = await params;
    const result = await QuotaRequirementCollection.aggregate([
      {
        $lookup: {
          from: 'negotiations',
          localField: 'reqId',
          foreignField: 'requestInfo.requestId',
          as: 'negotiation'
        }
      },
      {
        $match: {
          status: status
        }
      }
    ]);

    if (!result.length) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
