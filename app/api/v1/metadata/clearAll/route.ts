import { connectDb } from '@/lib/db';
import Metadata from '@/models/Metadata';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const confirm = req.nextUrl.searchParams.get('confirm');
  if (confirm !== 'true') {
    return NextResponse.json(
      { success: false, message: 'Missing confirmation flag.' },
      { status: 400 }
    );
  }

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
