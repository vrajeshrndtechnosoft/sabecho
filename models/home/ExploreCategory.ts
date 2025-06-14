// lib/models/ExploreCategory.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface
interface ExploreCategory {
  title: string;
  slug: string;
  image: {
    url: string;
    altText: string;
  };
  productNames: string[];
  metaDescription?: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ExploreCategoryDocument extends Document, ExploreCategory {}

const exploreCategorySchema = new Schema<ExploreCategoryDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      altText: {
        type: String,
        required: true,
        maxlength: 100,
      },
    },
    productNames: [
      {
        type: String,
        trim: true,
      },
    ],
    metaDescription: {
      type: String,
      maxlength: 160,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true },
);

// Create text index for search
exploreCategorySchema.index({
  title: 'text',
  productNames: 'text',
  metaDescription: 'text',
  keywords: 'text',
});

// Pre-save hook to generate slug
exploreCategorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
  }
  next();
});

const ExploreCategory = mongoose.models.ExploreCategory || mongoose.model<ExploreCategoryDocument>('ExploreCategory', exploreCategorySchema);

export default ExploreCategory;
