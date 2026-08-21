const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
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

        reviews: {
            type: Number,
            default: 0,
            min: 0,
        },

        ratings: {
            type: Number,
            default: 0,
            min: 0,
        },

        comments: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Comment",
            default: [],
        },

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