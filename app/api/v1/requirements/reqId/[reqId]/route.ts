import { connectDb } from "@/lib/db";
import Requirement from "@/models/Requirement";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reqId: string }> }
) {
  await connectDb();
  const { reqId } = await params;
  try {
    const requirement = await Requirement.findOne({ reqId });

    if (!requirement) {
      return NextResponse.json({ message: "Requirement not found" }, { status: 404 });
    }

    return NextResponse.json(requirement);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Error fetching requirement by reqId:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
