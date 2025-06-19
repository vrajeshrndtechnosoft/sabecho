/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDb } from "@/lib/db";
import Payment from "@/models/Payment";
import QuotaRequirementCollection from "@/models/QuotationRequirementCollection";
import Requirement from "@/models/Requirement";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: "rzp_test_4kJGZ6vUcstgUm",
  key_secret: "Di3r7vCoOb3t7E1UYJ8v9K6P",
});

export async function POST(req: NextRequest) {
  try {
    // Connect to DB
    await connectDb();

    const body = await req.json();
    const { paymentId, orderDetails, amount, status } = body;

    // Fetch payment from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    // Create and save the payment document
    const newPayment = new Payment({
      paymentId,
      orderDetails,
      amount,
      status,
      paymentDetails: payment,
    });

    const savedPayment = await newPayment.save();

    // Update related documents
    const updatePromises = orderDetails.map((item: any) => {
      return Promise.all([
        QuotaRequirementCollection.findByIdAndUpdate(item._id, {
          status: "completed",
        }),
        Requirement.findOneAndUpdate(
          { reqId: item.reqId },
          { status: "completed" }
        ),
      ]);
    });

    await Promise.all(updatePromises);

    return NextResponse.json(savedPayment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
