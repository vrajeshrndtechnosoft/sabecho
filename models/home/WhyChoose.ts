// lib/models/WhyChoose.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface
interface WhyChoose {
  _id: string;
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

interface WhyChooseDocument extends Document, WhyChoose {}

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

const WhyChoose = mongoose.models.WhyChoose || mongoose.model<WhyChooseDocument>('WhyChoose', whyChooseSchema);

export default WhyChoose;