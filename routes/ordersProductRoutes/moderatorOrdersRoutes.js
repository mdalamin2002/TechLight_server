const express = require("express");
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require("../../controllers/ordersProductController/moderatorOrdersController");
const verifyToken = require("../../middlewares/auth");
const isAdmin = require("../../middlewares/admin");
const isModerator = require("../../middlewares/moderator");

const moderatorOrdersRouter = express.Router();

// Get all orders
moderatorOrdersRouter.get("/", verifyToken, isModerator, getAllOrders);

// Get order by ID
moderatorOrdersRouter.get("/:id", verifyToken, isModerator, getOrderById);

// Update order status
moderatorOrdersRouter.patch("/:id/status", verifyToken, isModerator, updateOrderStatus);

// Delete order
moderatorOrdersRouter.delete("/:id", verifyToken, isModerator, deleteOrder);

module.exports = moderatorOrdersRouter;
