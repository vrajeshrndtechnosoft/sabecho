const express = require("express");
const User = require("../models/User");
const router = express.Router();
const Requirement = require("../models/Requirement");
const CryptoJS = require('crypto-js');
const { encrypt } = require("../utils/encryption");





router.get("/profile/:reqId", async (req, res) => {
    try {
        const { reqId } = req.params;
        const requirement = await Requirement.findOne({ reqId });

        if (!requirement) {
            return res.status(404).json({ error: "Requirement not found" });
        }
        
 

        const user = await User.findOne({ email: requirement.email }).select('email name companyName mobileNo gstNo userType pincode userId').lean();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Encrypt the user data
        const encryptedData = encrypt(user);
        res.status(200).json({ encryptedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/profile", async (req, res) => {
    try {
        const { email } = req.body;

        // Validate the email
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Find the user by email and select specific fields
        const user = await User.findOne({ email }).select('email name companyName mobileNo gstNo userType pincode userId').lean();

        // If user is not found
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Respond with user data
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



module.exports = router;