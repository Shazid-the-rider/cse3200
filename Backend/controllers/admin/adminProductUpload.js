const Product = require("../../models/productModel");
const cloudinary = require("../../config/connectedCloudinary");

const uploadProduct = async (req, res) => {
    try {
        const {
            productId,
            productName,
            description,
            stock,
        } = req.body;

        console.log("Controller BODY:", req.body);
        console.log("Controller FILES:", req.files);

        // Check images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required",
            });
        }

        const imageUrls = [];

        // Upload images to Cloudinary
        for (const file of req.files) {

            const result = await new Promise(
                (resolve, reject) => {

                    const stream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder: "products",
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );

                    stream.end(file.buffer);
                }
            );

            imageUrls.push(result.secure_url);
        }

        // Save product in MongoDB
        const product = await Product.create({
            productId,
            productName,
            images: imageUrls,
            description,
            stock: Number(stock),
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
};

module.exports = {
    uploadProduct,
};



/*const Product = require('../../models/productModel');
const cloudinary = require("../../config/connectedCloudinary");


const uploadProduct = async (req, res) => {
    try {

        const { productName, images, description, stock } = req.body;
         console.log("BODY:", req.body);
        console.log("FILES:", req.files);
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
       
// Upload images to Cloudinary
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          stream.end(file.buffer);
        });

        imageUrls.push(result.secure_url);
      }
    }

        const productId = `PROD-${Date.now()}`;

// Create product
        const product = await Product.create({
            productId,
            productName,
            images: imageUrls,
            description,
            stock: Number(stock),
        });

       /* const product = await Product.create({
            productId,
            productName,
            images,
            description,
            stock,
            reviews: 0,
            ratings: 0,
            comments: [],
        });*/

       /* return res.status(201).json({
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

module.exports = {uploadProduct}*/