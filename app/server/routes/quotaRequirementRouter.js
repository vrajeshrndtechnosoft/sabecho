// routes/api/v1/quotaRequirementCollection.js

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const QuotaRequirementCollection = require("../models/QuotaRequirementCollection");

const {
  sendCustomerQuotationPrice,
} = require("../services/sendProductInquiryEmail");
// POST method to create a new combined collection item
router.post("/quotaRequirement", async (req, res) => {
  try {
    const {
      status,
      productName,
      measurement,
      commission,
      negotiation,
      minQty,
      hsnCode,
      gstPercentage,
      pid,
      seller_email,
      amount,
      description,
      company,
      reqId,
      pincode,
      buyer_email,
      mobile,
    } = req.body;

    const newCombinedItem = new QuotaRequirementCollection({
      status,
      commission,
      measurement,
      negotiation,
      hsnCode,
      gstPercentage,
      pid,
      productName,
      minQty,
      seller_email,
      reqId,
      amount,
      description,
      company,
      pincode,
      buyer_email,
      mobile,
      negotiationDetails:{}
    });
    const savedCombinedItem = await newCombinedItem.save();
    await sendCustomerQuotationPrice(savedCombinedItem);
    res.json(savedCombinedItem);
  } catch (error) {
    console.error("Error creating combined collection item:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/quotaRequirement/get", async (req, res) => {
  try {
    const { email, status } = req.body;

    // Build the query object based on the presence of email and status
    const query = {};
    if (email) query.buyer_email = email;

    let requirements = await QuotaRequirementCollection.find({
      buyer_email: email,
      status: { $in: ["Negotiation", "Quoted",'available'] },
    });

    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/quotaRequirement/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const requirement = await QuotaRequirementCollection.findOne({
      reqId: id,
    });

    if (requirement) {
      res.status(200).json(requirement);
    } else {
      res.status(404).json({ message: "Quota requirement not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/admin/quotaRequirement/:status", async (req, res) => {
  try {
    const requirement = await QuotaRequirementCollection.aggregate([
      {
        $lookup: {
          from: "negotiations",
          localField: "reqId",
          foreignField: "requestInfo.requestId",
          as: "negotiation",
        },
      },
      {
        $match: {
          status: req.params.status,
        },
      },
    ]);
    if (requirement) {
      res.status(200).json(requirement);
    } else {
      res.status(404).json({ message: "Quota requirement not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
