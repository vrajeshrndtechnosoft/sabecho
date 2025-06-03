// models/QuotaRequirementCollection.js

const mongoose = require("mongoose");

const quotaRequirementCollectionSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    default: "Quoted",
  },
  productName: {
    type: String,
    required: true,
  },
  commission: {
    type: Number,
    
  },
  minQty: {
    type: Number,
    required: true,
  },
  seller_email: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  company: {
    type: String,
    
  },
  measurement: {
    type: String,
  },
  pincode: {
    type: String,
    
  },
  reqId: {
    type: String,
  },
  specification: String,
  buyer_email: {
    type: String,
    
  },
  mobile: {
    type: String,
  },
  hsnCode: {
    type: String,
  },
  gstPercentage: {
    type: Number,
  },
  negotiation: {
    type: Boolean,
  },
  pid: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  negotiationDetails:{
    type:Object,
    required:true,
  } 
});

const QuotaRequirementCollection = mongoose.model(
  "QuotaRequirementCollection",
  quotaRequirementCollectionSchema
);

module.exports = QuotaRequirementCollection;
