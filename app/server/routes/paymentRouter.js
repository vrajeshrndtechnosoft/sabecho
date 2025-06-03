const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();
const Payment = require("../models/Payment");
const QuotaRequirementCollection = require("../models/QuotaRequirementCollection");
const Requirement = require("../models/Requirement");

const razorpay = new Razorpay({
  key_id: "rzp_test_4kJGZ6vUcstgUm",
  key_secret: "Di3r7vCoOb3t7E1UYJ8v9K6P",
});

// Route to create an order
router.post("/createOrder", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: currency,
      receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch payment details by email
router.post("/paymentDetails", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const payments = await Payment.find({ "orderDetails.buyer_email": email });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch all payments in a date range
router.get("/allPayments", async (req, res) => {
  try {
    const { from, to } = req.query;

    const payments = await razorpay.payments.all({
      from: from,
      to: to,
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to store transaction details and order details
router.post("/savePayment", async (req, res) => {
  try {
    const { paymentId, orderDetails, amount, status } = req.body;

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    // Create a new payment entry
    const newPayment = new Payment({
      paymentId,
      orderDetails: orderDetails,
      amount,
      status,
      paymentDetails: payment,
    });

    // Save the payment entry to the database
    const savedPayment = await newPayment.save();

    // Update status of related QuotaRequirementCollection and Requirement documents
    const updatePromises = orderDetails.map((item) => {
      console.log(item);
      return Promise.all([
        QuotaRequirementCollection.findByIdAndUpdate(item._id, {
          status: "completed",
        }),
        Requirement.findOneAndUpdate(
          { reqId: item.reqId },
          { status: "completed" }
        ),
      ]);
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Return the saved payment
    res.json(savedPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to update payment status
router.patch("/updatePaymentStatus/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    // Update payment status in the database
    const updatedPayment = await Payment.findOneAndUpdate(
      { paymentId },
      { status },
      { new: true }
    );

    // If no payment found, return 404 error
    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Return the updated payment
    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
