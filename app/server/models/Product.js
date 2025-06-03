const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema for Products table
const productSchema = new Schema({
  pid: {
    type: Number,
    unique: true,
    required: true,
    default: generateDefaultPID,
  },
  userId: { type: String, default: "" },
  name: { type: String, required: true },
  // email: { type: String, default: "" },
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
  hsnCode: { type: String }, // Add HSN code
  gstPercentage: { type: Number }, // Add GST percentage
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assignedSellers: [{type:Object}],
  existingProduct:{type:Boolean},
});

function generateDefaultPID() {
  const timestamp = Date.now();
  return timestamp;
}

// Create models for Products and PriceHistory tables
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
