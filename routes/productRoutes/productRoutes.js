const express = require('express');
const { createProduct, getProductsByCategory,getAllProducts, getAllProductsForAdmin, deleteProduct, hardDeleteProduct, getSingleProduct, updateProduct, updateProductStatus, getProductsByOnlyCategory, getTopSellingProducts, getHighRatedProducts, getDiscountedProducts, getSelectedProducts, getProductsBySeller} = require('../../controllers/productControllers/productControllers');
const { searchProducts, getSearchSuggestions, getCategoriesWithCount } = require('../../controllers/productControllers/searchController');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const { increaseStock, decreaseStock } = require('../../controllers/productControllers/productStockHistoryController');
const productRouter = express.Router();

//Create Product
productRouter.post("/", verifyToken, createProduct);

//Get Products by Seller (new route)
productRouter.get("/seller", verifyToken, getProductsBySeller);

//Search products (must come before other GET routes to avoid conflicts)
productRouter.get("/search", searchProducts);

//Get search suggestions for autocomplete
productRouter.get("/search/suggestions", getSearchSuggestions);

//Get categories with product counts (for voice navigation)
productRouter.get("/categories/list", getCategoriesWithCount);

//Get All Product (public list - only approved)
productRouter.get("/", getAllProducts);

//Get All Products for Admin (all statuses)
productRouter.get("/admin/all", verifyToken, verifyAdmin, getAllProductsForAdmin);

//Update Product Status (admin only)
productRouter.patch("/status/:id", verifyToken, verifyAdmin, updateProductStatus);

//Get top selling products
productRouter.get("/top-selling", getTopSellingProducts);

//Get high rated products
productRouter.get("/high-rated", getHighRatedProducts);

//Get discounted products
productRouter.get("/discounted", getDiscountedProducts);

//Get selected/featured products
productRouter.get("/selected", getSelectedProducts);

//Get single product
productRouter.get("/details/:id", getSingleProduct);

//Update product
productRouter.put("/update/:id",verifyToken,verifyAdmin, updateProduct);

// Soft delete Product (keep legacy path for now)
productRouter.patch("/delete/:id",verifyToken,verifyAdmin,deleteProduct)
// Preferred RESTful delete
productRouter.delete("/:id", verifyToken, verifyAdmin, deleteProduct)

// Hard delete Product (permanently remove from database)
productRouter.delete("/admin/hard-delete/:id", verifyToken, verifyAdmin, hardDeleteProduct)

//Get Product data category and subcategory wise
productRouter.get("/:category/:subCategory", getProductsByCategory);

//Get Product data category wise
productRouter.get("/:category", getProductsByOnlyCategory);

//Product increase
productRouter.patch("/:id/increase",verifyToken,verifyAdmin, increaseStock);

//product decrease
productRouter.patch("/:id/decrease",verifyToken,verifyAdmin, decreaseStock);

module.exports = productRouter;
