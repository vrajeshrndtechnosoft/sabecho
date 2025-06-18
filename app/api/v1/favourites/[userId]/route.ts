import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import UserFavorites from '@/models/UserFavourites';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDb();
    const { userId } = await params;
    const userFavorites = await UserFavorites.findOne({ userId: userId });

    if (!userFavorites) {
      return NextResponse.json({ error: 'User favorites not found' }, { status: 404 });
    }

    return NextResponse.json(userFavorites.favorites, { status: 200 });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}