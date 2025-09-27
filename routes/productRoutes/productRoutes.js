const express = require('express');
const { createProduct, accessories } = require('../../controllers/productControllers/productControllers');
const router = express.Router();

router.post("/", createProduct);

router.get("/:category/:subCategory",accessories)

module.exports = router;