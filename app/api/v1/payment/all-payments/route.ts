import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    // Convert to UNIX timestamps if provided
    const from = fromStr ? Math.floor(new Date(fromStr).getTime() / 1000) : undefined;
    const to = toStr ? Math.floor(new Date(toStr).getTime() / 1000) : undefined;

    const params: {
      from?: number;
      to?: number;
    } = {};

    if (from) params.from = from;
    if (to) params.to = to;

    const payments = await razorpay.payments.all(params);

    return NextResponse.json(payments);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
