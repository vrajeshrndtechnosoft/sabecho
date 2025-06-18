import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { HydratedDocument } from "mongoose";
import { IProduct } from "@/models/Product"; // make sure this matches your model

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  await connectDb();

  try {
    const {name} = await params;
    const products = await Product.find({
      name: { $regex: name, $options: "i" }
    })
      .select("name minQty assignedSellers location")
      .sort({ createdAt: -1 });

    if (!products.length) {
      return NextResponse.json({ message: "No results" }, { status: 404 });
    }

    // Collect seller IDs from products
    const sellerIds = [...new Set(products.flatMap(p => p.assignedSellers.map(id => id.toString())))];

    // Fetch seller details
    const sellers = await User.find({ _id: { $in: sellerIds } })
      .select("_id name email mobileNo companyName userId")
      .lean(); // Convert to plain objects

    // Create a map of sellers
    const sellerMap = Object.fromEntries(
      sellers.map(s => [s._id.toString(), s])
    );

    // Enrich products with seller data
    const enrichedProducts = products.map((product: HydratedDocument<IProduct>) => {
      const plainProduct = product.toObject();
      plainProduct.assignedSellers = product.assignedSellers.map(id => {
        const key = id.toString();
        return sellerMap[key] || { _id: id, name: "Unknown", email: "Unknown" };
      });
      return plainProduct;
    });

    return NextResponse.json(enrichedProducts);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
