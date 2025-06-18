import { connectDb } from "@/lib/db";
import Negotiation from "@/models/Negotiation";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();

  try {
    const { newAmount, comment } = await req.json();
    const {id} = await params;

    const updated = await Negotiation.findByIdAndUpdate(
      id,
      {
        $set: {
          'negotiationDetails.newAmount': newAmount,
          'negotiationDetails.comment': comment,
          status: 'seller_responded',
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Negotiation not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating negotiation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();

  try {   
    const { id } = await params;
    const deleted = await Negotiation.findByIdAndDelete(id);
 
    if (!deleted) {
      return NextResponse.json({ message: 'Negotiation not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Negotiation deleted successfully' });
  } catch (error) {
    console.error('Error deleting negotiation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

