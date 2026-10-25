const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
    },

    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      required: true,
      default: [],
    },

    // Total number of comments
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Average rating
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
      default: [],
    },

    // Customer ratings
    ratingEntries: [
      {
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        reviewerToken: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Customer review comments
    reviewEntries: [
      {
        name: {
          type: String,
          default: "Anonymous",
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    description: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;