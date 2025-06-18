import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Quotation from '@/models/Quotation';

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { email, amount } = await req.json();

    const quotation = await Quotation.findOneAndUpdate(
      { 'selectedCompanies.email': email },
      { $set: { 'selectedCompanies.$.amount': amount } },
      { new: true }
    );

    if (!quotation) {
      return NextResponse.json({ message: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Quotation amount updated successfully', quotation });
  } catch (error) {
    console.error('Error updating quotation amount:', error);
    return NextResponse.json({ message: 'Failed to update quotation amount' }, { status: 500 });
  }
}