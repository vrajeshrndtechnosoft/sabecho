import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import Requirement from '@/models/Requirement';
import User from '@/models/User';
import { encrypt } from '@/utils/encryption';

export async function GET(req: NextRequest, { params }: { params: Promise<{ reqId: string }> }) {
  try {
    await connectDb();
    const { reqId } = await params;

    const requirement = await Requirement.findOne({ reqId });
    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    const user = await User.findOne({ email: requirement.email })
      .select('email name companyName mobileNo gstNo userType pincode userId')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const encryptedData = encrypt(user);
    return NextResponse.json({ encryptedData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
