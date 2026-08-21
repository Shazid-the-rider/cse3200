const express = require("express");

const router = express.Router();

const {getAllProducts} = require("../../controllers/user/userProductFetch");

router.get("/products/fetch", getAllProducts);

module.exports = router;