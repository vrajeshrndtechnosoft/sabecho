import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------- PRODUCT INTERFACE ------------------- */
interface IPriceEntry {
  price: number;
  time?: Date;
}

export interface IProduct extends Document {
  pid: number;
  userId: string;
  name: string;
  brand?: string;
  location?: string;
  cPrice?: number;
  description?: string;
  measurements?: string[];
  state?: string;
  region?: string;
  pincode?: string;
  debugger?: string;
  categoryType?: string;
  categorySubType?: string;
  minQty?: number;
  price?: IPriceEntry[];
  categoryId?: string;
  img?: string;
  latLoc?: number;
  tags?: string[];
  currency?: string;
  lastPrice?: number;
  grades?: string[];
  hsnCode?: string;
  gstPercentage?: number;
  createdAt?: Date;
  assignedSellers?: Record<string, unknown>[]; // or a better type if structure is known
  existingProduct?: boolean;
}

/* ----------------- DEFAULT PID GENERATOR ----------------- */
function generateDefaultPID(): number {
  return Date.now();
}

/* -------------------- PRODUCT SCHEMA --------------------- */
const productSchema = new Schema<IProduct>({
  pid: {
    type: Number,
    unique: true,
    required: true,
    default: generateDefaultPID,
  },
  userId: { type: String, default: "" },
  name: { type: String, required: true },
  brand: { type: String, default: "" },
  location: { type: String, default: "" },
  cPrice: { type: Number, default: 0 },
  description: { type: String, default: "" },
  measurements: [{ type: String, default: "" }],
  state: { type: String, default: "" },
  region: { type: String, default: "" },
  pincode: { type: String, default: "" },
  debugger: { type: String, default: "" },
  categoryType: { type: String, default: "" },
  categorySubType: { type: String, default: "" },
  minQty: { type: Number },
  price: [
    {
      price: { type: Number },
      time: { type: Date, default: Date.now },
    },
  ],
  categoryId: { type: String, default: "" },
  img: { type: String, default: "" },
  latLoc: { type: Number },
  tags: [{ type: String, default: "" }],
  currency: { type: String, default: "" },
  lastPrice: { type: Number },
  grades: [{ type: String, default: "" }],
  hsnCode: { type: String },
  gstPercentage: { type: Number },
  createdAt: { type: Date, default: Date.now },
  assignedSellers: [{ type: Schema.Types.Mixed }],
  existingProduct: { type: Boolean },
});

/* --------------------- MODEL EXPORT ---------------------- */
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
