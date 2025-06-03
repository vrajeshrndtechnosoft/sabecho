const express = require("express");
const router = express.Router();
const UserFavorites = require("../models/UserFavorites");
const { verifyToken } = require("../middleware/authMiddleware");
const Product = require("../models/Product");
// POST /api/email-product
// POST /api/favorite/save
router.post("/favorite/save", async (req, res) => {
  try {
    const productData = req.body;
    const email = productData.email.email;
    const productName = productData.email.productName;
    const userId = productData.email.userId;
    let userFavorites = await UserFavorites.findOne({ email });

    if (!userFavorites) {
      // If the user does not exist, create a new document
      userFavorites = new UserFavorites({
        userId,
        email,
        favorites: [{ name: productName }],
        categories: [],
      });

      await userFavorites.save();

      return res.status(201).json({
        message: "New user added with favorite product",
        userFavorites,
      });
    }

    // Check if the product is already in the favorites
    const existingIndex = userFavorites.favorites.findIndex(
      (favorite) => favorite.name === productName
    );

    if (existingIndex !== -1) {
      // If product exists, remove it from favorites
      userFavorites.favorites.splice(existingIndex, 1);
    } else {
      // If product does not exist, add it to favorites
      userFavorites.favorites.push({ name: productName });
    }

    await userFavorites.save();

    res
      .status(201)
      .json({ message: "Product added to favorites", userFavorites });
  } catch (error) {
    console.error("Error saving favorite:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/favorite/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const userFavorites = await UserFavorites.findOne({ userId });

    if (!userFavorites) {
      return res.status(404).json({ error: "Favorites not found" });
    }

    res.status(200).json(userFavorites.favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/favorites/matched/:userId", async (req, res) => {
    const userId = req.params.userId;
  
    try {
      // Find the user's favorites by userId
      const userFavorites = await UserFavorites.findOne({ userId });
  
      if (!userFavorites) {
        return res.status(404).json({ error: "Favorites not found" });
      }
  
      // Extract favorite product names
      const favoriteProductNames = userFavorites.favorites.map(favorite => favorite.name);
  
      // Query the Product collection to find matching products
      const matchedProducts = await Product.find({ name: { $in: favoriteProductNames } });
  
      res.status(200).json(matchedProducts);
    } catch (error) {
      console.error("Error fetching matched favorite products:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

module.exports = router;
