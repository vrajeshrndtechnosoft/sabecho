// lib/models/QuotaRequirementCollection.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface
interface QuotaRequirementCollection {
  status: string;
  productName: string;
  commission?: number;
  minQty: number;
  seller_email: string;
  amount: number;
  description?: string;
  company?: string;
  measurement?: string;
  pincode?: string;
  reqId?: string;
  specification?: string;
  buyer_email?: string;
  mobile?: string;
  hsnCode?: string;
  gstPercentage?: number;
  negotiation?: boolean;
  pid: number;
  created_at: Date;
  negotiationDetails: object;
}

interface QuotaRequirementCollectionDocument extends Document, QuotaRequirementCollection {}

const quotaRequirementCollectionSchema = new Schema<QuotaRequirementCollectionDocument>({
  status: { type: String, required: true, default: 'Quoted' },
  productName: { type: String, required: true },
  commission: { type: Number },
  minQty: { type: Number, required: true },
  seller_email: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  company: { type: String },
  measurement: { type: String },
  pincode: { type: String },
  reqId: { type: String },
  specification: String,
  buyer_email: { type: String },
  mobile: { type: String },
  hsnCode: { type: String },
  gstPercentage: { type: Number },
  negotiation: { type: Boolean },
  pid: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  negotiationDetails: { type: Object, required: true },
});

const QuotaRequirementCollection =
  mongoose.models.QuotaRequirementCollection ||
  mongoose.model<QuotaRequirementCollectionDocument>('QuotaRequirementCollection', quotaRequirementCollectionSchema);

export default QuotaRequirementCollection;