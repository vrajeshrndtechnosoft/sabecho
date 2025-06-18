import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Requirement from "@/models/Requirement";

export async function GET() {
  await connectDb();

  try {
    const requirements = await Requirement.find({ status: "Quoted" }).sort({ createdAt: -1 });
    if (requirements.length === 0) {
      return NextResponse.json({ message: "None found" }, { status: 404 });
    }
    return NextResponse.json(requirements);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
