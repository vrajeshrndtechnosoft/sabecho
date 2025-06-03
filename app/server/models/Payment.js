const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: String,
  orderId: String,
  amount: Number,

  status: String,
  orderDetails:Object,
  paymentDetails: Object,
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
