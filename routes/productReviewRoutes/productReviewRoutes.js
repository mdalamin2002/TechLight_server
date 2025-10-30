const express = require('express');
const {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  markReviewHelpful,
  getUserProductReview,
  getAllApprovedReviews,
  getAllReviewsForModerator,
  updateReviewStatus,
  deleteReviewByModerator
} = require('../../controllers/productReviewController/productReviewController');
const verifyToken = require('../../middlewares/auth');
const verifyModerator = require('../../middlewares/moderator');
const productReviewRouter = express.Router();

// Create a new product review (requires authentication)
productReviewRouter.post('/', verifyToken, createProductReview);

// Get all reviews for a specific product (public)
productReviewRouter.get('/product/:productId', getProductReviews);

// Get user's review for a specific product (requires authentication)
productReviewRouter.get('/user/:productId', verifyToken, getUserProductReview);

// Get all approved reviews for homepage (public)
productReviewRouter.get('/homepage', getAllApprovedReviews);

// Get all reviews for moderator dashboard (requires authentication and moderator role)
productReviewRouter.get('/moderator/all', verifyToken, verifyModerator, getAllReviewsForModerator);

// Mark review as helpful (requires authentication)
productReviewRouter.patch('/:reviewId/helpful', verifyToken, markReviewHelpful);

// Update a product review (requires authentication)
productReviewRouter.patch('/:reviewId', verifyToken, updateProductReview);

// Update review status (for moderators - requires authentication and moderator role)
productReviewRouter.patch('/:reviewId/moderator/status', verifyToken, verifyModerator, updateReviewStatus);

// Delete a product review (for moderators - requires authentication and moderator role)
productReviewRouter.delete('/:reviewId/moderator/delete', verifyToken, verifyModerator, deleteReviewByModerator);

// Delete a product review (requires authentication)
productReviewRouter.delete('/:reviewId', verifyToken, deleteProductReview);

module.exports = productReviewRouter;
