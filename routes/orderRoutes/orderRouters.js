const express = require('express');
const { createOrder, getAllOrders } = require('../../controllers/orderControllers/orderControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const orderRouter = express.Router();

//create order
orderRouter.post("/", createOrder);

//Get all orders 
orderRouter.get("/", getAllOrders);

module.exports = orderRouter;