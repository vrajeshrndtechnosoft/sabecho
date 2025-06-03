const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  selectedCompanies: [
    {
      email: String,
      amount: Number,
      status: {
        type: String,
        default: "pending",
      },
      description: String,
    },
  ],
  productName: String,
  averageQty: Number,
  specification: String,
  measurement: {
    type: String,
  },
  reqId: {
    type: String,
  },
  requirementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Requirement",
  },
  pid: Number,

  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Quotation = mongoose.model("Quotation", quotationSchema);

module.exports = Quotation;
