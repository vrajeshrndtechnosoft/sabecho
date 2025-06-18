import { connectDb } from "@/lib/db";
import Negotiation from "@/models/Negotiation";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();

  try {
    // Await the params Promise to get the actual params object
    const { id } = await params;
    
    const negotiation = await Negotiation.findById(id);

    if (!negotiation) {
      return NextResponse.json({ message: 'Negotiation not found' }, { status: 404 });
    }

    return NextResponse.json(negotiation);
  } catch (error) {
    console.error('Error fetching negotiation for edit:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}