import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface (without redefining `_id`)
interface WhyServices {
  _id?: string;
  userType?: string;
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

// Extend Document, and explicitly type _id if needed
interface WhyServicesDocument extends Document {
  _id: string; // or `string` if you're using custom string IDs
  userType?: string;
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

const whyServicesSchema = new Schema<WhyServicesDocument>(
  {
    _id: {
      type: String, // You can keep this if you're using custom string IDs
      required: false,
    },
    userType: {
      type: String,
      required: false,
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

const WhyServices = mongoose.models.WhyServices || mongoose.model<WhyServicesDocument>('WhyServices', whyServicesSchema);

export default WhyServices;