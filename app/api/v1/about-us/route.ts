// File: app/api/about-us/route.ts (GET all, POST create)

import { NextRequest, NextResponse } from "next/server";
import {connectDb} from "@/lib/db";
import AboutUs from "@/models/home/AboutUs";
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    await connectDb();
    const aboutUs = await AboutUs.find();
    return NextResponse.json(aboutUs);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const listOfImages = JSON.parse(formData.get("listOfImages") as string);
    const files: File[] = formData.getAll("images") as File[];

    if (!title || !description || !Array.isArray(listOfImages) || listOfImages.length !== files.length) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const imageItems = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listOfImages.map(async (item: any, index: number) => {
        const file = files[index];
        const filename = `${Date.now()}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(`public/uploads/${filename}`, buffer);

        return {
          image: { url: filename, altText: item.image.altText },
          title: item.title,
          description: item.description,
        };
      })
    );

    const aboutUs = new AboutUs({ title, description, listOfImages: imageItems });
    await aboutUs.save();
    return NextResponse.json(aboutUs, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}



export async function deleteFile(filename: string) {
  try {
    await fs.unlink(path.join('public/uploads', filename));
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}