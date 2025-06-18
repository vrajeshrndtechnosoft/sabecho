import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Quotation from '@/models/Quotation';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDb();
    const { status } = await req.json();
    const { id } = await params;

    const quotation = await Quotation.findByIdAndUpdate(id, { status }, { new: true });

    if (!quotation) {
      return NextResponse.json({ message: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Quotation status updated successfully', quotation });
  } catch (error) {
    console.error('Error updating quotation status:', error);
    return NextResponse.json({ message: 'Failed to update quotation status' }, { status: 500 });
  }
}
