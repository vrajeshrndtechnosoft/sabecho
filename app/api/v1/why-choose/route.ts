// File: app/api/why-choose/route.ts (Next.js 13+)

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { connectDb } from "@/lib/db";
import WhyChoose from "@/models/home/WhyChoose";

export async function GET() {
  try {
    await connectDb();
    const items = await WhyChoose.find();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const formData = await req.formData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newItemData: any = {};

    formData.forEach(async (value, key) => {
      if (key === "image" && value instanceof File) {
        const filename = Date.now() + path.extname(value.name);
        const buffer = Buffer.from(await value.arrayBuffer());
        const filepath = path.join(process.cwd(), "uploads", filename);
        fs.writeFile(filepath, buffer);
        newItemData.image = filename;
      } else if (key === "keywords") {
        newItemData.keywords = JSON.parse(value as string);
      } else {
        newItemData[key] = value;
      }
    });

    const newItem = new WhyChoose(newItemData);
    await newItem.save();
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }
}