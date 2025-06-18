import { connectDb } from "@/lib/db";
import Negotiation from "@/models/Negotiation";
import QuotaRequirementCollection from "@/models/QuotationRequirementCollection";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string; commission: string }> }
) {
  await connectDb();

  try {
    const { id, commission } = await params;
    const commissionRate = parseFloat(commission);
    const negotiation = await Negotiation.findById(id);

    if (!negotiation) {
      return NextResponse.json({ message: 'Negotiation not found' }, { status: 404 });
    }

    const deduction = negotiation.negotiationDetails.previewAmount * 0.05;
    const newAmount = negotiation.negotiationDetails.previewAmount - deduction;

    const updatedNegotiation = await Negotiation.findByIdAndUpdate(
      id,
      {
        $set: {
          'negotiationDetails.newAmount': newAmount,
          commission: commissionRate,
          status: 'seller_responded',
        },
      },
      { new: true }
    );

    const quotaRequirements = await QuotaRequirementCollection.find({
      reqId: negotiation.requestInfo.requestId,
    });

    await Promise.all(
      quotaRequirements.map(async (quota) => {
        await QuotaRequirementCollection.findByIdAndUpdate(quota._id, {
          $set: { negotiationDetails: updatedNegotiation.negotiationDetails },
        });
      })
    );

    return NextResponse.json(updatedNegotiation);
  } catch (error) {
    console.error('Error updating commission & syncing quotas:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
