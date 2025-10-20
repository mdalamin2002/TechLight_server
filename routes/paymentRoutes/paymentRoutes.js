const express = require('express');
const {
    createPayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    testPayment,
    getPaymentDetails,
    getUserPayments,
    checkProducts,
} = require('../../controllers/paymentController/paymentController');
const verifyToken = require('../../middlewares/auth');

const paymentRouter = express.Router();

paymentRouter.post("/order", createPayment);
paymentRouter.post("/test", testPayment);
paymentRouter.post("/check-products", checkProducts);

paymentRouter.get("/success/:tranId", paymentSuccess);
paymentRouter.post("/success/:tranId", paymentSuccess);
paymentRouter.get("/fail/:tranId", paymentFail);
paymentRouter.post("/fail/:tranId", paymentFail);
paymentRouter.get("/cancel/:tranId", paymentCancel);
paymentRouter.post("/cancel/:tranId", paymentCancel);

paymentRouter.get("/details/:tranId", getPaymentDetails);

// Get all payments for logged-in user
paymentRouter.get("/user/orders", verifyToken, getUserPayments);

module.exports = paymentRouter;
