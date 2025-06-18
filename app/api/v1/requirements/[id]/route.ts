import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Requirement from "@/models/Requirement";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  try {
    const { id } = await params;
    const reqDoc = await Requirement.findById(id);
    if (!reqDoc) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(reqDoc);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  try {
    const { id } = await params;
    const reqDoc = await Requirement.findByIdAndDelete(id);
    if (!reqDoc) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted successfully" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
