import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import Negotiation from '@/models/Negotiation';
import QuotaRequirementCollection from '@/models/QuotationRequirementCollection'; // Make sure to import this model

// TypeScript interfaces for the request body
interface NegotiationData {
  negotiationValue: string;
  yourQty: string;
  deliveryRelatedInfo: string;
  messages: string;
  previewAmount: number;
  previewQty: number;
  measurement: string;
  SellerEmail: string;
}

interface ProductData {
  _id: string;
  name: string;
  minQty: number;
  company: string;
  pincode: string;
  gstNo: string;
  email: string;
  mobile: string;
  specification: string;
  measurement: string;
  userType: string;
  status: string;
  pid: number;
  createdAt: string;
  reqId: string;
  __v: number;
}

interface OrderData {
  _id: string;
  status: string;
  productName: string;
  commission: number;
  minQty: number;
  seller_email: string;
  amount: number;
  description: string;
  company: string;
  measurement: string;
  pincode: string;
  reqId: string;
  buyer_email: string;
  mobile: string;
  hsnCode: string;
  gstPercentage: number;
  negotiation: boolean;
  pid: number;
  created_at: string;
  __v: number;
}

interface RequestBody {
  data: NegotiationData;
  productData: ProductData;
  orderData: OrderData;
}

export async function POST(req: NextRequest) {
  await connectDb();
  
  try {
    const body: RequestBody = await req.json();
    
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

    // Debug logs
    console.log('Received request body:', JSON.stringify(body, null, 2));
    console.log('Extracted SellerEmail:', SellerEmail);
    console.log('Extracted reqId:', reqId);

    // Validate required fields
    if (!SellerEmail || !reqId || !negotiationValue || !yourQty) {
      return NextResponse.json(
        { 
          message: "Invalid request body",
          missing: {
            SellerEmail: !SellerEmail,
            reqId: !reqId,
            negotiationValue: !negotiationValue,
            yourQty: !yourQty
          }
        },
        { status: 400 }
      );
    }

    // Find and update the QuotaRequirementCollection
    const quotaRequirementCollection = await QuotaRequirementCollection.findOneAndUpdate(
      { reqId: reqId },
      { status: "Negotiation", negotiation: false },
      { new: true }
    );

    if (!quotaRequirementCollection) {
      return NextResponse.json(
        { message: "Quota Requirement Collection not found" },
        { status: 404 }
      );
    }

    // Create a new Negotiation
    const newNegotiation = new Negotiation({
      sellerEmail: SellerEmail,
      productDetails: {
        productName: productData.name,
        productId: productData._id,
        hsnCode: orderData.hsnCode || "",
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
        previewAmount: parseFloat(previewAmount.toString()),
        previewQuantity: parseInt(previewQty.toString()),
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

    console.log('Creating negotiation with data:', JSON.stringify({
      sellerEmail: SellerEmail,
      reqId,
      negotiationValue,
      yourQty
    }, null, 2));

    // Save the negotiation
    await newNegotiation.save();

    return NextResponse.json({
      message: "Negotiation created successfully",
      negotiationId: newNegotiation.negId
    }, { status: 201 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error in negotiation creation:", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}