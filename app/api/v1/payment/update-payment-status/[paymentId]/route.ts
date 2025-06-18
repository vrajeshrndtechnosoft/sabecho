import Payment from "@/models/Payment";
import { NextRequest, NextResponse } from "next/server";

// app/api/payment/update-payment-status/[paymentId]/route.ts
export async function PATCH(
  req: NextRequest,
  { params }: {params: Promise<{ paymentId: string }> }
) {
  try {
    const { status } = await req.json();
    const { paymentId } = await params;
    const updatedPayment = await Payment.findOneAndUpdate(
      { paymentId: paymentId },
      { status },
      { new: true }
    );

    if (!updatedPayment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    return NextResponse.json(updatedPayment);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}