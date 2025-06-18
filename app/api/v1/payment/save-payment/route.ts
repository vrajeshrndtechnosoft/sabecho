/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import Payment from '@/models/Payment';
import QuotaRequirementCollection from '@/models/QuotationRequirementCollection';
import Requirement from '@/models/Requirement';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { paymentId, orderDetails, amount, status } = await req.json();

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    // Create a new payment entry
    const newPayment = new Payment({
      paymentId,
      orderDetails,
      amount,
      status,
      paymentDetails: payment,
    });

    // Save the payment entry to the database
    const savedPayment = await newPayment.save();

    // Update related collections
    await Promise.all(
      orderDetails.map((item: any) =>
        Promise.all([
          QuotaRequirementCollection.findByIdAndUpdate(item._id, { status: 'completed' }),
          Requirement.findOneAndUpdate({ reqId: item.reqId }, { status: 'completed' }),
        ])
      )
    );

    return NextResponse.json(savedPayment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
