const express = require("express");
const {
  getOrders,
  updateOrderStatus,
  getProducts,
  updateProductStatus,
  getInventoryAlerts,
  handleGetModeratorDashboardStats,
  handleGetModeratorRecentActivities,
  handleGetOrderProcessingProgress
} = require("../../controllers/ordersProductController/ordersProductController");
const verifyToken = require("../../middlewares/auth");

const ordersProductRouter = express.Router();

//Get all orders
ordersProductRouter.get("/orders",verifyToken, getOrders);
//Update order status
ordersProductRouter.patch("/orders/:id/status",verifyToken, updateOrderStatus);

//Get all Products
ordersProductRouter.get("/products",verifyToken,getProducts);
//Update Products status
ordersProductRouter.patch("/products/:id/status",verifyToken,updateProductStatus );

//Get all inventory
ordersProductRouter.get("/inventory-alerts",verifyToken, getInventoryAlerts);

// Moderator Dashboard endpoints
ordersProductRouter.get("/dashboard/stats", verifyToken, handleGetModeratorDashboardStats);
ordersProductRouter.get("/dashboard/activities", verifyToken, handleGetModeratorRecentActivities);
ordersProductRouter.get("/dashboard/progress", verifyToken, handleGetOrderProcessingProgress);

module.exports = ordersProductRouter;
