import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import AboutUs from "@/models/home/AboutUs";
import { deleteFile } from "../route";
import fs from "fs/promises";

// Define the type for a list image item
type ImageItem = {
  image: { url: string; altText: string };
  title: string;
  description: string;
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDb();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const listOfImages = JSON.parse(formData.get("listOfImages") as string) as ImageItem[];

    const aboutUs = await AboutUs.findById(params.id);
    if (!aboutUs) return NextResponse.json({ message: "Not found" }, { status: 404 });

    if (title) aboutUs.title = title;
    if (description) aboutUs.description = description;

    const files: File[] = formData.getAll("images") as File[];
    let newFileIndex = 0;

    const existingImages = new Set<string>(
      aboutUs.listOfImages.map((i: ImageItem) => i.image.url)
    );

    const updatedImages: ImageItem[] = [];
    for (const item of listOfImages) {
      if (!item.image.url || item.image.url === "new") {
        const file = files[newFileIndex++];
        const filename = `${Date.now()}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(`public/uploads/${filename}`, buffer);

        updatedImages.push({
          image: { url: filename, altText: item.image.altText },
          title: item.title,
          description: item.description,
        });
      } else {
        existingImages.delete(item.image.url);
        updatedImages.push(item);
      }
    }

    aboutUs.listOfImages = updatedImages;

    for (const img of existingImages) {
      await deleteFile(img);
    }

    await aboutUs.save();
    return NextResponse.json(aboutUs);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
