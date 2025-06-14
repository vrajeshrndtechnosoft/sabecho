import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { stat, readFile } from "fs/promises";

const IMAGE_DIRECTORY = path.join(process.cwd(), "uploads");

export async function GET(
  req: NextRequest,
  context: { params: { filename: string } }
) {
  try {
    const { filename } = context.params;
    const imagePath = path.join(IMAGE_DIRECTORY, filename);

    await stat(imagePath);
    const fileBuffer = await readFile(imagePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/webp", // Consider MIME detection
      },
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Error serving the image" }, { status: 500 });
  }
}
