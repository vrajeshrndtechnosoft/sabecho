import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Requirement from "@/models/Requirement";

export async function POST(req: NextRequest) {
  await connectDb();
  const { email } = await req.json();

  try {
    const requirements = await Requirement
      .find({ email })
      .sort({ createdAt: -1 });
    return NextResponse.json(requirements);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
