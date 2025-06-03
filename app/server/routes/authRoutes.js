const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const path=require('path');
const fs = require("fs").promises; // Use fs.promises for async/await

// const verifyTokenUser = require("../middleware/authMiddleware");
const upload=require('../middleware/fileUpload');

const { secret, expiresIn } = require("../config/jwt.config");
const router = express.Router();

// User Registration
router.post("/test", (req, res) => {
  console.log(req.body);
  console.log(req.file);

  res.json({ message: "hello world" });
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    try {
      const { username, email, password, name } = req.body;

      // Check if a user with the same email or username already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const user = new User({
        username,
        email,
        password: hashedPassword,
        name,
      });
      await user.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// POST: Create a new user
router.post("/users", async (req, res) => {
  const { name, email, companyName, mobileNo, gstNo, userType, pincode } =
    req.body;
  try {
    const newUser = new User({
      name: name,
      companyName: companyName,
      mobileNo: mobileNo,
      gstNo: gstNo,
      userType: userType,
      pincode: pincode,
      email: email,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: "Error adding user", error: err });
  }
});
// User Login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    try {
      const { email, password } = req.body;
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Compare the password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }
      // Generate JWT token
      const token = jwt.sign({ userId: user._id, email: user.email }, secret, {
        expiresIn,
      });
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// // Middleware for token verification
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.userId = decoded.userId;
    next();
  });
}
// PUT: Update an existing user
router.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err });
  }
});

router.put(
  "/user/authorized/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
      req.params.id,
      { authorized: true },
      { new: true },
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json(user);
      }
    );
  })
);
// PUT method to update a user by email
// / PUT method to update a user by userId
router.put("/update-users", upload.single("profileImage"), async (req, res) => {
  const { userId } = req.body;
  const profileImage = req.file; // this will be set by multer if the file upload was successful

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    if (profileImage) {
      user.profileImage = profileImage.filename; // Store only the file name
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/image/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = path.resolve(__dirname, "../uploads", filename);

  try {
    // Check if the file exists
    await fs.access(filePath);

    // Serve the image file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err); // Log the error
        res.status(500).json({ message: "Error serving file" });
      }
    });
  } catch (err) {
    // Handle errors such as file not found
    console.error("File not found or error accessing file:", err); // Log the error
    res.status(404).json({ message: "File not found" });
  }
});

router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      // Find the user by ID
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete the user
      await User.deleteOne({ _id: id });

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/users/:type", async (req, res) => {
  try {
    const {type}=req.params;
    const users = await User.find({userType:type});
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Example protected route
router.get("/profile", async (req, res) => {
  try {
    const { email } = req.query; // Retrieve email from query parameters
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.put("/user/:userId/billing", async (req, res) => {
  const { userId } = req.params;
  const { billingAddress, shippingAddress } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update billingDetails if billingAddress is provided
    if (
      billingAddress !== undefined &&
      billingAddress !== null &&
      billingAddress !== ""
    ) {
      user.billingDetails = billingAddress;
    }

    // Only update shippingDetails if shippingAddress is provided
    if (
      shippingAddress !== undefined &&
      shippingAddress !== null &&
      shippingAddress !== ""
    ) {
      user.shippingDetails = shippingAddress;
    }

    await user.save();

    res.status(200).json({ message: "User details updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user details", error });
  }
});

// GET method to retrieve all users

module.exports = router;
