const express = require('express');
const {
    getPayments,
    createPayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    testPayment,
    getPaymentDetails,
    getUserPayments,
    checkProducts,
    getAllPayments,
    getPaymentStats,
} = require('../../controllers/paymentController/paymentController');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');

const paymentRouter = express.Router();

paymentRouter.post("/order", verifyToken, createPayment);
paymentRouter.post("/test", testPayment);
paymentRouter.post("/check-products", checkProducts);

//get all Payments
paymentRouter.get("/", verifyToken, verifyAdmin,getPayments);
paymentRouter.get("/success/:tranId", paymentSuccess);
paymentRouter.post("/success/:tranId", paymentSuccess);
paymentRouter.get("/fail/:tranId", paymentFail);
paymentRouter.post("/fail/:tranId", paymentFail);
paymentRouter.get("/cancel/:tranId", paymentCancel);
paymentRouter.post("/cancel/:tranId", paymentCancel);

paymentRouter.get("/details/:tranId", getPaymentDetails);

// Get all payments for logged-in user
paymentRouter.get("/user/orders", verifyToken, getUserPayments);

// Admin routes
paymentRouter.get("/admin/all", verifyToken, verifyAdmin, getAllPayments);
paymentRouter.get("/admin/stats", verifyToken, verifyAdmin, getPaymentStats);

module.exports = paymentRouter;
