// app/api/updateNegotiationStatus/[id]/[commission]/route.ts
import { NextResponse } from 'next/server';
import Negotiation from '@/models/Negotiation';

export async function GET(req: Request, { params }: { params: Promise<{ id: string; commission: string }> }) {
  try {
    const { id, commission } = await params;
    const commissionPercentage = parseFloat(commission) / 100;

    const negotiation = await Negotiation.findById(id);

    if (!negotiation) {
      return NextResponse.json({ message: 'Negotiation not found' }, { status: 404 });
    }

    const updatedNegotiationAmount =
      negotiation.negotiationDetails.negotiationAmount / (1 + commissionPercentage);
    const updatedPreviewAmount =
      negotiation.negotiationDetails.previewAmount / (1 + commissionPercentage);

    const updatedNegotiation = await Negotiation.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          'negotiationDetails.negotiationAmount': Math.round(updatedNegotiationAmount),
          'negotiationDetails.negotiationQuantity': negotiation.negotiationDetails.negotiationQuantity,
          'negotiationDetails.previewAmount': Math.round(updatedPreviewAmount),
          'negotiationDetails.previewQuantity': negotiation.negotiationDetails.previewQuantity,
          status: 'pending_seller',
        },
      },
      { new: true }
    );

    return NextResponse.json(updatedNegotiation);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

