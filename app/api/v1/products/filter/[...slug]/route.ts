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

  // Helper function to clean URL segments
  const cleanUrlSegment = (segment: string): string => {
    if (!segment) return '';
    
    // First decode URL encoding (%26 -> &, etc.)
    const decoded = decodeURIComponent(segment);
    
    // Replace hyphens with spaces and handle common URL transformations
    return decoded
      .replace(/-/g, " ")
      .replace(/\band\b/gi, "&") // Convert 'and' back to '&' for matching
      .trim();
  };

  try {
    const filter: Record<string, any> = {};

    if (category) {
      const clean = cleanUrlSegment(category);
      filter.categoryType = new RegExp(`${clean}`, "i");
      console.log("🔍 Category filter:", clean);
    }

    if (subcategory) {
      const clean = cleanUrlSegment(subcategory);
      filter.categorySubType = new RegExp(`${clean}`, "i");
      console.log("🔍 Subcategory filter:", clean);
    }

    if (product) {
      const clean = cleanUrlSegment(product);
      // Create multiple search patterns for better matching
      const searchPatterns = [
        clean, // Original cleaned version
        clean.replace(/&/g, ""), // Without &
        clean.replace(/&/g, "and"), // With 'and' instead of &
      ].filter(Boolean);
      
      // Use $or to match any of the patterns
      filter.$or = searchPatterns.map(pattern => ({
        name: new RegExp(pattern, "i")
      }));
      
      console.log("🔍 Product search patterns:", searchPatterns);
    }

    if (city) {
      const clean = cleanUrlSegment(city);
      filter.location = new RegExp(`${clean}`, "i");
      console.log("🔍 City filter:", clean);
    }

    console.log("🧾 Final Mongo Filter:", JSON.stringify(filter, null, 2));

    const limit = city && product && subcategory ? 0 : 20;

    const count = await Product.countDocuments(filter);

    if (count === 0) {
      // For debugging - show what we're looking for vs what exists
      const sampleDocs = await Product.find().limit(5).lean();
      console.log("❌ No matches found. Sample products:", sampleDocs.map(doc => ({
        name: doc.name,
        categoryType: doc.categoryType,
        categorySubType: doc.categorySubType,
        location: doc.location
      })));
      
      return NextResponse.json(
        {
          message: "No products found matching the criteria",
          searchCriteria: {
            category: category ? cleanUrlSegment(category) : null,
            subcategory: subcategory ? cleanUrlSegment(subcategory) : null,
            product: product ? cleanUrlSegment(product) : null,
            city: city ? cleanUrlSegment(city) : null,
          },
          samples: sampleDocs,
        },
        { status: 404 }
      );
    }

    const products = await Product.find(filter).limit(limit).lean();

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}