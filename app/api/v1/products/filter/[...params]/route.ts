import { NextRequest, NextResponse } from "next/server";
import {connectDb} from "@/lib/db"; // You must set up MongoDB connection here
import Product from "@/models/Product";   // Adjust the import to your model path

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ category: string; params?: string[] }> }
) {
  await connectDb();

  const { category } = await params;
  const [subcategory, product, city] = (await params)?.params || [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    // Convert hyphens to spaces, handle regex case-insensitively
    if (category) {
      filter.categoryType = new RegExp(category.replace(/-/g, " "), "i");
    }

    if (subcategory) {
      filter.categorySubType = new RegExp(subcategory.replace(/-/g, " "), "i");
    }

    if (product) {
      filter.name = new RegExp(product.replace(/-/g, " ").replace(/&/g, ""), "i");
    }

    if (city) {
      filter.location = new RegExp(city, "i");
    }

    const limit = city && product && subcategory ? 0 : 20;

    const count = await Product.countDocuments(filter);

    if (count === 0) {
      const sampleDocs = await Product.find().limit(5).lean();
      return NextResponse.json(
        { message: "No products found matching the criteria", samples: sampleDocs },
        { status: 404 }
      );
    }

    const products = await Product.find(filter).limit(limit).lean();
    return NextResponse.json(products);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching product data:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
