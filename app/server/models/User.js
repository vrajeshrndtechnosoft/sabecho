const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema for User collection
const userSchema = new Schema({
  userId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  name: { type: String, default: "" },
  companyName: { type: String, default: "" },
  mobileNo: { type: String, default: "" },
  gstNo: { type: String, default: "" },
  userType: { type: String, default: "" },
  pincode: { type: String, default: "" },
  billingDetails: { type: String },
  shippingDetails: { type: String },
  profileImage:{type:String},
  verify: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
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
      st: { type: String }
    }
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
  stjCd: { type: String }
});

// Function to generate a random 8-digit number
function generateUserId() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Pre-save hook to generate and set the userId
userSchema.pre('save', async function(next) {
  if (!this.userId) {
    let userId;
    let isUnique = false;
    while (!isUnique) {
      userId = generateUserId();
      // Check if the generated ID already exists
      const existingUser = await this.constructor.findOne({ userId });
      if (!existingUser) {
        isUnique = true;
      }
    }
    this.userId = userId;
  }
  next();
});

// Create a Mongoose model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;