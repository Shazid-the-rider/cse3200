const express = require("express");

const router = express.Router();

const {uploadProduct} = require("../../controllers/admin/adminProductUpload");
//router.post("/products/upload", uploadProduct);
const upload = require("../../middleware/upload");
const Admin = require("../../models/admin");
/*router.post(
    "/products/upload",
    upload.array("images", 5),
    uploadProduct
);*/

const Product = require("../../models/productModel");


const {
  forgotPassword,
  resetPassword,
} = require("../../controllers/admin/forgotPasswordController");

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);



//rating and reviews
router.post("/products/reviews", async (req, res) => {
  try {
    const { adminId, productId, rating, comment, reviewerToken } =
      req.body;

    if (!adminId || !productId || !reviewerToken) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    const hasRating =
      rating !== undefined && rating !== null;

    const cleanComment =
      typeof comment === "string" ? comment.trim() : "";

    if (
      hasRating &&
      (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5)
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    if (!hasRating && !cleanComment) {
      return res.status(400).json({
        message: "Give a rating or write a review",
      });
    }

    if (cleanComment.length > 2000) {
      return res.status(400).json({
        message: "Review is too long",
      });
    }

    const product = await Product.findOne({
      adminId,
      productId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // One rating per browser token
    if (hasRating) {
      const alreadyRated = product.ratingEntries.some(
        (entry) => entry.reviewerToken === reviewerToken
      );

      if (alreadyRated) {
        return res.status(409).json({
          message: "You have already rated this product",
        });
      }

      product.ratingEntries.push({
        rating: Number(rating),
        reviewerToken,
      });
    }

    // Reviews can be submitted independently
    if (cleanComment) {
      product.reviewEntries.push({
        name: "Anonymous",
        comment: cleanComment,
      });
    }

    const allRatings = product.ratingEntries.map(
      (entry) => entry.rating
    );

    product.ratings = allRatings.length
      ? Number(
          (
            allRatings.reduce((sum, value) => sum + value, 0) /
            allRatings.length
          ).toFixed(1)
        )
      : 0;

    product.reviews = product.reviewEntries.length;

    await product.save();

    return res.status(200).json({
      message: "Rating and review saved successfully",
      ratings: product.ratings,
      reviews: product.reviews,
      reviewEntries: product.reviewEntries,
    });
  } catch (error) {
    console.error("Save rating/review error:", error);

    return res.status(500).json({
      message: "Failed to save rating or review",
    });
  }
});
// Live search: Product ID or Product Name
router.get("/products/search", async (req, res) => {
  try {
    const { q = "", adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({
        message: "Admin ID is required",
      });
    }

    const words = q.trim().split(/\s+/).filter(Boolean);

    const searchConditions = words.map((word) => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      return {
        $or: [
          { productId: { $regex: escaped, $options: "i" } },
          { productName: { $regex: escaped, $options: "i" } },
        ],
      };
    });

    const filter = {
      adminId: String(adminId),
      ...(words.length > 0 ? { $and: searchConditions } : {}),
    };

    const products = await Product.find(filter).sort({
      updatedAt: -1,
    });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.put(
  "/products/:id",
  upload.array("images", 5),
  async (req, res) => {
    try {
      console.log("UPLOADED FILES:", req.files);
      console.log("REQUEST BODY:", req.body);

      const {
        adminId,
        productId,
        productName,
        description,
        stock,
        removedImages,
      } = req.body || {};

      const product = await Product.findOne({
        _id: req.params.id,
        adminId,
      });

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // Existing images থেকে Remove করা images বাদ দাও
      const removed = removedImages
        ? JSON.parse(removedImages)
        : [];

      const existingImages = (product.images || []).filter(
        (image) => !removed.includes(image)
      );

      const uploadedImages = (req.files || []).map(
  (file) => `uploads/products/${file.filename}`
);
console.log("Uploaded image paths:", uploadedImages);
      product.productId = productId;
      product.productName = productName;
      product.description = description;
      product.stock = Number(stock);

      product.images = [
        ...existingImages,
        ...uploadedImages,
      ];

      await product.save();

      return res.json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      console.error("Product update error:", error);

      return res.status(400).json({
        message: error.message || "Product update failed",
      });
    }
  }
);



router.delete("/products/:id", async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({
        message: "Admin ID is required",
      });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      adminId: String(adminId),
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




router.post("/signup", async (req, res) => {
  try {
    const {
      adminId,
      name,
      gmail,
      phone,
      password,
      confirmPassword,
    } = req.body;

    if (
      !adminId ||
      !name ||
      !gmail ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    

    const normalizedGmail = gmail.trim().toLowerCase();

    const existingAdmin = await Admin.findOne({
      $or: [
        { adminId: adminId.trim() },
        { gmail: normalizedGmail },
        { phone: phone.trim() },
      ],
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin ID, Gmail or phone already exists",
      });
    }

    const admin = await Admin.create({
      adminId,
      name,
      gmail: normalizedGmail,
      phone,
      password,
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        gmail: admin.gmail,
        phone: admin.phone,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Admin ID, Gmail or phone already exists",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const value = identifier.trim();

    const admin = await Admin.findOne({
      $or: [
        { gmail: value.toLowerCase() },
        { phone: value },
      ],
    }).select("+password");

    if (!admin || admin.password !== password) {
      return res.status(401).json({
        message: "Invalid Gmail/Phone or Password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      admin: {
        adminId: admin.adminId,
        name: admin.name,
        gmail: admin.gmail,
        phone: admin.phone,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});




router.post(
    "/products/upload",
    upload.array("images", 10),
    (req, res, next) => {
        console.log("FILES:", req.files);
        console.log("BODY:", req.body);
        next();
    },
    uploadProduct
);

module.exports = router;