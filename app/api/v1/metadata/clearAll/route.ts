// app/api/metadata/delete/route.ts
import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import Metadata from '@/models/Metadata';

export async function DELETE() {
  try {
    await connectDb();

    const result = await Metadata.deleteMany({});
    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} metadata entries deleted.`,
    });
  } catch (error) {
    console.error("❌ Error deleting metadata:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete metadata' },
      { status: 500 }
    );
  }
}
