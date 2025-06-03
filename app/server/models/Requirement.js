const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requirementSchema = new Schema({
  name: {
    type: String,
  },
  reqId: {
    type: String,
    unique: true,
  },
  minQty: {
    type: Number,
  },
  company: {
    type: String,
  },
  pincode: {
    type: String,
  },
  gstNo: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
  },
  specification: {
    type: String,
  },
  measurement: {
    type: String,
  },
  userType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  pid: {
    type: Number,
  },
});

// Pre-save middleware to generate reqId
requirementSchema.pre("save", function (next) {
  if (!this.reqId) {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const miliseconds = now.getMilliseconds().toString().padStart(2, "0");
    this.reqId = `${year}${month}${day}REQ${miliseconds}${seconds}`;
  }
  next();
});
const Requirement = mongoose.model("Requirement", requirementSchema);

module.exports = Requirement;
