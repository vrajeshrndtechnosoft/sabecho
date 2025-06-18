// app/api/payment/payment-details/route.ts
import Payment from '@/models/Payment';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const payments = await Payment.find({ 'orderDetails.buyer_email': email });
    return NextResponse.json(payments);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}