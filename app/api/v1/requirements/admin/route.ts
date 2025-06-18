import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Requirement from "@/models/Requirement";

export async function POST(req: NextRequest) {
  await connectDb();
  const { status } = await req.json();

  try {
    const requirements = await Requirement.find({
      status: { $regex: new RegExp(`^${status}$`, "i") },
    }).sort({ createdAt: -1 });

    if (requirements.length === 0) {
      return NextResponse.json({ message: "No requirements found" }, { status: 404 });
    }

    return NextResponse.json(requirements);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
