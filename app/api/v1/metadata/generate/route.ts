import { seedProductMetadata, seedStaticMetadata } from "@/utils/meatadata-generator";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        seedStaticMetadata();
        seedProductMetadata();
        return NextResponse.json({message: "Successfully generated metadata for staic & Dynamic pages!"})
    } catch (error) {
        return NextResponse.json({message: error})
    }
}