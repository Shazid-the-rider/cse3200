const express = require("express");

const router = express.Router();

const {uploadProduct} = require("../../controllers/admin/adminProductUpload");
router.post("/products/upload", uploadProduct);

module.exports = router;