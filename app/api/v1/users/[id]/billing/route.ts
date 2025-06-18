// app/api/user/[userId]/billing/route.ts
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';


interface BillingRequestBody {
  billingAddress?: string;
  shippingAddress?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: BillingRequestBody = await request.json();
    const { billingAddress, shippingAddress } = body;

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Only update billingDetails if billingAddress is provided
    if (
      billingAddress !== undefined &&
      billingAddress !== null &&
      billingAddress !== ""
    ) {
      user.billingDetails = billingAddress;
    }

    // Only update shippingDetails if shippingAddress is provided
    if (
      shippingAddress !== undefined &&
      shippingAddress !== null &&
      shippingAddress !== ""
    ) {
      user.shippingDetails = shippingAddress;
    }

    await user.save();

    return NextResponse.json(
      { message: "User details updated", user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user details:', error);
    return NextResponse.json(
      { message: "Error updating user details", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}