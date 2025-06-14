import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { connectDb } from "@/lib/db";
import WhyChoose from "@/models/home/WhyChoose";
import { unlink } from "fs/promises";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    const whyChoose = await WhyChoose.findById(params.id);
    if (!whyChoose) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(whyChoose);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    const formData = await req.formData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    formData.forEach(async (value, key) => {
      if (key === "image" && value instanceof File) {
        const filename = Date.now() + path.extname(value.name);
        const buffer = Buffer.from(await value.arrayBuffer());
        const filepath = path.join(process.cwd(), "uploads", filename);
        fs.writeFile(filepath, buffer);
        updateData.image = filename;
      } else if (key === "keywords") {
        updateData.keywords = JSON.parse(value as string);
      } else {
        updateData[key] = value;
      }
    });

    const updated = await WhyChoose.findByIdAndUpdate(params.id, updateData, { new: true });
    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();
    const whyChoose = await WhyChoose.findByIdAndDelete(params.id);
    if (!whyChoose) return NextResponse.json({ message: "Not found" }, { status: 404 });

    if (whyChoose.image) {
      const filepath = path.join(process.cwd(), "uploads", whyChoose.image);
      try {
        await unlink(filepath);
      } catch (err) {
        console.error("Error deleting image file", err);
      }
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}