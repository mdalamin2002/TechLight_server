const express = require('express');
const { createProduct, getProductsByCategory,getAllProducts } = require('../../controllers/productControllers/productControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const router = express.Router();

//Create Product
router.post("/",verifyToken,verifyAdmin, createProduct);

//Get All Product
router.get("/",verifyToken,verifyAdmin, getAllProducts);

//Get Product data category wise
router.get("/:category/:subCategory",getProductsByCategory)

module.exports = router;