// lib/models/Testimonial.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface
interface Testimonial {
  title: string;
  quote: string;
  name: string;
  position: string;
  backgroundColor: string;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TestimonialDocument extends Document, Testimonial {}

const testimonialSchema = new Schema<TestimonialDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    quote: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    backgroundColor: {
      type: String,
      required: true,
      trim: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Testimonial = mongoose.models.Testimonial || mongoose.model<TestimonialDocument>('Testimonial', testimonialSchema);

export default Testimonial;