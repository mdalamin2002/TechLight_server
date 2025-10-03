const express = require('express');
const { createCategory,createSubCategory } = require('../../controllers/productControllers/categoryController');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const categoryRouter = express.Router();

//create a new category
categoryRouter.post("/",verifyToken,verifyAdmin, createCategory);

//create a new subCategory
categoryRouter.patch("/subCategory",verifyToken,verifyAdmin,createSubCategory)

module.exports = categoryRouter;