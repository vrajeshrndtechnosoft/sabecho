
const multer = require("multer");
const path=require("path");
const fs=require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // specify the folder to store profile images
  },
  filename: function (req, file, cb) {
    // Generate a unique file name with the original file extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extname = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extname}`); // Store only the file name
  }
});

const upload = multer({ storage: storage });
 module.exports=upload;