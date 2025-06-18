import { NextRequest, NextResponse } from 'next/server';
import {sendProductInquiryEmail} from '@/lib/sendProductInquiryEmail';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = await searchParams.get('user');
    const inquiryDetails = searchParams.get('inquiryDetails');

    if (!user || !inquiryDetails) {
      return NextResponse.json({ message: 'Missing query params' }, { status: 400 });
    }

    await sendProductInquiryEmail({name: user, email: ""}, JSON.parse(inquiryDetails));

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
