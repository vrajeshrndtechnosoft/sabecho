import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Negotiation from '@/models/Negotiation';
import QuotaRequirementCollection from '@/models/QuotationRequirementCollection';

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const body = await req.json();
    const {
      data: {
        negotiationValue,
        yourQty,
        deliveryRelatedInfo,
        messages,
        previewAmount,
        previewQty,
        measurement,
        SellerEmail
      },
      productData,
      orderData
    } = body;
    const { reqId } = orderData;

    if (!SellerEmail || !reqId || !negotiationValue || !yourQty) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const quotaRequirementCollection = await QuotaRequirementCollection.findOneAndUpdate(
      { reqId },
      { status: 'Negotiation', negotiation: false },
      { new: true }
    );

    if (!quotaRequirementCollection) {
      return NextResponse.json({ message: 'Quota Requirement Collection not found' }, { status: 404 });
    }

    const newNegotiation = new Negotiation({
      sellerEmail: SellerEmail,
      productDetails: {
        productName: productData.name,
        productId: productData._id,
        hsnCode: orderData.hsnCode || '',
        measurement: measurement || productData.measurement,
        gst: orderData.gstPercentage || 0
      },
      sellerInfo: {
        email: SellerEmail
      },
      requestInfo: {
        requestId: reqId,
        createdAt: new Date()
      },
      negotiationDetails: {
        customerOfferPriceWithCommission: parseFloat(negotiationValue),
        negotiationAmount: parseFloat(negotiationValue),
        negotiationQuantity: parseInt(yourQty),
        previewAmount: parseFloat(previewAmount),
        previewQuantity: parseInt(previewQty),
        comment: messages
      },
      additionalInfo: {
        deliveryInfo: deliveryRelatedInfo,
        description: messages
      },
      comments: {
        customer: messages
      },
      commission: orderData.commission || 0
    });

    await newNegotiation.save();

    return NextResponse.json(
      {
        message: 'Negotiation created successfully',
        negotiationId: newNegotiation.negId
      },
      { status: 201 }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
