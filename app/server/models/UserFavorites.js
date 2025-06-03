const mongoose = require("mongoose");

const favoriteProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  priority: {
    type: Number,
    default: 0, // Default priority level is 0 (or any other default value you prefer)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userFavoritesSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    unique: true,
  },
  favorites: [favoriteProductSchema], // Array of favorite products with name, category, and priority
  categories: [String], // Array of category names
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserFavorites = mongoose.model("UserFavorites", userFavoritesSchema);

module.exports = UserFavorites;
