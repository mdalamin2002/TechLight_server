const express = require('express');
const { createCategory,createSubCategory, getAllCategory } = require('../../controllers/productControllers/categoryController');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const categoryRouter = express.Router();

//create a new category
categoryRouter.post("/", verifyToken, verifyAdmin, createCategory);

//Get all category 
categoryRouter.get("/", getAllCategory);

//create a new subCategory
categoryRouter.patch("/subCategory",verifyToken,verifyAdmin,createSubCategory)

module.exports = categoryRouter;