const express = require('express');
const { getUserOrders, getUserOrderById, getUserOrderStats } = require('../../controllers/orderControllers/orderControllers');
const verifyToken = require('../../middlewares/auth');
const userOrderRouter = express.Router();

// Get user's order history with pagination and filtering
// Query parameters: page, limit, status, startDate, endDate, sortBy, sortOrder
userOrderRouter.get("/", verifyToken, getUserOrders);

// Get single order details for user
userOrderRouter.get("/:orderId", verifyToken, getUserOrderById);

// Get user's order statistics
userOrderRouter.get("/stats/summary", verifyToken, getUserOrderStats);

module.exports = userOrderRouter;
