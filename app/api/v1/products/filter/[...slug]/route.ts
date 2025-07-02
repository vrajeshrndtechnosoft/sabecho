import { NextRequest, NextResponse } from 'next/server';
import Product from '@/models/Product';

interface RouteContext {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const { slug } = params;
    
    // Extract parameters from slug array
    const [category, subcategory, product, city] = slug || [];

    interface FilterType {
      categoryType?: RegExp;
      categorySubType?: RegExp;
      name?: RegExp;
      location?: RegExp;
    }

    const filter: FilterType = {};

    // Handle category
    if (category) {
      filter.categoryType = new RegExp(category.replace(/-/g, ' '), 'i');
    }

    // Handle subcategory
    if (subcategory) {
      filter.categorySubType = new RegExp(subcategory.replace(/-/g, ' '), 'i');
    }

    // Handle product name
    if (product) {
      filter.name = new RegExp(product.replace(/-/g, ' ').replace(/&/g, ''), 'i');
    }

    // Handle city
    if (city) {
      filter.location = new RegExp(city, 'i');
    }

    // Adjust limit based on query specificity
    const limit = (city && product && subcategory) ? 0 : 20;

    const count = await Product.countDocuments(filter);

    if (count === 0) {
      return NextResponse.json(
        { message: "No products found matching the criteria" },
        { status: 404 }
      );
    }

    const products = await Product.find(filter).limit(limit).lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching product data:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}