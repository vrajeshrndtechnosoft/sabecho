const express = require("express");
const router = express.Router();
const Quotation = require("../models/Quotation");
const Requirement = require("../models/Requirement");
const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/Category");
const News = require("../models/News");
const {
  sendProductQuotationEmail,
} = require("../services/sendProductInquiryEmail");

// Route to submit quotations
router.post("/submit-quotation", async (req, res) => {
  const {
    selectedCompanies,
    requirementId,
    pid,
    productName,
    averageQty,
    specification,
    measurement,
    reqId,
  } = req.body;

  try {
    // Update the status of product data in the database
    await Promise.all(
      selectedCompanies.map(async (company) => {
        await Requirement.updateOne(
          { email: company, name: productName },
          { $set: { status: "Accepted" } }
        );
      })
    );

    // Save quotation data
    const quotationData = selectedCompanies.map((company) => ({
      email: company,
      amount: null, // Initialize with null or appropriate value
      description: "", // Initialize with empty string or appropriate value
      status: "pending", // Initialize with default value
    }));

    const quotation = new Quotation({
      selectedCompanies: quotationData,
      productName,
      averageQty,
      measurement,
      reqId,
      specification,
      requirementId,
      pid,
      status: "pending", // Initialize with default value
    });

    await quotation.save();
    await sendProductQuotationEmail(quotation);
    console.log(quotation);
    res.status(201).json({ message: "Quotation submitted successfully" });
  } catch (error) {
    console.error("Error submitting quotation:", error);
    res.status(500).json({ message: "Failed to submit quotation" });
  }
});

router.post("/quotation/match/:status", async (req, res) => {
  const { email } = req.body;
  const { status } = req.params;
  try {
    const user = await User.findOne({ email: email });
    const results = await Quotation.aggregate([
      {
        $match: {
          "selectedCompanies": {
            $elemMatch: {
              email: email,
              status: status
            }
          }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "pid",
          foreignField: "pid",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $addFields: {
          selectedCompanies: {
            $filter: {
              input: "$selectedCompanies",
              as: "company",
              cond: {
                $and: [
                  { $eq: ["$$company.email", email] },
                  { $eq: ["$$company.status", status] }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          productName: 1,
          status: 1,
          _id: 1,
          pid: 1,
          averageQty: 1,
          specification: 1,
          reqId: 1,
          requirementId: 1,
          measurement: 1,
          selectedCompanies: 1,
          "productDetails.hsnCode": 1,
          "productDetails.gstPercentage": 1,
        },
      },
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to update quotation amount for a specific company
router.post("/update-quotation", async (req, res) => {
  const { email, amount } = req.body;

  try {
    const quotation = await Quotation.findOneAndUpdate(
      { "selectedCompanies.email": email },
      { $set: { "selectedCompanies.$.amount": amount } },
      { new: true }
    );

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    res.json({ message: "Quotation amount updated successfully", quotation });
  } catch (error) {
    console.error("Error updating quotation amount:", error);
    res.status(500).json({ message: "Failed to update quotation amount" });
  }
});

router.get("/countTotal", async function (req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    // const totalCategories = await Category.countDocuments();
    const totalQuotations = await Quotation.countDocuments();
    const totalRequirements = await Requirement.countDocuments();
    const totalNews = await News.countDocuments();

    res.json({
      totalUsers,
      totalProducts,
      // totalCategories,
      totalQuotations,
      totalRequirements,
      totalNews,
    });
  } catch (error) {
    console.error("Error fetching total counts:", error);
    res.status(500).json({ message: "Failed to fetch total counts" });
  }
});
router.post("/updateQuotation", async (req, res) => {
  try {
    const { _id, email, amount, description } = req.body;

 
    // Find the quotation by _id
    const quotation = await Quotation.findById(_id);

    if (!quotation) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    // Find the selected company by email
    const selectedCompany = quotation.selectedCompanies.find(
      (company) => company.email === email
    );

    if (!selectedCompany) {
      return res.status(404).json({ error: "Selected company not found" });
    }

    // Update the selected company fields
    selectedCompany.set({
      amount,
      description,
      status: 'Quoted',
    });

    await quotation.save();

    res.status(200).json({ message: "Quotation updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// GET endpoint to return quoted quotations for a specific email
router.get("/quotedQuotations/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find all quotations with status set to 'Quoted' and matching email
    const quotedQuotations = await Quotation.find({
      "selectedCompanies.status": "Quoted",
      "selectedCompanies.email": email,
    }).sort({ createdAt: -1 });

    res.json(quotedQuotations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET endpoint to retrieve data for admin user
router.get("/adminQuotations/:status", async (req, res) => {
  try {
    const { status } = req.params;
    // Query to find quotations with status set to 'pending'
    const adminQuotations = await Quotation.find({ status: status })
      .populate("selectedCompanies", ["email", "amount", "description"])
      .sort({ createdAt: -1 });

    // If no quotations found, return 404 Not Found
    if (!adminQuotations || adminQuotations.length === 0) {
      return res
        .status(404)
        .json({ message: "No pending quotations found for admin" });
    }

    // Otherwise, return the found quotations
    res.json(adminQuotations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-quotations/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find the quotation by ID and update its status
    const quotation = await Quotation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    console.log(quotation);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    res.json({ message: "Quotation status updated successfully", quotation });
  } catch (error) {
    console.error("Error updating quotation status:", error);
    res.status(500).json({ message: "Failed to update quotation status" });
  }
});

module.exports = router;
