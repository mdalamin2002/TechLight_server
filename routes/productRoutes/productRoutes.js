const express = require('express');
const { createProduct, getProductsByCategory,getAllProducts, deleteProduct, getSingleProduct, updateProduct, getProductsByOnlyCategory,} = require('../../controllers/productControllers/productControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const { increaseStock, decreaseStock } = require('../../controllers/productControllers/productStockHistoryController');
const productRouter = express.Router();

//Create Product
productRouter.post("/", verifyToken,verifyAdmin,createProduct);

//Get All Product
productRouter.get("/", getAllProducts);

//Get single product
productRouter.get("/details/:id", getSingleProduct);

//Update product 
productRouter.put("/update/:id",verifyToken,verifyAdmin, updateProduct);

//delete Product
productRouter.patch("/delete/:id",verifyToken,verifyAdmin,deleteProduct)

//Get Product data category and subcategory wise
productRouter.get("/:category/:subCategory", getProductsByCategory);

//Get Product data category wise
productRouter.get("/:category", getProductsByOnlyCategory);

//Product increase 
productRouter.patch("/:id/increase",verifyToken,verifyAdmin, increaseStock);

//product decrease 
productRouter.patch("/:id/decrease",verifyToken,verifyAdmin, decreaseStock);

module.exports = productRouter;