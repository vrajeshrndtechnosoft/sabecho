import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Requirement from "@/models/Requirement";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  const { status } = await req.json();
  const { id } = await params;
  try {
    const requirement = await Requirement.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!requirement) {
      return NextResponse.json({ message: "Requirement not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Status updated", requirement });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
