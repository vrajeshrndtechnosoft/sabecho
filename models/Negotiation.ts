// lib/models/Negotiation.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
interface ProductDetails {
  productName?: string;
  productId?: string;
  hsnCode?: string;
  measurement?: string;
  gst?: number;
}

interface SellerInfo {
  email?: string;
}

interface RequestInfo {
  requestId?: string;
  createdAt?: Date;
}

interface NegotiationDetails {
  customerOfferPriceWithCommission?: number;
  negotiationAmount?: number;
  negotiationQuantity?: number;
  previewAmount?: number;
  previewQuantity?: number;
  newAmount?: number | null;
  comment?: string;
}

interface AdditionalInfo {
  deliveryInfo?: string;
  description?: string;
}

interface Comments {
  seller?: string;
  admin?: string;
  customer?: string;
}

interface Negotiation {
  sellerEmail: string;
  productDetails: ProductDetails;
  sellerInfo: SellerInfo;
  requestInfo: RequestInfo;
  negotiationDetails: NegotiationDetails;
  additionalInfo: AdditionalInfo;
  status: string;
  comments: Comments;
  commission: number;
  negId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NegotiationDocument extends Document, Negotiation {}

const negotiationSchema = new Schema<NegotiationDocument>({
  sellerEmail: { type: String, required: true },
  productDetails: {
    productName: String,
    productId: String,
    hsnCode: String,
    measurement: String,
    gst: Number,
  },
  sellerInfo: {
    email: String,
  },
  requestInfo: {
    requestId: String,
    createdAt: Date,
  },
  negotiationDetails: {
    customerOfferPriceWithCommission: Number,
    negotiationAmount: Number,
    negotiationQuantity: Number,
    previewAmount: Number,
    previewQuantity: Number,
    newAmount: { type: Number, default: null },
    comment: { type: String, default: '' },
  },
  additionalInfo: {
    deliveryInfo: String,
    description: String,
  },
  status: {
    type: String,
    enum: [
      'admin_pending',
      'seller_email',
      'admin_counter_offer',
      'seller_pending',
      'admin_responded',
      'seller_counter_offer',
      'admin_to_customer_pending',
      'customer_responded',
      'admin_customer_counter_offer',
      'accepted',
      'rejected',
    ],
    default: 'admin_pending',
  },
  comments: {
    seller: { type: String, default: '' },
    admin: { type: String, default: '' },
    customer: { type: String, default: '' },
  },
  commission: { type: Number, default: 0 },
  negId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware for negId
negotiationSchema.pre('save', function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.negId = `${year}${month}${day}NEG${randomNum}`;
  }
  next();
});

const Negotiation = mongoose.models.Negotiation || mongoose.model<NegotiationDocument>('Negotiation', negotiationSchema);

export default Negotiation;