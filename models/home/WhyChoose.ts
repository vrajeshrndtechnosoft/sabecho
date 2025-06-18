// lib/models/WhyChoose.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for the data structure
interface WhyChoose {
  _id: string; // Add _id for client-side usage
  userType: string;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Separate interface for Mongoose document (without _id conflict)
interface WhyChooseData {
  userType: string;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface WhyChooseDocument extends Document, WhyChooseData {}

const whyChooseSchema = new Schema<WhyChooseDocument>(
  {
    userType: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    imageAlt: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
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

const WhyChooseModel = mongoose.models.WhyChoose || mongoose.model<WhyChooseDocument>('WhyChoose', whyChooseSchema);

export default WhyChooseModel;
export type { WhyChoose };