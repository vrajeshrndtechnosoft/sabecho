// File: app/api/testimonials/route.ts (Next.js 13+ with TypeScript)

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import {connectDb} from "@/lib/db";
import Testimonial from "@/models/home/Testimonial";

export async function GET() {
  try {
    await connectDb();
    const testimonials = await Testimonial.find();
    return NextResponse.json(testimonials);
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const quote = formData.get("quote") as string;
    const name = formData.get("name") as string;
    const position = formData.get("position") as string;
    const backgroundColor = formData.get("backgroundColor") as string;

    let imagePath = "";
    const imageFile = formData.get("image");

    if (imageFile instanceof File) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filename = Date.now() + path.extname(imageFile.name);
      const filePath = path.join(process.cwd(), "uploads", filename);
      await fs.writeFile(filePath, buffer);
      imagePath = filename;
    }

    const testimonial = new Testimonial({
      title,
      quote,
      name,
      position,
      backgroundColor,
      imagePath
    });

    const newTestimonial = await testimonial.save();
    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 400 });
  }
}
