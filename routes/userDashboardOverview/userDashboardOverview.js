const express = require("express");
const { userDashboardOrders, userRecentOrders, } = require("../../controllers/userDashboardOverview/userDashboardOverview");
const verifyAdmin = require("../../middlewares/admin");
const verifyToken = require("../../middlewares/auth");
const userDashboardRouter = express.Router();


//User dashboard orders
userDashboardRouter.get("/:email/orders", verifyToken, userDashboardOrders)

//user recent orders
userDashboardRouter.get("/:email/recent_orders", verifyToken, userRecentOrders)


module.exports = userDashboardRouter;