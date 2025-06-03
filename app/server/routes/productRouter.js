const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { Category } = require("../models/Category");
const User = require("../models/User");

router.post("/products", async (req, res) => {
  try {
    const {
      name,
      brand,
      location,
      categoryType,
      categorySubType,
      hsnCode,
      gstPercentage,
    } = req.body;

    // Find the category
    let category = await Category.findOne({ category: categoryType });

    // Find or create the subcategory
    let subCategory = category.subCategory.find(
      (subCat) => subCat.name === categorySubType
    );
    if (!subCategory) {
      subCategory = {
        name: categorySubType,
        products: [],
      };
      category.subCategory.push(subCategory);
    }

    const product = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });


    if(product?.name===name){
      res.status(400).json({message:"Product already exists"});
    }
    // Create product document
    const newProduct = new Product(req.body);

    subCategory.product.push({
      p_name: name,
      barnd: brand,
      location: location,
    });
    newProduct.existingProduct = true;
    // Save category and product
    await category.save();
    await newProduct.save();

    res.status(200).json({
      message: "Product information updated successfully.",
      createdProduct: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
});
router.get("/products/list", async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find().select(
      "name minQty pid measurements"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Oops! Something went wrong. Please try again later." });
  }
});
router.get("/products/code/:pid", async (req, res) => {
  try {
    const pid = req.params.pid; // Extracting pid from request parameters
    // Fetch all products from the database
    const products = await Product.find({ pid: pid }).select(
      "hsnCode gstPercentage"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Oops! Something went wrong. Please try again later." });
  }
});
router.get("/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid; // Extracting pid from request parameters
    // Fetch all products from the database
    const products = await Product.find({ pid: pid });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Oops! Something went wrong. Please try again later." });
  }
});
// router.put("/update-email", async (req, res) => {
//   try {
//     const { email } = req.body;

//     const result = await Product.updateMany({}, { $set: { email: email } });

//     res.status(200).json({ message: "Email updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

router.get("/measurement/list", async (req, res) => {
  try {
    // Fetch all products from the database
    const uniqueNames = await Product.distinct("measurement");
    res.status(200).json(uniqueNames);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Oops! Something went wrong. Please try again later." });
  }
});
router.put('/products/:productId/assignSellers', async (req, res) => {
  try {
    const { productId } = req.params;
    const { data } = req.body;

    if (!data || !Array.isArray(data.assignedSellers)) {
      return res.status(400).json({ message: 'Invalid request body structure' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Merge existing and new assigned sellers
    const existingSellerIds = product.assignedSellers.map(seller => seller.toString());
    const newSellerIds = data.assignedSellers.filter(id => !existingSellerIds.includes(id));

    const updatedAssignedSellers = [...existingSellerIds, ...newSellerIds];

    // Remove duplicates
    const uniqueAssignedSellers = [...new Set(updatedAssignedSellers)];

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: { assignedSellers: uniqueAssignedSellers } },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating assigned sellers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Route to handle POST request to fetch matched product records by email ID
router.post("/products/match", async (req, res) => {
  const { email, type } = req.body;
  try {
    // Assuming there's a User model where email is a field
    const user = await User.findOne({ email });
    if (!user && type != "admin") {
      return res.status(404).json({ message: "User not found." });
    }

    if (type === "admin") {
      const matchedProducts = await Product.find();
      return res.status(200).json(matchedProducts);
    } else {
      const matchedProducts = await Product.find({ email: email });
      res.status(200).json(matchedProducts);
    }
    // Assuming there's a field in the Product model that matches with the user's data, for example, user's preferences or purchases
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Oops! Something went wrong. Please try again later." });
  }
});

// Route to handle GET request to fetch a specific product record by ID
router.get("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (product) {
      // If product with the specified ID exists, return it
      res.status(200).json(product);
    } else {
      // If product with the specified ID doesn't exist, return 404 Not Found
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Oops! Something went wrong. Please try again later." });
  }
});

router.get("/products/:category/:subcategory?/:product?/:city?", async (req, res) => {
  let { category, subcategory, product, city } = req.params;


  try {
    let filter = {};

    // Handle category
    if (category) {
      filter.categoryType = new RegExp(category.replace(/-/g, ' '), 'i');
    }

    // Handle subcategory
    if (subcategory) {
      filter.categorySubType = new RegExp(subcategory.replace(/-/g, ' '), 'i');
    }

    // Handle product name
    if (product) {
      filter.name = new RegExp(product.replace(/-/g, ' ').replace(/&/g, ''), 'i');
    }

    // Handle city
    if (city) {
      filter.location = new RegExp(city, 'i');
    }

    // Adjust limit based on query specificity
    let limit = (city && product && subcategory) ? 0 : 20;

    const count = await Product.countDocuments(filter);

    if (count === 0) {
      const sampleDocs = await Product.find().limit(5).lean();
      return res.status(404).json({ message: "No products found matching the criteria" });
    }

    const products = await Product.find(filter).limit(limit).lean();


    res.json(products);
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});
router.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (deletedProduct) {
      res.status(200).json({ message: "Product deleted successfully." });
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Oops! Something went wrong. Please try again later." });
  }
});

// PUT route to edit product price by ID or record
router.put("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const { price } = req.body;

  try {
    let product;
    if (productId) {
      // Edit product price by ID
      product = await Product.findByIdAndUpdate(
        productId,
        { price },
        { new: true }
      );
    } else {
      // Edit product price by record
      // Provide other criteria to identify the product, like name or brand
      const { name, brand } = req.body;
      product = await Product.findOneAndUpdate(
        { name, brand },
        { price },
        { new: true }
      );
    }

    if (product) {
      res
        .status(200)
        .json({ message: "Product price updated successfully.", product });
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Oops! Something went wrong. Please try again later." });
  }
});

module.exports = router;
