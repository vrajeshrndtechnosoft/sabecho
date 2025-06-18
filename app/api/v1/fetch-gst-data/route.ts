import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import {connectDb} from '@/lib/db';
import User from '@/models/User';

const GST_KEY = process.env.API_KEY_GST
export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { gstNo, userId, mobileNo, name } = await req.json().then((data) => data.data);

    if (!gstNo) {
      return NextResponse.json({ message: 'GST Number is required' }, { status: 400 });
    }

    const apiUrl = `http://sheet.gstincheck.co.in/check/${GST_KEY}/${gstNo}`;
    const response = await axios.get(apiUrl);
    const gstData = response.data;

    if (gstData?.errorMsg) {
      return NextResponse.json({ message: gstData.errorMsg }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name,
        companyName: gstData.data?.lgnm,
        shippingDetails: gstData.data?.pradr?.adr,
        pincode: gstData.data?.pradr?.addr?.pncd,
        gstNo: gstData.data?.gstin,
        mobileNo: mobileNo,
        ...gstData.data,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error fetching GST data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
