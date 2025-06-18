// File: src/app/api/negotiations/all/route.ts
import { NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Negotiation from '@/models/Negotiation';

export async function GET() {
  await connectDb();

  const negotiations = await Negotiation.find();

  if (negotiations.length === 0) {
    return NextResponse.json({ message: 'No negotiations found' }, { status: 404 });
  }

  return NextResponse.json(negotiations, { status: 200 });
}
