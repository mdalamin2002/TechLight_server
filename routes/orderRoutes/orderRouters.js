const express = require('express');
const { createOrder, getAllOrders } = require('../../controllers/orderControllers/orderControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const orderRouter = express.Router();

//create order
orderRouter.post("/",verifyToken,verifyAdmin, createOrder);

//Get all orders 
orderRouter.get("/", verifyToken,verifyAdmin,getAllOrders);

module.exports = orderRouter;