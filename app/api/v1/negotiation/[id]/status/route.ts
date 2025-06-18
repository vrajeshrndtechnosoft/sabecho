import { connectDb } from "@/lib/db";
import { verifyToken } from "@/middleware/authMiddleware";
import Negotiation from "@/models/Negotiation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();

  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const updated = await Negotiation.findByIdAndUpdate(
      id,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Negotiation not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
