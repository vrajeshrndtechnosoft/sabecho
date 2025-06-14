// File: app/api/why-choose/route.ts

import { NextResponse } from "next/server";
import WhyServices from "@/models/home/Services";
import { connectDb } from '@/lib/db';

export async function GET() {
  try {
    await connectDb();
    const services = await WhyServices.find();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}