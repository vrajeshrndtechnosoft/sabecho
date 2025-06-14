// File: app/api/about/route.ts (Next.js 13+ with TypeScript)

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import {connectDb} from "@/lib/db";
import AboutUs from "@/models/home/About";

export async function GET() {
  try {
    await connectDb();
    const aboutUs = await AboutUs.findOne().sort({ createdAt: -1 });
    if (!aboutUs) {
      return NextResponse.json({ message: "About Us content not found" }, { status: 404 });
    }
    return NextResponse.json(aboutUs);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const formData = await req.formData();
    const data = JSON.parse(formData.get("data") as string);

    // Handle headerImage
    const headerImageFile = formData.get("headerImage") as File;
    if (headerImageFile instanceof File) {
      const buffer = Buffer.from(await headerImageFile.arrayBuffer());
      const filename = `headerImage-${Date.now()}${path.extname(headerImageFile.name)}`;
      const filePath = path.join(process.cwd(), "uploads", filename);
      await fs.writeFile(filePath, buffer);
      data.headerImage = filename;
    }

    // Handle whoWeAreImages
    const whoWeAreImages: string[] = [];
    for (const entry of formData.entries()) {
      const [key, value] = entry;
      if (key === "whoWeAreImages" && value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const filename = `whoWeAre-${Date.now()}-${Math.random()}${path.extname(value.name)}`;
        const filePath = path.join(process.cwd(), "uploads", filename);
        await fs.writeFile(filePath, buffer);
        whoWeAreImages.push(filename);
      }
    }
    if (!data.whoWeAre) data.whoWeAre = {};
    data.whoWeAre.images = whoWeAreImages;

    // Handle awardImages
    const awards = data.awardsAndAchievements?.awards || [];
    const updatedAwards = [];
    let index = 0;
    for (const entry of formData.entries()) {
      const [key, value] = entry;
      if (key === "awardImages" && value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const filename = `award-${Date.now()}-${Math.random()}${path.extname(value.name)}`;
        const filePath = path.join(process.cwd(), "uploads", filename);
        await fs.writeFile(filePath, buffer);

        if (awards[index]) {
          updatedAwards.push({ ...awards[index], image: filename });
        }
        index++;
      }
    }
    data.awardsAndAchievements = { ...data.awardsAndAchievements, awards: updatedAwards };

    const updatedAboutUs = await AboutUs.findOneAndUpdate(
      {},
      { ...data, updatedAt: Date.now() },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(updatedAboutUs, { status: 201 });
  } catch (error) {
    const err = error as Error;
    const status = err.name === "ValidationError" ? 400 : 500;
    return NextResponse.json({ message: err.message }, { status });
  }
}
