import { NextResponse } from 'next/server';
import Negotiation from '@/models/Negotiation';
import QuotaRequirementCollection  from '@/models/QuotationRequirementCollection';

export async function GET(req: Request, {params} :{params: Promise<{ id: string; commission: string }>}) {
  try {
    const { id, commission } = await params;
    const newCommissionRate = parseFloat(commission);

    const negotiation = await Negotiation.findById(id);

    if (!negotiation) {
      return NextResponse.json({ message: 'Negotiation not found' }, { status: 404 });
    }

    const { previewAmount } = negotiation.negotiationDetails;
    const deduction = previewAmount * (5 / 100);
    const newAmount = previewAmount - deduction;

    const updatedNegotiation = await Negotiation.findByIdAndUpdate(
      id,
      {
        $set: {
          'negotiationDetails.newAmount': newAmount,
          commission: newCommissionRate,
          status: 'seller_responded',
        },
      },
      { new: true }
    );

    if (!updatedNegotiation) {
      return NextResponse.json({ message: 'Negotiation not found' }, { status: 404 });
    }

    const quotaRequirements = await QuotaRequirementCollection.find({
      reqId: negotiation.requestInfo.requestId,
    });

    await Promise.all(
      quotaRequirements.map(async (quotaRequirement) => {
        await QuotaRequirementCollection.findByIdAndUpdate(quotaRequirement._id, {
          $set: { negotiationDetails: updatedNegotiation.negotiationDetails },
        });
      })
    );

    return NextResponse.json(updatedNegotiation);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
