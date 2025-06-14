import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
interface ImageItem {
  image: {
    url: string;
    altText: string;
  };
  title: string;
  description: string;
}

interface AboutUs {
  title: string;
  description: string;
  listOfImages: ImageItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface AboutUsDocument extends Document, AboutUs {}

const imageItemSchema = new Schema<ImageItem>({
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
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
});

const aboutUsSchema = new Schema<AboutUsDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    listOfImages: [imageItemSchema],
  },
  { timestamps: true },
);

const AboutUs = mongoose.models.AboutUs || mongoose.model<AboutUsDocument>('AboutUs', aboutUsSchema);

export default AboutUs;