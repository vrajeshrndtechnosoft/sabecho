import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import Product from '@/models/Product';
import UserFavorites from '@/models/UserFavourites';

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDb();
    const userFavorites = await UserFavorites.findOne({ userId: params.userId });

    if (!userFavorites) {
      return NextResponse.json({ error: 'Favorites not found' }, { status: 404 });
    }

    const favoriteProductNames = userFavorites.favorites.map(
      (fav: { name: string }) => fav.name
    );

    if (favoriteProductNames.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const matchedProducts = await Product.find({
      name: { $in: favoriteProductNames },
    });

    return NextResponse.json(matchedProducts, { status: 200 });
  } catch (error) {
    console.error('Error fetching matched favorite products:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
