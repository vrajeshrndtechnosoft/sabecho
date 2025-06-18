import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Quotation from '@/models/Quotation';

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { _id, email, amount, description } = await req.json();

    const quotation = await Quotation.findById(_id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedCompany = quotation.selectedCompanies.find((c: any) => c.email === email);
    if (!selectedCompany) {
      return NextResponse.json({ error: 'Selected company not found' }, { status: 404 });
    }

    selectedCompany.set({ amount, description, status: 'Quoted' });
    await quotation.save();

    return NextResponse.json({ message: 'Quotation updated successfully' });
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
