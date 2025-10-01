const express = require('express');
const { createProduct, getProductsByCategory,getAllProducts, deleteProduct } = require('../../controllers/productControllers/productControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const productRouter = express.Router();

//Create Product
productRouter.post("/", verifyToken,verifyAdmin,createProduct);

//Get All Product
productRouter.get("/",verifyToken,verifyAdmin, getAllProducts);

//delete Product
productRouter.patch("/delete/:id",verifyToken,verifyAdmin,deleteProduct)

//Get Product data category wise
productRouter.get("/:category/:subCategory",getProductsByCategory);

module.exports = productRouter;