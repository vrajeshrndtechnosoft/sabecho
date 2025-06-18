// app/api/products/route.ts
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";
import { Category } from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const body = await req.json();
    const {
      name,
      brand,
      location,
      categoryType,
      categorySubType,
    } = body;

    // Find the category
    const category = await Category.findOne({ category: categoryType });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Find or create the subcategory
    let subCategory = category.subCategory.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (subCat: any) => subCat.name === categorySubType
    );

    if (!subCategory) {
      subCategory = {
        name: categorySubType,
        product: [],
      };
      category.subCategory.push(subCategory);
    }

    // Check for existing product (case-insensitive)
    const product = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (product?.name === name) {
      return NextResponse.json(
        { message: "Product already exists" },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct = new Product(body);
   (subCategory.product ??= []).push({
        p_name: name,
        brand: brand,
        location: location,
    });

    newProduct.existingProduct = true;

    // Save category and product
    await category.save();
    await newProduct.save();

    return NextResponse.json(
      {
        message: "Product information updated successfully.",
        createdProduct: newProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        message: "Oops! Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
