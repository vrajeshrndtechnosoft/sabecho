// models/Category.ts
import mongoose, { Schema, Document, Model } from "mongoose";

/* -------------------- INTERFACES -------------------- */
export interface IProduct {
  p_name: string;
  location: string;
  city: string;
  brand?: string;
}

export interface ISubCategory {
  id: number;
  name: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  product?: IProduct[];
}

export interface ICategory extends Document {
  id: number;
  category: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  subCategory: ISubCategory[];
  createdAt?: Date;
  updatedAt?: Date;
}

/* -------------------- COUNTER SCHEMA -------------------- */
export interface ICounter extends Document {
  _id: string;
  sequence_value: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  sequence_value: { type: Number, required: true },
});

const Counter: Model<ICounter> = mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);

/* -------------------- SUBCATEGORY SCHEMA -------------------- */
const subCategorySchema = new Schema<ISubCategory>({
  id: { type: Number },
  name: { type: String },
  slug: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  product: [{
    p_name: { type: String },
    location: { type: String },
    city: { type: String },
    brand: { type: String, default: "" },
  }],
});

/* -------------------- CATEGORY SCHEMA -------------------- */
const categorySchema = new Schema<ICategory>({
  id: { type: Number, unique: true },
  category: { type: String, required: true, unique: true },
  slug: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  subCategory: [subCategorySchema],
}, { timestamps: true });

/* -------------------- AUTO INCREMENT LOGIC -------------------- */
async function getNextSequenceValue(sequenceName: string): Promise<number> {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument!.sequence_value;
}

async function getNextSubCategoryId(categoryId: number): Promise<number> {
  const sequenceName = `subCategoryId_${categoryId}`;
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument!.sequence_value;
}

/* -------------------- PRE SAVE MIDDLEWARE -------------------- */
categorySchema.pre<ICategory>("save", async function (next) {
  if (this.isNew) {
    this.id = await getNextSequenceValue("categoryId");
  }

  if (!this.slug) {
    this.slug = this.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  for (const subCategory of this.subCategory) {
    if (!subCategory.id) {
      subCategory.id = await getNextSubCategoryId(this.id);
    }
    if (!subCategory.slug && subCategory.name) {
      subCategory.slug = subCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
  }

  next();
});

/* -------------------- DELETE MIDDLEWARE -------------------- */
categorySchema.pre("deleteOne", { document: true, query: false }, async function (next: (err?: Error) => void) {
  try {
    const category = this as ICategory;

    const CategoryModel = mongoose.model<ICategory>("Category");

    for (const subCategory of category.subCategory) {
      // Only delete subCategory if it exists by _id (assuming `subCategory.id` is just a number and not ObjectId)
      await CategoryModel.findOneAndDelete({ id: subCategory.id });
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

/* -------------------- MODEL EXPORT -------------------- */
const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

export { Category, Counter };
