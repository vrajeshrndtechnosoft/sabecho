import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

/* -------------------- USER INTERFACE -------------------- */
export interface IAddress {
  flno?: string;
  lg?: string;
  loc?: string;
  pncd?: string;
  bnm?: string;
  city?: string;
  lt?: string;
  stcd?: string;
  bno?: string;
  dst?: string;
  st?: string;
}

export interface IPrimaryAddress {
  adr?: string;
  addr?: IAddress;
}

export interface IUser extends Document {
  _id: string;
  userId: string;
  email: string;
  password: string;
  name?: string;
  companyName?: string;
  mobileNo?: string;
  gstNo?: string; 
  userType?: string;
  pincode?: string;
  billingDetails?: string;
  shippingDetails?: string;
  profileImage?: string;
  verify: boolean;
  createdAt: Date;
  ntcrbs?: string;
  adhrVFlag?: string;
  lgnm?: string;
  stj?: string;
  dty?: string;
  cxdt?: string;
  gstin?: string;
  nba?: string[];
  ekycVFlag?: string;
  cmpRt?: string;
  rgdt?: string;
  ctb?: string;
  pradr?: IPrimaryAddress;
  sts?: string;
  tradeNam?: string;
  isFieldVisitConducted?: string;
  ctj?: string;
  einvoiceStatus?: string;
  lstupdt?: string;
  adadr?: any[];
  ctjCd?: string;
  errorMsg?: string;
  stjCd?: string;
}

/* -------------------- USER SCHEMA -------------------- */
const userSchema = new Schema<IUser>({
  userId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Removed required: true
  name: { type: String, default: '' },
  companyName: { type: String, default: '' },
  mobileNo: { type: String, default: '' },
  gstNo: { type: String, default: '' },
  userType: { type: String, default: '' },
  pincode: { type: String, default: '' },
  billingDetails: { type: String },
  shippingDetails: { type: String },
  profileImage: { type: String },
  verify: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  ntcrbs: { type: String },
  adhrVFlag: { type: String },
  lgnm: { type: String },
  stj: { type: String },
  dty: { type: String },
  cxdt: { type: String },
  gstin: { type: String },
  nba: [{ type: String }],
  ekycVFlag: { type: String },
  cmpRt: { type: String },
  rgdt: { type: String },
  ctb: { type: String },
  pradr: {
    adr: { type: String },
    addr: {
      flno: { type: String },
      lg: { type: String },
      loc: { type: String },
      pncd: { type: String },
      bnm: { type: String },
      city: { type: String },
      lt: { type: String },
      stcd: { type: String },
      bno: { type: String },
      dst: { type: String },
      st: { type: String },
    },
  },
  sts: { type: String },
  tradeNam: { type: String },
  isFieldVisitConducted: { type: String },
  ctj: { type: String },
  einvoiceStatus: { type: String },
  lstupdt: { type: String },
  adadr: [{ type: Schema.Types.Mixed }],
  ctjCd: { type: String },
  errorMsg: { type: String },
  stjCd: { type: String },
});

/* -------------------- USER ID GENERATOR -------------------- */
function generateUserId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

/* -------------------- PRE-SAVE HOOKS -------------------- */
// Generate unique userId
userSchema.pre<IUser>('save', async function (next) {
  if (!this.userId) {
    let userId: string = '';
    let isUnique = false;

    while (!isUnique) {
      userId = generateUserId();
      const existingUser = await (this.constructor as Model<IUser>).findOne({ userId });
      if (!existingUser) isUnique = true;
    }

    this.userId = userId;
  }
  next();
});

// Hash password if provided
userSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

/* -------------------- MODEL EXPORT -------------------- */
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;