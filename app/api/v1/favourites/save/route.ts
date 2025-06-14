import { NextRequest, NextResponse } from 'next/server';
import {connectDb} from '@/lib/db';
import UserFavorites from '@/models/UserFavourites';

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { email, productName, userId } = await req.json();

    let userFavorites = await UserFavorites.findOne({ email });
    let isNewUser = false;
    let productAction = '';

    if (!userFavorites) {
      userFavorites = new UserFavorites({
        userId,
        email,
        favorites: [{ name: productName }],
        categories: [],
      });
      isNewUser = true;
      productAction = 'added';
    } else {
      userFavorites.userId = userId;
      const existingIndex = userFavorites.favorites.findIndex(
        (fav: { name: string }) => fav.name === productName
      );

      if (existingIndex !== -1) {
        userFavorites.favorites.splice(existingIndex, 1);
        productAction = 'removed';
      } else {
        userFavorites.favorites.push({ name: productName });
        productAction = 'added';
      }
    }

    await userFavorites.save();

    const message = isNewUser
      ? 'New user created with favorite product'
      : `Product ${productAction} ${productAction === 'added' ? 'to' : 'from'} favorites`;

    return NextResponse.json({ message, userFavorites, action: productAction }, { status: 201 });
  } catch (error) {
    console.error('Error saving favorite:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
