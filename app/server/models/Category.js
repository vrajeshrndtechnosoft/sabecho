const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema for Counter (unchanged)
const counterSchema = new Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, required: true },
});

const Counter = mongoose.model("Counter", counterSchema);

// Enhanced schema for Subcategory
const subCategorySchema = new Schema({
  id: {
    type: Number,
  },
  name: { type: String },
  slug: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  product: [
    {
      p_name: { type: String },
      location: { type: String },
      city: { type: String },
      brand: { type: String, default: "" },
    },
  ],
});

// Enhanced schema for Category
const categorySchema = new Schema({
  id: {
    type: Number,
    unique: true,
  },
  category: { type: String, required: true, unique: true },
  slug: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  subCategory: [subCategorySchema], // Array of subcategories
}, { timestamps: true });

// Function to get the next sequence value (unchanged)
async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.sequence_value;
}

// Function to get the next subcategory ID within a category (unchanged)
async function getNextSubCategoryId(categoryId) {
  const sequenceName = `subCategoryId_${categoryId}`;
  const sequenceDocument = await Counter.findByIdAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.sequence_value;
}

// Enhanced middleware to auto-increment Category id and generate slugs
categorySchema.pre("save", async function (next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue("categoryId");
  }

  // Generate slug if not provided
  if (!this.slug) {
    this.slug = this.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  // Ensure subcategories have unique IDs starting from 1 for each category
  for (const subCategory of this.subCategory) {
    if (!subCategory.id) {
      subCategory.id = await getNextSubCategoryId(this.id);
    }
    // Generate slug for subcategory if not provided
    if (!subCategory.slug) {
      subCategory.slug = subCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
  }

  next();
});

// Middleware to delete associated subcategories when a category is deleted (unchanged)
categorySchema.pre("remove", async function (next) {
  const Category = mongoose.model("Category");

  try {
    for (const subCategory of this.subCategory) {
      await Category.findByIdAndDelete(subCategory._id);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Create model for Category
const Category = mongoose.model("Category", categorySchema);

// Export both models
module.exports = {
    Category,
    Counter
};