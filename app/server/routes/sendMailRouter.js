const express = require("express");
const router = express.Router();
const Requirement = require("../models/Requirement");
const { sendProductInquiryEmail } = require("../services/sendProductInquiryEmail");
// const { io } = require("../server"); // Import the io instance
const sendCollaboration =require('../services/SendSellerMail');
router.post("/requirements", async (req, res) => {
    try {
        const newRequirement = new Requirement(req.body);

        // Send the product inquiry email
        await sendProductInquiryEmail(req.body.email, req.body);

        // Save the new requirement to the database
        await newRequirement.save();

        // Respond with the created requirement
        res.status(201).json(newRequirement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.get('/sendcol',async (req, res) => {
    try{

        await sendCollaboration();
        res.json({success:"success",message:"success"});
    }catch(err){
        console.log(err);
    }

});
module.exports = router;
