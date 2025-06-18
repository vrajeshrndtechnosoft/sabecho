import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Requirement from "@/models/Requirement";

export async function POST(req: NextRequest) {
  await connectDb();
  const { email } = await req.json();

  try {
    const requirement = await Requirement.findOne({ email });
    return NextResponse.json(requirement);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
