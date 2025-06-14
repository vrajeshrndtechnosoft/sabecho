// lib/models/UserFavorites.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
interface FavoriteProduct {
  name: string;
  priority: number;
  createdAt: Date;
}

interface UserFavorites {
  email: string;
  userId?: string;
  favorites: FavoriteProduct[];
  categories: string[];
  createdAt: Date;
}

interface UserFavoritesDocument extends Document, UserFavorites {}

const favoriteProductSchema = new Schema<FavoriteProduct>({
  name: { type: String, required: true },
  priority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const userFavoritesSchema = new Schema<UserFavoritesDocument>({
  email: { type: String, required: true, unique: true },
  userId: { type: String, unique: true },
  favorites: [favoriteProductSchema],
  categories: [String],
  createdAt: { type: Date, default: Date.now },
});

const UserFavorites = mongoose.models.UserFavorites || mongoose.model<UserFavoritesDocument>('UserFavorites', userFavoritesSchema);

export default UserFavorites;