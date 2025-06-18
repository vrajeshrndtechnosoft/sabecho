import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Requirement from "@/models/Requirement";

export async function POST(req: NextRequest) {
  await connectDb();
  const { name, status, specification, pid } = await req.json();

  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  try {
    const results = await Requirement.aggregate([
      { $match: { name, status, specification, pid } },
      {
        $lookup: {
          from: "products",
          localField: "pid",
          foreignField: "pid",
          as: "productDetails",
        },
      },
      {
        $project: {
          company: 1,
          pincode: 1,
          email: 1,
          mobile: 1,
          hsnCode: { $arrayElemAt: ["$productDetails.hsnCode", 0] },
          gstPercentage: { $arrayElemAt: ["$productDetails.gstPercentage", 0] },
        },
      },
    ]).sort({ createdAt: -1 });

    return NextResponse.json(results);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
