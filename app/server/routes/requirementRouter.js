const express = require("express");
const router = express.Router();
const Requirement = require("../models/Requirement");
const User = require("../models/User"); // Import the User model
const Product = require("../models/Product"); // Import the Product model

// GET all requirements
router.post("/requirements/get", async (req, res) => {
  try {
    const requirements = await Requirement.find({ email: req.body.email }).sort(
      { createdAt: -1 }
    );
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to update requirement status by ID
router.put("/update-requirement/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find the requirement by ID and update its status
    const requirement = await Requirement.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    res.json({
      message: "Requirement status updated successfully",
      requirement,
    });
  } catch (error) {
    console.error("Error updating requirement status:", error);
    res.status(500).json({ message: "Failed to update requirement status" });
  }
});

router.post("/requirements/one", async (req, res) => {
  try {
    const requirements = await Requirement.findOne({ email: req.body.email });
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// POST requirements by email (not matching)
router.post("/requirementsByEmail", async (req, res) => {
  const { email, status } = req.body;

  try {
    // Find requirements with case-insensitive match for email and status
    const requirements = await Requirement.find({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      status: { $regex: new RegExp(`^${status}$`, "i") },
    }).sort({ createdAt: -1 });

    if (requirements.length === 0) {
      return res.status(404).json({
        message: "No requirements found for the provided email and status",
      });
    }

    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/admin/requirements", async (req, res) => {
  const { email, status } = req.body;

  try {
    // Find requirements with case-insensitive match for email and status
    const requirements = await Requirement.find({
      status: { $regex: new RegExp(`^${status}$`, "i") },
    }).sort({ createdAt: -1 });

    if (requirements.length === 0) {
      return res.status(404).json({
        message: "No requirements found for the provided email and status",
      });
    }

    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/requirementsByEmail/Quoted", async (req, res) => {
  try {
    // Find requirements with case-insensitive match for email and status
    const requirements = await Requirement.find({ status: "Quoted" }).sort({
      createdAt: -1,
    });

    if (requirements.length === 0) {
      return res.status(404).json({
        message: "No requirements found for the provided email and status",
      });
    }

    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET a single requirement
router.get("/requirements/:id", async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }
    res.json(requirement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/requirements/reqId/:reqId", async (req, res) => {
  try {
    const requirement = await Requirement.findOne({reqId:req.params.reqId});
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }
    res.json(requirement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.delete("/requirements/:id", async (req, res) => {
  try {
    const requirement = await Requirement.findByIdAndDelete(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }
    res.json({ message: "Requirement deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Define route to search for requirements by user ID
router.get("/requirements/search/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const requirements = await Product.find({
      name: { $regex: name, $options: "i" },
    })
      .select("name minQty assignedSellers name location")
      .sort({ createdAt: -1 });

    if (!requirements || requirements.length === 0) {
      return res
        .status(404)
        .json({ message: "No requirements found for this search term" });
    }

    // Collect all unique seller IDs
    const sellerIds = [...new Set(requirements.flatMap(req => req.assignedSellers))];

    // Fetch all sellers in one query
    const sellers = await User.find({ _id: { $in: sellerIds } })
      .select("_id name email mobileNo companyName userId"); // Add any other fields you want to include

    // Create a map of seller details for quick lookup
    const sellerMap = sellers.reduce((map, seller) => {
      map[seller._id.toString()] = seller;
      return map;
    }, {});

    // Add seller details to each requirement
    const requirementsWithSellers = requirements.map(req => {
      const reqObject = req.toObject(); // Convert to a plain JavaScript object
      reqObject.assignedSellers = req.assignedSellers.map(sellerId => 
        sellerMap[sellerId.toString()] || { _id: sellerId, name: "Unknown", email: "Unknown" }
      );
      return reqObject;
    });

    res.json(requirementsWithSellers);
  } catch (err) {
    console.error("Error in /requirements/search/:name route:", err);
    res.status(500).json({ message: "An error occurred while processing your request" });
  }
});

router.post("/requirements/offer", async (req, res) => {
  try {
    const { name, status, specification, pid } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name parameter is required" });
    }

    const requirements = await Requirement.aggregate([
      {
        $match: {
          name: name,
          status: status,
          specification: specification,
          pid: pid,
        },
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
        $project: {
          company: 1,
          pincode: 1,
          email: 1,
          mobile: 1,
          // pid: 1,
          hsnCode: "$productDetails.hsnCode",
          gstPercentage: "$productDetails.gstPercentage",
        },
      },
    ]).sort({ createdAt: -1 });

    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
