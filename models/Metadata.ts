// models/Metadata.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMetadata extends Document {
  title: string;
  description: string;
  slug: string;
  page: string;
  image?: string;
  keywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MetadataSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    page: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default mongoose.models.Metadata ||
  mongoose.model<IMetadata>('Metadata', MetadataSchema);