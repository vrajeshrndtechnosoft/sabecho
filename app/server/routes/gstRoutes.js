const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");

// Route to fetch GST data and save to the user
router.post("/fetch-gst-data", async (req, res) => {
    const { gstNo, userId,mobileNo,name } = req.body.data;
    
    if (!gstNo) {
      return res.status(400).json({ message: "GST Number is required" });
    }
  
    try {
      // Fetch GST data from external API
      const apiUrl = `http://sheet.gstincheck.co.in/check/${process.env.API_KEY_GST}/${gstNo}`;
      const response = await axios.get(apiUrl);
      const gstData = response.data;
  
      if (gstData && gstData.errorMsg) {
        return res.status(400).json({ message: gstData.errorMsg });
      }
  
      // Update user's record in the database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name:name,
          companyName: gstData.data?.lgnm,
          shippingDetails: gstData.data?.pradr?.adr,
          pincode: gstData.data?.pradr?.addr?.pncd,
          gstNo: gstData.data?.gstin,
          mobileNo:mobileNo,
          ...gstData.data,
        },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.json(updatedUser);
    } catch (error) {
      console.error("Error fetching GST data:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;
