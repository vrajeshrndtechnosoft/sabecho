/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  await connectDb();

  const slug = (await params).slug ?? [];

  const category = slug[0];
  const subcategory = slug[1];
  const product = slug[2];
  const city = slug[3];

  console.log("🔍 Incoming Params:");
  console.log("  Category:    ", category);
  console.log("  Subcategory: ", subcategory);
  console.log("  Product:     ", product);
  console.log("  City:        ", city);

  try {
    const filter: Record<string, any> = {};

    if (category) {
      const clean = category.replace(/-/g, " ");
      filter.categoryType = new RegExp(`${clean}`, "i");
      console.log("📦 categoryType filter:", filter.categoryType);
    }

    if (subcategory) {
      const clean = subcategory.replace(/-/g, " ");
      filter.categorySubType = new RegExp(`${clean}`, "i");
      console.log("📦 categorySubType filter:", filter.categorySubType);
    }

    if (product) {
      const clean = product.replace(/-/g, " ").replace(/&/g, "");
      filter.name = new RegExp(clean, "i");
      console.log("📦 name filter:", filter.name);
    }

    if (city) {
      const clean = city.replace(/-/g, " ");
      filter.location = new RegExp(`${clean}`, "i");
      console.log("📦 location filter:", filter.location);
    }

    console.log("🧾 Final Mongo Filter:", filter);

    const limit = city && product && subcategory ? 0 : 20;

    const count = await Product.countDocuments(filter);
    console.log("📊 Matching Product Count:", count);

    if (count === 0) {
      const sampleDocs = await Product.find().limit(5).lean();
      return NextResponse.json(
        {
          message: "No products found matching the criteria",
          samples: sampleDocs,
        },
        { status: 404 }
      );
    }

    const products = await Product.find(filter).limit(limit).lean();
    console.log("✅ Found Products:", products.length);

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("❌ Error fetching product data:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
