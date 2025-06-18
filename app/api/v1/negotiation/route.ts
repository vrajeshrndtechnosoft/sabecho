import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Negotiation from '@/models/Negotiation';

export async function POST(req: NextRequest) {
  await connectDb();
  const body = await req.json();

  try {
    const newNegotiation = new Negotiation(body);
    await newNegotiation.save();
    return NextResponse.json(newNegotiation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create negotiation', error },
      { status: 500 }
    );
  }
}
