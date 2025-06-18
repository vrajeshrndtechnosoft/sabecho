// lib/models/Quotation.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
interface SelectedCompany {
  email?: string;
  amount?: number;
  status: string;
  description?: string;
}

interface Quotation {
  selectedCompanies: SelectedCompany[];
  productName?: string;
  averageQty?: number;
  specification?: string;
  measurement?: string;
  reqId?: string;
  requirementId?: Schema.Types.ObjectId;
  pid?: number;
  status: string;
  createdAt: Date;
  commission?: string;
  negotiation?: string;
  minQty?: string;
  hsnCode?: string;
  gstPercentage?: number;
  amount?: string;
  description?: string;
  company?: string;
  pincode?: string;
  buyer_email?: string;
  mobile?: string;
}

interface QuotationDocument extends Document, Quotation {}

const quotationSchema = new Schema<QuotationDocument>({
  selectedCompanies: [
    {
      email: String,
      amount: Number,
      status: { type: String, default: 'pending' },
      description: String,
    },
  ],
  productName: String,
  averageQty: Number,
  specification: String,
  measurement: { type: String },
  reqId: { type: String },
  requirementId: { type: Schema.Types.ObjectId, ref: 'Requirement' },
  pid: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  commission: { type: String },
  negotiation: { type: String },
  minQty: { type: String },
  hsnCode: { type: String },
  gstPercentage: { type: Number },
  amount: { type: String },
  description: { type: String },
  company: { type: String },
  pincode: { type: String },
  buyer_email: { type: String },
  mobile: { type: String },
});

const Quotation = mongoose.models.Quotation || mongoose.model<QuotationDocument>('Quotation', quotationSchema);

export default Quotation;