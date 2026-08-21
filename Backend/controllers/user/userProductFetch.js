const Product = require("./../../models/productModel");

const getAllProducts = async (req, res) => {
    try {

        const products = await Product.find();

        res.status(200).json({
            success: true,
            count: products.length,
            products: products
        });

    } catch (error) {

        console.error("Error fetching products:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

module.exports = {getAllProducts};