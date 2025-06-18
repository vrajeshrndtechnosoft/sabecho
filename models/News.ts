import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  articleId: number;
  dateCreated: number;
  lastModified: number;
  title: string;
  name: string;
  description?: string;
  sourceName: string;
  shares?: number;
  likes?: number;
  imageUrl?: string;
  thumbnail?: string | null;
  smallThumbnail?: string | null;
  byteImage?: Buffer | null;
  detailImage?: Buffer | null;
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
  status?: string;
  url?: string | null;
  redirectionUrl?: string;
  canonicalUrl?: string;
  ogContent?: string;
  shortUrl?: string;
  whatsappExcerpt?: string;
  resizeImage?: boolean;
  youtubeUrl?: string;
  sentimentScore?: number | null;
  sentimentType?: string;
  notificationExcerpt?: string;
  imageDisplayName?: string;
  liked?: boolean;
  bookmarked?: boolean;
  viewed?: boolean;
  createdAt?: Date;
}

const NewsSchema: Schema<INews> = new Schema({
  articleId: { type: Number, required: true, unique: true },
  dateCreated: { type: Number, required: true },
  lastModified: { type: Number, required: true },
  title: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  sourceName: { type: String, required: true },
  shares: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  thumbnail: { type: String, default: null },
  smallThumbnail: { type: String, default: null },
  byteImage: { type: Buffer, default: null },
  detailImage: { type: Buffer, default: null },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  status: { type: String, default: 'publish' },
  url: { type: String, default: null },
  redirectionUrl: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
  ogContent: { type: String, default: '' },
  shortUrl: { type: String, default: '' },
  whatsappExcerpt: { type: String, default: '' },
  resizeImage: { type: Boolean, default: false },
  youtubeUrl: { type: String, default: '' },
  sentimentScore: { type: Number, default: null },
  sentimentType: { type: String, default: 'UNKNOWN' },
  notificationExcerpt: { type: String, default: '' },
  imageDisplayName: { type: String, default: '' },
  liked: { type: Boolean, default: false },
  bookmarked: { type: Boolean, default: false },
  viewed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const News = mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
export default News;
