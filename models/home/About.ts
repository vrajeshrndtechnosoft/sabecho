import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces for the schema
interface NavigationButton {
  label: string;
  link: string;
}

interface Award {
  image: string;
  title: string;
}

interface Milestone {
  icon: string;
  description: string;
  year: string;
}

interface Value {
  icon: string;
  title: string;
}

interface AboutUs {
  headerImage: string;
  whoWeAre: {
    title: string;
    description: string;
    images: string[];
  };
  ourValues: {
    title: string;
    description?: string;
    values: Value[];
  };
  ourJourney: {
    title: string;
    description?: string;
    milestones: Milestone[];
  };
  awardsAndAchievements: {
    title: string;
    awards: Award[];
  };
  navigationButtons: NavigationButton[];
  createdAt: Date;
  updatedAt: Date;
}

// Extend Document for Mongoose
interface AboutUsDocument extends Document, AboutUs {}

// Define the Mongoose schema
const aboutUsSchema = new Schema<AboutUsDocument>({
  headerImage: {
    type: String,
    required: true,
  },
  whoWeAre: {
    title: {
      type: String,
      default: 'Who We Are',
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  ourValues: {
    title: {
      type: String,
      default: 'Our Values',
    },
    description: {
      type: String,
    },
    values: [
      {
        icon: String,
        title: String,
      },
    ],
  },
  ourJourney: {
    title: {
      type: String,
      default: 'Our Journey',
    },
    description: {
      type: String,
    },
    milestones: [
      {
        icon: String,
        description: String,
        year: String,
      },
    ],
  },
  awardsAndAchievements: {
    title: {
      type: String,
      default: 'Awards & Achievements',
    },
    awards: [
      {
        image: String,
        title: String,
      },
    ],
  },
  navigationButtons: [
    {
      label: String,
      link: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` timestamp on save
aboutUsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create or reuse the model
const AboutUs = mongoose.models.Aboutpage || mongoose.model<AboutUsDocument>('Aboutpage', aboutUsSchema);

export default AboutUs;