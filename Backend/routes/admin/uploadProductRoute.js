const express = require("express");

const router = express.Router();

const {uploadProduct} = require("../../controllers/admin/adminProductUpload");
//router.post("/products/upload", uploadProduct);
const upload = require("../../middleware/upload");

/*router.post(
    "/products/upload",
    upload.array("images", 5),
    uploadProduct
);*/
router.post(
    "/products/upload",
    upload.array("images", 5),
    (req, res, next) => {
        console.log("FILES:", req.files);
        console.log("BODY:", req.body);
        next();
    },
    uploadProduct
);

module.exports = router;