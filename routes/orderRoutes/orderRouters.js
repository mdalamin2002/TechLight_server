const express = require('express');
const { createOrder, getAllOrders, getSellerOrders } = require('../../controllers/orderControllers/orderControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const orderRouter = express.Router();

//create order
orderRouter.post("/", verifyToken, createOrder);

//Get all orders
orderRouter.get("/", verifyToken,verifyAdmin,getAllOrders);

// Get seller orders
orderRouter.get("/seller-orders", verifyToken, getSellerOrders);

module.exports = orderRouter;