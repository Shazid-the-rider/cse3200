const Product = require('../../models/productModel')

const uploadProduct = async (req, res) => {
    try {
        const { productName, images, description, stock } = req.body;
        if (!productName) {
            return res.status(400).json({
                success: false,
                message: 'Product name is required'
            })
        }
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one product image is required'
            })
        }
        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Description is required'
            })
        }
        if (stock === undefined || stock === null || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Valid stock is required",
            });
        }
        const productId = `PROD-${Date.now()}`;
        const product = await Product.create({
            productId,
            productName,
            images,
            description,
            stock,
            reviews: 0,
            ratings: 0,
            comments: [],
        });
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("Create product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message,
        });
    }
}

module.exports = {uploadProduct}