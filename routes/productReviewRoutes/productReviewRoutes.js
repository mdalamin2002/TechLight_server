const express = require('express');
const {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  markReviewHelpful,
  getUserProductReview
} = require('../../controllers/productReviewController/productReviewController');
const verifyToken = require('../../middlewares/auth');
const productReviewRouter = express.Router();

// Create a new product review (requires authentication)
productReviewRouter.post('/', verifyToken, createProductReview);

// Get all reviews for a specific product (public)
productReviewRouter.get('/product/:productId', getProductReviews);

// Get user's review for a specific product (requires authentication)
productReviewRouter.get('/user/:productId', verifyToken, getUserProductReview);

// Update a product review (requires authentication)
productReviewRouter.patch('/:reviewId', verifyToken, updateProductReview);

// Delete a product review (requires authentication)
productReviewRouter.delete('/:reviewId', verifyToken, deleteProductReview);

// Mark review as helpful (requires authentication)
productReviewRouter.patch('/:reviewId/helpful', verifyToken, markReviewHelpful);

module.exports = productReviewRouter;
