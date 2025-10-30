const express = require("express");
const {
  getReports,
  warnUser,
  tempBanUser,
  verifyReport,
  getReviews,
  updateReviewStatus,
  deleteReview
} = require("../../controllers/usersReviewsController/usersReviewsController");
const verifyToken = require("../../middlewares/auth");
const usersReviewsRouter = express.Router();

//Get all users-Report
usersReviewsRouter.get("/reports", verifyToken, getReports);

// verify Report
usersReviewsRouter.patch("/reports/:id", verifyToken, verifyReport);

// Warn user
usersReviewsRouter.patch("/users/:id/warn", verifyToken, warnUser);

// Temporarily ban user
usersReviewsRouter.patch("/users/:id/temp-ban", verifyToken, tempBanUser);

//Get all users-reviews
usersReviewsRouter.get("/reviews", verifyToken, getReviews);

// Update a review status (approve, pending, reject)
usersReviewsRouter.patch("/reviews/:id", verifyToken, updateReviewStatus);

// Delete a review
usersReviewsRouter.delete("/reviews/:id", verifyToken, deleteReview);

module.exports = usersReviewsRouter;
