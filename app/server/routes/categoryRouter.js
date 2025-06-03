const express = require("express");
const router = express.Router();
const { Category, Counter } = require("../models/Category");
const { encrypt } = require("../utils/encryption");


// Create a new category
router.post("/categories", async (req, res) => {
  try {
    const { category, subCategory } = req.body;
    let existingCategory = await Category.findOne({ category });

    if (existingCategory) {
      existingCategory.subCategory.push(...subCategory);
      const updatedCategory = await existingCategory.save();
      return res.status(200).json(updatedCategory);
    }

    const newCategory = new Category({ category, subCategory });
    const savedCategory = await newCategory.save();

    res.status(201).json(savedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().select("category");
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/categories/names',async (req, res) => {
  try {
    const categories = await Category.find().select("category");
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Get all categories with subcategories
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get subcategories of a particular category
router.get("/categories/:categoryId/subcategories", async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId)
      return res.status(400).json({ message: "Category ID is required" });

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategories = category.subCategory.map((subcategory) => ({
      _id: subcategory._id,
      name: subcategory.name,
    }));

    res.status(200).json(subcategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get data for navbar
router.get("/category/navbardata", async (req, res) => {
  try {
    const categorie = await Category.find({});
    const categories=encrypt(categorie)
    res.json(categories);
  } catch (error) {
    console.error("Error fetching category data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { category } = req.body;

    const categeg = await Category.findByIdAndUpdate(
      categoryId,
      { $set: { category: category } },
      { new: true }
    );

    if (!categeg) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
/// Delete a category, subcategory, or product by ID
router.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID matches any product within a subcategory
    let category = await Category.findOne({ "subCategory.product._id": id });

    if (category) {
      // If a category is found with matching product, remove the product
      const subCategory = category.subCategory.find((sub) =>
        sub.product.id(id)
      );

      if (subCategory) {
        subCategory.product.pull({ _id: id });
        await category.save();
        return res
          .status(200)
          .json({ message: "Product deleted successfully" });
      }
    }

    // Check if the ID matches any subcategory
    category = await Category.findOne({ "subCategory._id": id });

    if (category) {
      // If a category is found with matching subcategory, remove the subcategory
      category.subCategory.pull({ _id: id });
      await category.save();
      return res
        .status(200)
        .json({ message: "Subcategory deleted successfully" });
    }

    // Check if the ID matches any category
    category = await Category.findById(id);

    if (category) {
      // If a category is found, delete it
      await Category.findByIdAndDelete(id);

      // Reset category IDs after deletion
      await resetCategoryIds();

      return res.status(200).json({ message: "Category deleted successfully" });
    }

    // If none of the above matched, return 404
    return res.status(404).json({ message: "Resource not found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Function to reset category IDs after deletion
async function resetCategoryIds() {
  try {
    // Find all categories sorted by id in ascending order
    const categories = await Category.find().sort({ id: 1 });

    // Initialize a counter for the new IDs starting from 1
    let newId = 1;

    // Update each category with the new id value
    for (const category of categories) {
      category.id = newId++;
      await category.save();
    }

    // Update counter collection for categoryId sequence
    await updateCounter("categoryId", newId);
  
  } catch (error) {
    console.error("Error resetting category IDs:", error);
  }
}
// Function to update the counter collection
async function updateCounter(sequenceName, sequenceValue) {
  try {
    // Find and update the counter document for the specified sequenceName
    const sequenceDocument = await Counter.findByIdAndUpdate(
      { _id: sequenceName },
      { sequence_value: sequenceValue },
      { new: true, upsert: true }
    );

  } catch (error) {
    console.error(`Error updating counter '${sequenceName}':`, error);
  }
}

// Create a new subcategory
router.post("/categories/:categoryId/subcategories", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, product } = req.body;

    // Find the category by ID
    const category = await Category.findById(categoryId);

    // If the category does not exist, return a 404 error
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Push the new subcategory into the subCategory array
    if (!category.subCategory) {
      category.subCategory = []; // Initialize subCategory as an empty array if it's null
    }
    category.subCategory.push({ name });

    // Save the updated category
    const updatedCategory = await category.save();

    // Respond with the updated category
    res.status(201).json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Update a subcategory
router.put(
  "/categories/:categoryId/subcategories/:subCategoryId",
  async (req, res) => {
    try {
      const { categoryId, subCategoryId } = req.params;
      const { name, product } = req.body;

      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const subCategory = category.subCategory.id(subCategoryId);

      if (!subCategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      subCategory.name = name;
      subCategory.product = product;

      const updatedCategory = await category.save();
      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Create a new product
router.post(
  "/categories/:categoryId/subcategories/:subCategoryId/products",
  async (req, res) => {
    try {
      const { categoryId, subCategoryId } = req.params;
      const { p_name, location, city, brand } = req.body;

      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const subCategory = category.subCategory.id(subCategoryId);

      if (!subCategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      subCategory.product.push({ p_name, location, city, brand });
      const updatedCategory = await category.save();

      res.status(201).json(updatedCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Update a product
router.put(
  "/categories/:categoryId/subcategories/:subCategoryId/products/:productId",
  async (req, res) => {
    try {
      const { categoryId, subCategoryId, productId } = req.params;
      const { p_name, location, city, brand } = req.body;

      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const subCategory = category.subCategory.id(subCategoryId);

      if (!subCategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      const product = subCategory.product.id(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.p_name = p_name;
      product.location = location;
      product.city = city;
      product.brand = brand;

      const updatedCategory = await category.save();
      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;
