// lib/models/ContactPage.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
interface Faq {
  question: string;
  answer: string;
}

interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Date;
}

interface ContactPage {
  faqs: Faq[];
  submissions: ContactSubmission[];
}

interface ContactPageDocument extends Document, ContactPage {}

const faqSchema = new Schema<Faq>({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
});

const contactSubmissionSchema = new Schema<ContactSubmission>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const contactPageSchema = new Schema<ContactPageDocument>({
  faqs: [faqSchema],
  submissions: [contactSubmissionSchema],
});

const ContactPage = mongoose.models.ContactPage || mongoose.model<ContactPageDocument>('ContactPage', contactPageSchema);

export default ContactPage;
