const express = require("express");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const { transporter } = require("../config/transporter");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken library
const Requirement = require("../models/Requirement");
const User = require("../models/User");
// Temporary storage for OTPs
const router = express.Router();
const otpMap = new Map();

// Generate OTP endpoint
router.post("/otp/generate", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    // Generate OTP

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const createdAt = Date.now();

    // Store OTP in memory (consider using a more persistent storage for production)
    otpMap.set(email, { otp, createdAt });

    // Example pre-defined OTPs (if necessary)
    otpMap.set("customer@gmail.com", { otp: "123456", createdAt });
    otpMap.set("seller@gmail.com", { otp: "123456", createdAt });
    otpMap.set("admin@gmail.com", { otp: "123456", createdAt });

    // const mailOptions = {
    //   from: "info@sabecho.com",
    //   to: email,
    //   subject: "Email Verification OTP",
    //   text: `Your OTP for email verification is: ${otp}`,
    // };

    // const info = await transporter.sendMail(mailOptions);

    res.status(200).send("OTP sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send OTP");
  }
});

// // Verify OTP endpoint
// router.post('/otp/verify', async (req, res) => {
//     try {
//         let { email, otp, userType } = req.body;
//         const adminEmail = 'pbind4545@gmail.com';
//         const storedOtp = otpMap.get(email);

//         if (email !== adminEmail) {
//             return res.status(403).send('Only the specified admin email can log in.');
//         }

//         if (!storedOtp) {
//             return res.status(404).send('OTP not found. Please generate OTP first.');
//         }

//         const otpExpirationTime = 5 * 60 * 1000; // OTP expires after 5 minutes
//         const isExpired = (Date.now() - storedOtp.createdAt) > otpExpirationTime;

//         if (isExpired) {
//             otpMap.delete(email); // Remove expired OTP from storage
//             return res.status(400).send('OTP has expired. Please generate a new OTP.');
//         }

//         if (otp === storedOtp.otp) {
//             // Find the User document by email
//             let user = await User.findOne({ email });

//             if (!user) {
//                 // Create a new User document with the provided email and userType
//                 user = new User({ email, userType });
//             } else {
//                 // Update the userType if it's different
//                 if (user.userType !== userType) {
//                     user.userType = userType;
//                 }
//             }

//             // Save the User document
//             await user.save();
//             otpMap.delete(email); // Remove verified OTP from storage

//             // Generate JWT token
//             const token = jwt.sign({ email: email, userType: 'admin' }, 'dev', { expiresIn: '7h' });

//             // Send the token as a response
//             res.status(200).json({ token: token });
//         } else {
//             res.status(400).send('Incorrect OTP. Please try again.');
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error verifying OTP');
//     }
// });
router.post("/otp/verify", async (req, res) => {
  try {
    const { email, otp, userType } = req.body;
    // const storedOtp = otpMap.get(email);

    // if (!storedOtp) {
    //   return res.status(404).send("OTP not found. Please generate OTP first.");
    // }

    // const otpExpirationTime = 5 * 60 * 1000; // OTP expires after 5 minutes
    // const isExpired = Date.now() - storedOtp.createdAt > otpExpirationTime;

    // if (isExpired) {
    //   otpMap.delete(email); // Remove expired OTP from storage
    //   return res
    //     .status(400)
    //     .send("OTP has expired. Please generate a new OTP.");
    // }

    // if (otp === storedOtp.otp) {
    //   // Find the User document by email
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if not found
      user = new User({ email, userType });
      await user.save();

      const token = jwt.sign(
        { userId: user._id, email: user.email, userType: userType },
        process.env.JWT_SECRET,
        { expiresIn: "7h" }
      );
      // Send the token as a response
      res.status(200).json({ token });
    } else {
      const token = jwt.sign(
        { userId: user._id, email, userType: userType },
        process.env.JWT_SECRET,
        { expiresIn: "7h" }
      );
      // Send the token as a response
      res.status(200).json({ token });
    }

    //   // If the userType is 'admin', ensure additional checks
    // if (userType === "admin") {
    //   // Check if the user is indeed an admin
    //   if (user.userType !== "admin") {
    //     return res.status(403).send("Not authorized as admin.");
    //   }
    // }

    // Generate JWT token
    // const token = jwt.sign(
    //   { email, userType: userType },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7h" }
    // );

    // Remove verified OTP from storage
    // otpMap.delete(email);

    // Send the token as a response
    // res.status(200).json({ token });
  } catch (error) {
    // else {
    //   res.status(400).send("Incorrect OTP. Please try again.");

    console.error(error);
    res.status(500).send("Error verifying OTP");
  }
});

router.post("/verifyToken", (req, res) => {
  try {
    const { token } = req.body;

    // Check if token exists
    if (!token) {
      return res.status(400).send("Token not provided");
    }
    // Verify the token
    jwt.verify(token, "DEV_SECRET", (err, decoded) => {
      if (err) {
        // Token is invalid or expired
        return res.status(401).json({ message: "Invalid token" });
      } else {
        res.status(200).json(decoded);
      }
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).send("Error verifying token");
  }
});

module.exports = router;
