import { NextRequest, NextResponse } from 'next/server';
import Requirement from '@/models/Requirement';
import { sendProductInquiryEmail } from '@/lib/sendProductInquiryEmail';
import {connectDb} from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const body = await req.json();

    const newRequirement = new Requirement(body);

    // Send email
    await sendProductInquiryEmail(body.email, body);

    // Save requirement
    const savedRequirement = await newRequirement.save();

    return NextResponse.json(savedRequirement, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
