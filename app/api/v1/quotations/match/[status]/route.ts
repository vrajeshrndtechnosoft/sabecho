import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Quotation from '@/models/Quotation';

export async function POST(req: NextRequest, { params }: { params: Promise<{ status: string }> }) {
  try {
    await connectDb();
    const { email } = await req.json();
    const { status } = await params;

    const results = await Quotation.aggregate([
      {
        $match: {
          selectedCompanies: {
            $elemMatch: {
              email,
              status: status,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'pid',
          foreignField: 'pid',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $addFields: {
          selectedCompanies: {
            $filter: {
              input: '$selectedCompanies',
              as: 'company',
              cond: {
                $and: [
                  { $eq: ['$$company.email', email] },
                  { $eq: ['$$company.status', status] },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          productName: 1,
          status: 1,
          _id: 1,
          pid: 1,
          averageQty: 1,
          specification: 1,
          reqId: 1,
          requirementId: 1,
          measurement: 1,
          selectedCompanies: 1,
          'productDetails.hsnCode': 1,
          'productDetails.gstPercentage': 1,
        },
      },
    ]);

    return NextResponse.json(results);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}