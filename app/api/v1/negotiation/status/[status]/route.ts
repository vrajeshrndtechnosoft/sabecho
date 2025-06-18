// app/api/negotiations/[status]/route.ts
import { NextResponse } from 'next/server';
import Negotiation from '@/models/Negotiation';

export async function GET(req: Request, { params }: { params: Promise<{ status: string }> }) {
  try {
    const { status } = await params;
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const negotiations = await Negotiation.find({
      sellerEmail: email,
      status,
    }).select('negotiationDetails productDetails negId');

    return NextResponse.json(negotiations);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}