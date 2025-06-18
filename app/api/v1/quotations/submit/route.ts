import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Requirement from '@/models/Requirement';
import Quotation from '@/models/Quotation';
import { sendProductQuotationEmail } from '@/lib/sendProductInquiryEmail';

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { selectedCompanies, requirementId, pid, productName, averageQty, specification, measurement, reqId } = body;

    await Promise.all(
      selectedCompanies.map(async (company: string) => {
        await Requirement.updateOne(
          { email: company, name: productName },
          { $set: { status: "Accepted" } }
        );
      })
    );

    const quotationData = selectedCompanies.map((company: string) => ({
      email: company,
      amount: null,
      description: '',
      status: 'pending',
    }));

    const quotation = new Quotation({
      selectedCompanies: quotationData,
      productName,
      averageQty,
      measurement,
      reqId,
      specification,
      requirementId,
      pid,
      status: 'pending',
    });

    await quotation.save();
    await sendProductQuotationEmail(quotation);

    return NextResponse.json({ message: 'Quotation submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error submitting quotation:', error);
    return NextResponse.json({ message: 'Failed to submit quotation' }, { status: 500 });
  }
}