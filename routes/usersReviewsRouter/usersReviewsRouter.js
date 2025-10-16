const express = require("express");
const {
  getReports,
  warnUser,
  tempBanUser,
  verifyReport,
  getReviews,
  approveReview,
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

// Approve a review
usersReviewsRouter.patch("/reviews/:id", verifyToken, approveReview);

// Delete a review
usersReviewsRouter.delete("/reviews/:id", verifyToken, deleteReview);




module.exports = usersReviewsRouter;
