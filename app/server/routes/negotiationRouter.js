const express = require("express");
const router = express.Router();
const Negotiation = require("../models/Negotiation");
const QuotaRequirementCollection = require("../models/QuotaRequirementCollection");
const { verifyToken } = require("../middleware/authMiddleware");
const asyncHandler = require("express-async-handler"); // Make sure you have this middleware


// POST: Create a new negotiation
router.post("/negotiation", asyncHandler(async (req, res) => {
  try {
    const {
      data: {
        negotiationValue,
        yourQty,
        deliveryRelatedInfo,
        messages,
        previewAmount,
        previewQty,
        measurement,
        SellerEmail
      },
      productData,
      orderData
    } = req.body;
    const {reqId}=req.body.orderData;

    // Validate required fields
    if (!SellerEmail || !reqId || !negotiationValue || !yourQty) {
      return res.status(400).json({ message: "Invalid request body" });
    }


    // Find and update the QuotaRequirementCollection
 
    // Find and update the QuotaRequirementCollection
    const quotaRequirementCollection = await QuotaRequirementCollection.findOneAndUpdate(
      { reqId: reqId },
      { status: "Negotiation", negotiation: false },
      { new: true }
    );

    if (!quotaRequirementCollection) {
      return res.status(404).json({ message: "Quota Requirement Collection not found" });
    }

    // Create a new Negotiation
    const newNegotiation = new Negotiation({
      sellerEmail: SellerEmail,
      productDetails: {
        productName: productData.name,
        productId: productData._id,
        hsnCode: orderData.hsnCode || "",
        measurement: measurement || productData.measurement,
        gst: orderData.gstPercentage || 0
      },
      sellerInfo: {
        email: SellerEmail
      },
      requestInfo: {
        requestId: reqId,
        createdAt: new Date()
      },
      negotiationDetails: {
        customerOfferPriceWithCommission:parseFloat(negotiationValue),
        negotiationAmount: parseFloat(negotiationValue),
        negotiationQuantity: parseInt(yourQty),
        previewAmount: parseFloat(previewAmount),
        previewQuantity: parseInt(previewQty),
        comment: messages
      },
      additionalInfo: {
        deliveryInfo: deliveryRelatedInfo,
        description: messages
      },
      comments: {
        customer: messages
      },
      commission: orderData.commission || 0
    });

    // Save the negotiation
    await newNegotiation.save();

    res.status(201).json({
      message: "Negotiation created successfully",
      negotiationId: newNegotiation.negId
    });
  } catch (error) {
    console.error("Error in negotiation creation:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}));


// GET: Fetch negotiations by status and email
router.get(
  "/negotiations/:status",
  asyncHandler(async (req, res) => {
    try {
      const { status } = req.params;
      const { email } = req.query;
      console.log(email);
      console.log(status);
      const negotiations = await Negotiation.find({
        sellerEmail: email,
        status,
      }).select("negotiationDetails productDetails negId");

      res.json(negotiations);
    } catch (err) {
      res.status(500).send(err);
    }
  })
);

router.get(
  "/negotiationAll",
  asyncHandler(async (req, res) => {
    const negotiations = await Negotiation.find();

    if (negotiations.length === 0) {
      return res.status(404).json({ message: "No negotiations found" });
    }

    res.status(200).json(negotiations);
  })
);

router.get(
  "/updateNegotiationStatus/:id/:commission",
  asyncHandler(async (req, res) => {
    const { id, commission } = req.params; // Get id and commission from params

    // Convert the commission to a float and ensure it's a valid percentage
    const commissionPercentage = parseFloat(commission) / 100;

    // Find the current negotiation details to apply the commission
    const negotiation = await Negotiation.findById(id);

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    // Deduct commission percentage from the amounts
    const updatedNegotiationAmount = negotiation.negotiationDetails.negotiationAmount / (1 + commissionPercentage);
    const updatedPreviewAmount = negotiation.negotiationDetails.previewAmount / (1 + commissionPercentage);
      
    // Update negotiation details
    const updatedNegotiation = await Negotiation.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          "negotiationDetails.negotiationAmount": Math.round(updatedNegotiationAmount), // Deduct the commission and round to an integer
          "negotiationDetails.negotiationQuantity": negotiation.negotiationDetails.negotiationQuantity, // Keep the original quantity
          "negotiationDetails.previewAmount": Math.round(updatedPreviewAmount), // Deduct the commission and round to an integer
          "negotiationDetails.previewQuantity": negotiation.negotiationDetails.previewQuantity, // Keep the original quantity
          status: "pending_seller",
        },
      },
      { new: true }
    );

    // Send the updated negotiation back as a response
    res.status(200).json(updatedNegotiation);
  })
);


router.get(
  "/updateNegotiation/:id/:commission",
  asyncHandler(async (req, res) => {
    const { id, commission } = req.params;

    try {
      // Convert the commission to a float
      const newCommissionRate = parseFloat(commission);

      // Find the current negotiation by ID
      const negotiation = await Negotiation.findById(id);

      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }

      // Extract relevant details from negotiationDetails
      const { previewAmount } = negotiation.negotiationDetails;

      // Calculate 5% of the previewAmount
      const deduction = previewAmount * (5 / 100);

      // Calculate the newAmount by subtracting the 5% from the previewAmount
      const newAmount = previewAmount - deduction;

      // Update the negotiation with the newAmount
      const updatedNegotiation = await Negotiation.findByIdAndUpdate(
        id,
        {
          $set: {
            "negotiationDetails.newAmount": newAmount,
            commission: newCommissionRate,
            status: "seller_responded", // Assuming we want to update the status
          }
        },
        { new: true } // This option returns the updated document
      );

      if (!updatedNegotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }

      // Find the quota requirement based on the request ID from negotiation
      const quotaRequirements = await QuotaRequirementCollection.find({
        reqId: negotiation.requestInfo.requestId
      });

      // Update each quota requirement document with the new negotiation details
      await Promise.all(
        quotaRequirements.map(async (quotaRequirement) => {
          await QuotaRequirementCollection.findByIdAndUpdate(
            quotaRequirement._id,
            {
              $set: {
                negotiationDetails: updatedNegotiation.negotiationDetails
              }
            }
          );
        })
      );

      // Send the updated negotiation back as a response
      res.status(200).json(updatedNegotiation);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);



// PUT: Update negotiation
router.put(
  "/negotiations/:id",
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { newAmount, comment } = req.body;

      const updatedNegotiation = await Negotiation.findByIdAndUpdate(
        id,
        {
          $set: {
            "negotiationDetails.newAmount": newAmount,
            "negotiationDetails.comment": comment,
            status: "seller_responded",
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!updatedNegotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }

      res.json(updatedNegotiation);
    } catch (error) {
      console.error("Error updating negotiation:", error);
      res
        .status(500)
        .json({ message: "Error updating negotiation", error: error.message });
    }
  })
);

// PATCH: Update negotiation status
router.patch(
  "/negotiations/:id/status",
  verifyToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedNegotiation = await Negotiation.findByIdAndUpdate(
        id,
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!updatedNegotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }

      res.json(updatedNegotiation);
    } catch (error) {
      console.error("Error updating negotiation status:", error);
      res.status(500).json({
        message: "Error updating negotiation status",
        error: error.message,
      });
    }
  })
);

// DELETE: Remove a negotiation
router.delete(
  "/negotiations/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const deletedNegotiation = await Negotiation.findByIdAndDelete(id);

      if (!deletedNegotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }

      res.json({ message: "Negotiation deleted successfully" });
    } catch (error) {
      console.error("Error deleting negotiation:", error);
      res
        .status(500)
        .json({ message: "Error deleting negotiation", error: error.message });
    }
  })
);

// GET: Retrieve a negotiation for editing
router.get(
  "/negotiations/:id/edit",
  verifyToken,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const negotiation = await Negotiation.findById(id);

      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }

      res.json(negotiation);
    } catch (error) {
      console.error("Error fetching negotiation for editing:", error);
      res.status(500).json({
        message: "Error fetching negotiation for editing",
        error: error.message,
      });
    }
  })
);

module.exports = router;
